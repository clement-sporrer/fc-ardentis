import { useEffect, useState } from "react";
import { stripBOM, detectCSVDelimiter, parseCSVLine, normalizeString } from "@/lib/utils";

/**
 * Hook to load and count team players from CSV
 * @returns { count: number, loading: boolean }
 */
export function useTeamPlayers() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const TEAM_CSV_URL =
    import.meta.env.VITE_GOOGLE_SHEET_TEAM_CSV_URL ||
    import.meta.env.VITE_TEAM_CSV_URL ||
    import.meta.env.VITE_SHEET_TEAM_CSV_URL ||
    "";

  useEffect(() => {
    const loadPlayers = async () => {
      if (!TEAM_CSV_URL) {
        setCount(0);
        setLoading(false);
        return;
      }

      try {
        const url = `${TEAM_CSV_URL}${TEAM_CSV_URL.includes("?") ? "&" : "?"}_ts=${Date.now()}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          console.warn(`Team players fetch failed: HTTP ${res.status}`);
          setCount(0);
          setLoading(false);
          return;
        }
        const raw0 = await res.text();
        if (!raw0 || raw0.trim().length === 0) {
          console.warn("Team players response is empty");
          setCount(0);
          setLoading(false);
          return;
        }
        const raw = stripBOM(raw0).replace(/\r/g, "");
        const lines = raw.split("\n").filter((l) => l.trim().length > 0);

        if (lines.length < 2) {
          setCount(0);
          setLoading(false);
          return;
        }

        const delim = detectCSVDelimiter(lines[0]);
        const header = parseCSVLine(lines[0], delim).map(normalizeString);

        const idxOf = (...keys: string[]) => {
          for (const k of keys) {
            const pos = header.indexOf(k);
            if (pos >= 0) return pos;
          }
          return -1;
        };

        const iPre = idxOf("prenom", "prénom");
        const iNom = idxOf("nom");
        const iPhoto = idxOf("photo_url", "photo", "image", "image_url");
        const iNum = idxOf("numero", "numéro");

        let playerCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const cells = parseCSVLine(lines[i], delim);
          const prenom = iPre >= 0 ? cells[iPre]?.trim() : "";
          const nom = iNom >= 0 ? cells[iNom]?.trim() : "";
          const photo = iPhoto >= 0 ? cells[iPhoto]?.trim() : "";
          const numero = iNum >= 0 && cells[iNum] !== "" ? Number(cells[iNum]) : null;

          // Count as player if has at least one of: prenom, nom, photo, or numero
          if (prenom || nom || photo || numero != null) {
            playerCount++;
          }
        }

        setCount(playerCount);
      } catch (error) {
        console.error("Error loading team players count:", error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, [TEAM_CSV_URL]);

  return { count, loading };
}

