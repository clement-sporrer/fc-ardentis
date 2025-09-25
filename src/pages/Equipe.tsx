import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

// URL CSV publié de ton Google Sheet Équipe (File > Publish to the web > CSV)
const TEAM_CSV_URL = import.meta.env.VITE_GOOGLE_SHEET_TEAM_CSV_URL || "";

type RawPoste = "Goalkeeper" | "Defender" | "Midfielder" | "Forward" | string;

interface Player {
  numero?: number;
  prenom?: string;
  nom?: string;
  poste?: RawPoste;
  photo_url?: string;
  origine?: string;
  fun_fact?: string;
  joueur_prefere?: string;
}

const posteToFr = (p?: RawPoste) => {
  const k = (p || "").toLowerCase().trim();
  if (k === "goalkeeper") return "Gardien de but";
  if (k === "defender") return "Défenseur";
  if (k === "midfielder") return "Milieu de terrain";
  if (k === "forward") return "Attaquant";
  // Si déjà FR, on laisse (et on corrige orthographe de "defenseur")
  if (k === "defenseur") return "Défenseur";
  if (["gardien de but","défenseur","milieu de terrain","attaquant"].includes(k)) return p as string;
  return p || "Poste";
};

const ORDER_SECTIONS = ["Gardien de but", "Défenseur", "Milieu de terrain", "Attaquant"];

// Parse CSV robuste (gère les champs "entre guillemets, avec, virgules")
const parseCSVLine = (line: string): string[] => {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'; i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      out.push(cur); cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map(s => s.trim());
};

