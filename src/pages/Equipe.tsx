import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

/** ====== URL CSV publié (on supporte plusieurs variables pour ne rien casser) ====== */
const TEAM_CSV_URL =
  import.meta.env.VITE_GOOGLE_SHEET_TEAM_CSV_URL ||
  import.meta.env.VITE_TEAM_CSV_URL ||
  import.meta.env.VITE_SHEET_TEAM_CSV_URL ||
  "";

/** ====== Types ====== */
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
  // stats
  matchs_joues?: number;
  buts?: number;
  passes_decisives?: number;
}

/** ====== Utils robustes CSV ====== */
const stripBOM = (s: string) => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);
const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .trim();

const detectDelim = (headerLine: string) => {
  const cCommas = (headerLine.match(/,/g) || []).length;
  const cSemis = (headerLine.match(/;/g) || []).length;
  return cSemis > cCommas ? ";" : ",";
};

const splitCSVLine = (line: string, delim: string): string[] => {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === delim && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
};

const posteToFr = (p?: RawPoste) => {
  const k = norm(p || "");
  if (k === "goalkeeper") return "Gardien de but";
  if (k === "defender") return "Défenseur";
  if (k === "midfielder") return "Milieu de terrain";
  if (k === "forward") return "Attaquant";
  if (k === "defenseur") return "Défenseur";
  if (["gardien_de_but", "milieu_de_terrain", "attaquant", "défenseur", "defenseur"].includes(k)) return (p as string) || "Poste";
  return (p as string) || "Poste";
};

const ORDER_SECTIONS = ["Gardien de but", "Défenseur", "Milieu de terrain", "Attaquant"];

