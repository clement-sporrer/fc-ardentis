import { useEffect, useRef, useCallback } from "react";
import type { RelayPoint } from "@/contexts/CartContext";

declare global {
  interface Window {
    __onMRPointSelected?: (data: MRWidgetData) => void;
    jQuery?: unknown;
    $?: (selector: string) => MRJQuery;
  }
}

interface MRWidgetData {
  ID: string;
  Nom: string;
  Adresse1: string;
  Adresse2: string;
  CP: string;
  Ville: string;
  Pays: string;
}

interface MRJQuery {
  MR_ParcelShopPicker: (options: MRWidgetOptions) => void;
  trigger: (event: string, ...args: unknown[]) => MRJQuery;
}

interface MRWidgetOptions {
  Target: string;
  Brand: string;
  Country: string;
  Theme: string;
  Responsive: boolean;
  ShowResultsOnMap: boolean;
  PostCode?: string;
  OnParcelShopSelected?: (data: MRWidgetData) => void;
}

const WIDGET_ZONE_ID = "Zone_Widget";
const TARGET_INPUT_ID = "Retour_Widget";

function mapWidgetDataToRelayPoint(data: MRWidgetData): RelayPoint {
  const country = String(data.Pays ?? "").toUpperCase();
  const idNum = String(data.ID ?? "").replace(/\D/g, "").slice(0, 6);
  const id = country && idNum ? `${country}-${idNum.padStart(6, "0")}` : `${country}-000000`;
  return {
    id,
    name: String(data.Nom ?? "").trim(),
    address1: String(data.Adresse1 ?? "").trim(),
    address2: String(data.Adresse2 ?? "").trim(),
    postcode: String(data.CP ?? "").trim(),
    city: String(data.Ville ?? "").trim(),
    country,
  };
}

const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const JQUERY_JS = "https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js";
const MR_WIDGET_JS =
  "https://widget.mondialrelay.com/parcelshop-picker/jquery.plugin.mondialrelay.parcelshoppicker.min.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

function loadCss(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve();
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load css: ${href}`));
    document.head.appendChild(link);
  });
}

export type MondialRelayWidgetProps = {
  onPointSelected: (point: RelayPoint | null) => void;
  selectedPoint: RelayPoint | null;
  defaultPostcode?: string;
};

export function MondialRelayWidget({
  onPointSelected,
  selectedPoint,
  defaultPostcode,
}: MondialRelayWidgetProps) {
  const mounted = useRef(true);
  const widgetInitialized = useRef(false);
  const brand = import.meta.env.VITE_MONDIAL_RELAY_BRAND ?? "BDTEST  ";

  const handleMRSelect = useCallback(
    (data: MRWidgetData) => {
      if (!mounted.current) return;
      try {
        const point = mapWidgetDataToRelayPoint(data);
        onPointSelected(point);
      } catch {
        onPointSelected(null);
      }
    },
    [onPointSelected]
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await loadCss(LEAFLET_CSS);
        await loadScript(JQUERY_JS);
        await loadScript(LEAFLET_JS);
        await loadScript(MR_WIDGET_JS);
      } catch (err) {
        if (mounted.current) onPointSelected(null);
        console.error("Mondial Relay widget scripts failed to load:", err);
        return;
      }

      if (cancelled || !mounted.current) return;

      window.__onMRPointSelected = handleMRSelect;

      const $ = window.$ ?? (window as unknown as { jQuery: (selector: string) => MRJQuery }).jQuery;
      if (typeof $ !== "function") {
        console.error("jQuery not available after script load");
        return;
      }

      const zone = document.getElementById(WIDGET_ZONE_ID);
      if (!zone) return;

      if (widgetInitialized.current) {
        try {
          $(`#${WIDGET_ZONE_ID}`).trigger("MR_RebindMap");
        } catch {
          // ignore
        }
        return;
      }

      try {
        ($ as (s: string) => MRJQuery)(`#${WIDGET_ZONE_ID}`).MR_ParcelShopPicker({
          Target: `#${TARGET_INPUT_ID}`,
          Brand: String(brand).slice(0, 8).padEnd(8, " "),
          Country: "FR",
          Theme: "mondialrelay",
          Responsive: true,
          ShowResultsOnMap: true,
          PostCode: defaultPostcode ?? "",
          OnParcelShopSelected: (data: MRWidgetData) => {
            window.__onMRPointSelected?.(data);
          },
        });
        widgetInitialized.current = true;
      } catch (err) {
        console.error("Mondial Relay widget init failed:", err);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [handleMRSelect, defaultPostcode, brand]);

  return (
    <div className="mt-4 space-y-2">
      <input
        type="hidden"
        id={TARGET_INPUT_ID}
        value={selectedPoint?.id ?? ""}
        readOnly
        aria-hidden
      />
      <div
        id={WIDGET_ZONE_ID}
        className="min-h-[320px] w-full rounded-xl border border-border bg-muted/20 p-2"
        aria-label="Choisir un point relais Mondial Relay"
      />
    </div>
  );
}