const Equipe = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Player | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!TEAM_CSV_URL) { setLoading(false); return; }
      try {
        const url = `${TEAM_CSV_URL}${TEAM_CSV_URL.includes("?") ? "&" : "?"}_ts=${Date.now()}`;
        const res = await fetch(url, { cache: "no-store" });
        const raw = await res.text();

        const lines = raw.replace(/\r/g, "").split("\n").filter(l => l.trim().length > 0);
        if (lines.length < 2) { setPlayers([]); setLoading(false); return; }

        const header = parseCSVLine(lines[0]);
        // Colonnes attendues (exactement comme ton sheet) :
        // numéro, prenom, nom, poste, photo_url, origine, fun_fact, joueur_prefere
        const col = (name: string) => header.findIndex(h => h.trim().toLowerCase() === name.toLowerCase());

        const iNum = col("numéro");
        const iPrenom = col("prenom");
        const iNom = col("nom");
        const iPoste = col("poste");
        const iPhoto = col("photo_url");
        const iOrigine = col("origine");
        const iFun = col("fun_fact");
        const iFav = col("joueur_prefere");

        const parsed: Player[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cells = parseCSVLine(lines[i]);
          const p: Player = {
            numero: iNum >= 0 && cells[iNum] ? Number(cells[iNum]) : undefined,
            prenom: iPrenom >= 0 ? cells[iPrenom] || "" : "",
            nom: iNom >= 0 ? cells[iNom] || "" : "",
            poste: iPoste >= 0 ? (cells[iPoste] || "") : "",
            photo_url: iPhoto >= 0 ? (cells[iPhoto] || "") : "",
            origine: iOrigine >= 0 ? (cells[iOrigine] || "") : "",
            fun_fact: iFun >= 0 ? (cells[iFun] || "") : "",
            joueur_prefere: iFav >= 0 ? (cells[iFav] || "") : "",
          };
          // On ignore une ligne totalement vide
          if (p.prenom || p.nom || p.photo_url || p.numero != null) parsed.push(p);
        }

        // Tri par numéro si dispo, sinon par nom
        parsed.sort((a,b) => {
          if (a.numero != null && b.numero != null) return a.numero - b.numero;
          return (a.nom||"").localeCompare(b.nom||"");
        });

        setPlayers(parsed);
        setError(null);
      } catch (e) {
        console.error(e);
        setError("Erreur lors du chargement de l'équipe");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Groupement par poste FR + tri interne
  const grouped = useMemo(() => {
    const g: Record<string, Player[]> = {};
    for (const p of players) {
      const key = posteToFr(p.poste);
      if (!g[key]) g[key] = [];
      g[key].push(p);
    }
    for (const k of Object.keys(g)) {
      g[k].sort((a,b) => {
        if (a.numero != null && b.numero != null) return a.numero - b.numero;
        return (a.nom||"").localeCompare(b.nom||"");
      });
    }
    return g;
  }, [players]);

  return (
    <div className="min-h-screen">
      {/* Hero aligné aux autres pages */}
      <section className="bg-gradient-hero py-28 md:py-36 px-4 text-center">
        <div className="container max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-sport-condensed font-bold text-white mb-3">
            <span className="text-white">Notre </span>
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">équipe</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-sport max-w-3xl mx-auto">
            Découvrez les joueurs qui composent notre club.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-section">
        <div className="container max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground font-sport">Chargement…</div>
          ) : error ? (
            <div className="text-center py-12 text-destructive font-sport inline-flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> {error}
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-sport">Aucun joueur pour le moment.</div>
          ) : (
            ORDER_SECTIONS.map((section) => {
              const list = grouped[section] || [];
              if (list.length === 0) return null;
              return (
                <div key={section} className="mb-12">
                  <h2 className="text-[1.45rem] md:text-3xl font-sport-condensed font-bold text-foreground mb-6 uppercase tracking-wide">
                    {section}
                  </h2>

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {list.map((p, idx) => (
                      <Card
                        key={`${section}-${idx}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelected(p)}
                        onKeyDown={(e) => ((e.key === "Enter" || e.key === " ") ? setSelected(p) : null)}
                        className="
                          transition-sport hover:-translate-y-0.5 hover:shadow-md cursor-pointer
                          bg-white bg-[radial-gradient(120%_120%_at_50%_0%,#888ce6_0%,transparent_55%)]
                          border border-[#888ce6]/35 rounded-2xl
                          outline-none focus:ring-2 focus:ring-primary/50
                        "
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="shrink-0 h-12 w-12 rounded-full bg-primary text-white font-sport-condensed font-bold flex items-center justify-center">
                              {p.numero ?? "—"}
                            </div>
                            <div className="flex-1">
                              <div className="font-sport-condensed font-bold text-lg leading-tight">
                                {(p.prenom || "").trim()} {(p.nom || "").trim()}
                              </div>
                              <div className="text-xs text-muted-foreground">{posteToFr(p.poste)}</div>
                            </div>
                          </div>

                          {/* image carrée dans la carte */}
                          <div className="mt-4 w-full aspect-square overflow-hidden rounded-xl bg-muted/40 flex items-center justify-center">
                            {p.photo_url ? (
                              <img
                                src={p.photo_url}
                                alt={`${(p.prenom || "").trim()} ${(p.nom || "").trim()}`}
                                className="h-full w-full object-cover"
                                onClick={(e) => { e.stopPropagation(); setSelected(p); }}
                              />
                            ) : (
                              <div className="text-xs text-muted-foreground font-sport">Photo indisponible</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Modal joueur — photo carrée à gauche, infos à droite (md+) */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-sport-condensed font-bold text-foreground">
              {selected ? (
                <>
                  #{selected.numero ?? "—"} {(selected.prenom || "").trim()} {(selected.nom || "").trim()}
                </>
              ) : "Joueur"}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="flex flex-col md:flex-row gap-5">
              {/* Photo à gauche (carrée) */}
              <div className="w-full md:w-1/2 lg:w-5/12">
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center">
                  {selected.photo_url ? (
                    <img
                      src={selected.photo_url}
                      alt={`${(selected.prenom || "").trim()} ${(selected.nom || "").trim()}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground font-sport">Photo indisponible</div>
                  )}
                </div>
              </div>

              {/* Infos à droite */}
              <div className="w-full md:flex-1 grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between text-sm font-sport">
                  <span className="text-muted-foreground">Poste</span>
                  <span className="font-medium">{posteToFr(selected.poste)}</span>
                </div>

                {selected.origine && selected.origine.trim() !== "" && (
                  <div className="flex items-center justify-between text-sm font-sport">
                    <span className="text-muted-foreground">Origine</span>
                    <span className="font-medium">{selected.origine}</span>
                  </div>
                )}

                {selected.joueur_prefere && selected.joueur_prefere.trim() !== "" && (
                  <div className="flex items-center justify-between text-sm font-sport">
                    <span className="text-muted-foreground">Joueur préféré</span>
                    <span className="font-medium">{selected.joueur_prefere}</span>
                  </div>
                )}

                {selected.fun_fact && selected.fun_fact.trim() !== "" && (
                  <div className="text-sm font-sport">
                    <div className="text-muted-foreground mb-1">Fun fact</div>
                    <div className="font-medium">{selected.fun_fact}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Equipe;