/** ====== Page ====== */
const Equipe = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Player | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!TEAM_CSV_URL) {
        setLoading(false);
        setError(null);
        return;
      }
      try {
        const url = `${TEAM_CSV_URL}${TEAM_CSV_URL.includes("?") ? "&" : "?"}_ts=${Date.now()}`;
        const res = await fetch(url, { cache: "no-store" });
        const raw0 = await res.text();
        const raw = stripBOM(raw0).replace(/\r/g, "");
        const lines = raw.split("\n").filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setPlayers([]);
          setError(null);
          return;
        }

        const delim = detectDelim(lines[0]);
        const headerOriginal = splitCSVLine(lines[0], delim);
        const header = headerOriginal.map(norm);

        const idxOf = (...keys: string[]) => {
          for (const k of keys) {
            const pos = header.indexOf(k);
            if (pos >= 0) return pos;
          }
          return -1;
        };

        // Colonnes attendues (et variantes tolérées)
        const iNum = idxOf("numero", "numéro");
        const iPre = idxOf("prenom", "prénom");
        const iNom = idxOf("nom");
        const iPoste = idxOf("poste");
        const iPhoto = idxOf("photo_url", "photo", "image", "image_url");
        const iOrig = idxOf("origine", "origin");
        const iFun = idxOf("fun_fact", "funfact", "histoire", "bio");
        const iFav = idxOf("joueur_prefere", "joueur_préféré", "favorite_player", "joueur_favori");
        // Nouvelles colonnes stats
        const iMatchs = idxOf("matchs_joues", "matches_joues", "matchs", "matches_played", "nb_matchs", "nbre_matchs");
        const iButs = idxOf("buts", "nb_buts", "goals");
        const iPasses = idxOf("passes_decisives", "passes_décisives", "passes", "assists");

        const parsed: Player[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cells = splitCSVLine(lines[i], delim);
          const p: Player = {
            numero: iNum >= 0 && cells[iNum] !== "" ? Number(cells[iNum]) : undefined,
            prenom: iPre >= 0 ? cells[iPre] || "" : "",
            nom: iNom >= 0 ? cells[iNom] || "" : "",
            poste: iPoste >= 0 ? cells[iPoste] || "" : "",
            photo_url: iPhoto >= 0 ? cells[iPhoto] || "" : "",
            origine: iOrig >= 0 ? cells[iOrig] || "" : "",
            fun_fact: iFun >= 0 ? cells[iFun] || "" : "",
            joueur_prefere: iFav >= 0 ? cells[iFav] || "" : "",
            matchs_joues: iMatchs >= 0 && cells[iMatchs] !== "" ? Number(cells[iMatchs]) : undefined,
            buts: iButs >= 0 && cells[iButs] !== "" ? Number(cells[iButs]) : undefined,
            passes_decisives: iPasses >= 0 && cells[iPasses] !== "" ? Number(cells[iPasses]) : undefined,
          };
          if ((p.prenom && p.prenom.trim()) || (p.nom && p.nom.trim()) || (p.photo_url && p.photo_url.trim()) || p.numero != null) {
            parsed.push(p);
          }
        }

        // Tri par numéro puis nom
        parsed.sort((a, b) => {
          if (a.numero != null && b.numero != null) return a.numero - b.numero;
          return (a.nom || "").localeCompare(b.nom || "");
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

  // Groupement par poste
  const grouped = useMemo(() => {
    const g: Record<string, Player[]> = {};
    for (const p of players) {
      const key = posteToFr(p.poste);
      if (!g[key]) g[key] = [];
      g[key].push(p);
    }
    for (const k of Object.keys(g)) {
      g[k].sort((a, b) => {
        if (a.numero != null && b.numero != null) return a.numero - b.numero;
        return (a.nom || "").localeCompare(b.nom || "");
      });
    }
    return g;
  }, [players]);

  return (
    <div className="min-h-screen">
      {/* Hero aligné */}
      <section className="bg-gradient-hero py-20 md:py-28 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
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
            <>
              {/* Cartes par sections (sous-titres plus grands) */}
              {ORDER_SECTIONS.map((section) => {
                const list = grouped[section] || [];
                if (list.length === 0) return null;
                return (
                  <div key={section} className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-sport-condensed font-bold text-foreground mb-6 uppercase tracking-wide">
                      {section}
                    </h2>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {list.map((p, idx) => (
                        <Card
                          key={`${section}-${idx}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelected(p)}
                          onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? setSelected(p) : null)}
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

                            {/* image carrée dans la carte (clic aussi dessus) */}
                            <div className="mt-4 w-full aspect-square overflow-hidden rounded-xl bg-muted/40 flex items-center justify-center">
                              {p.photo_url ? (
                                <img
                                  src={p.photo_url}
                                  alt={`${(p.prenom || "").trim()} ${(p.nom || "").trim()}`}
                                  className="h-full w-full object-cover"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelected(p);
                                  }}
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
              })}

              {/* Tableau statistiques global (en dessous) */}
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-sport-condensed font-bold text-foreground mb-6">
                    Statistiques individuelles
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/20 bg-primary/5">
                          <th className="text-left py-2 px-2 font-sport-condensed font-bold text-foreground">#</th>
                          <th className="text-left py-2 px-2 font-sport-condensed font-bold text-foreground">Prénom</th>
                          <th className="text-left py-2 px-2 font-sport-condensed font-bold text-foreground">Nom</th>
                          <th className="text-left py-2 px-2 font-sport-condensed font-bold text-foreground">Poste</th>
                          <th className="text-center py-2 px-2 font-sport-condensed font-bold text-foreground">Matchs joués</th>
                          <th className="text-center py-2 px-2 font-sport-condensed font-bold text-foreground">Buts</th>
                          <th className="text-center py-2 px-2 font-sport-condensed font-bold text-foreground">Passes décisives</th>
                        </tr>
                      </thead>
                      <tbody>
                        {players.map((p, idx) => (
                          <tr key={`row-${idx}`} className="border-b border-border/10 odd:bg-white even:bg-muted/20">
                            <td className="py-2 px-2 font-sport">{p.numero ?? "—"}</td>
                            <td className="py-2 px-2 font-sport">{(p.prenom || "").trim()}</td>
                            <td className="py-2 px-2 font-sport">{(p.nom || "").trim()}</td>
                            <td className="py-2 px-2 font-sport">{posteToFr(p.poste)}</td>
                            <td className="text-center py-2 px-2 font-sport">{p.matchs_joues ?? 0}</td>
                            <td className="text-center py-2 px-2 font-sport">{p.buts ?? 0}</td>
                            <td className="text-center py-2 px-2 font-sport">{p.passes_decisives ?? 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground font-sport mt-3">
                    Remplis dans Google Sheets les colonnes <span className="font-medium">matchs_joues</span>, <span className="font-medium">buts</span> et <span className="font-medium">passes_decisives</span>. Les champs vides sont affichés à <span className="font-medium">0</span>.
                  </p>
                </CardContent>
              </Card>
            </>
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
              ) : (
                "Joueur"
              )}
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
