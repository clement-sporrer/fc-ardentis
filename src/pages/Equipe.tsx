import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Users, Star, Trophy, Target, Filter, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/** ====== URL CSV publié ====== */
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
  matchs_joues?: number;
  buts?: number;
  passes_decisives?: number;
}

/** ====== Utils ====== */
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
  return (p as string) || "Poste";
};

const posteIcon = (p?: RawPoste) => {
  const k = norm(p || "");
  if (k === "goalkeeper") return "🧤";
  if (k === "defender") return "🛡️";
  if (k === "midfielder") return "⚡";
  if (k === "forward") return "⚽";
  return "🏃";
};

const ORDER_SECTIONS = ["Gardien de but", "Défenseur", "Milieu de terrain", "Attaquant"];

function PlayerCardSkeleton() {
  return (
    <Card className="premium-card overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="w-full aspect-square rounded-xl" />
      </CardContent>
    </Card>
  );
}

/** ====== Page ====== */
const Equipe = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Player | null>(null);
  const [filterPoste, setFilterPoste] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"matchs" | "buts" | "passes" | "none">("none");

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

        const iNum = idxOf("numero", "numéro");
        const iPre = idxOf("prenom", "prénom");
        const iNom = idxOf("nom");
        const iPoste = idxOf("poste");
        const iPhoto = idxOf("photo_url", "photo", "image", "image_url");
        const iOrig = idxOf("origine", "origin");
        const iFun = idxOf("fun_fact", "funfact", "histoire", "bio");
        const iFav = idxOf("joueur_prefere", "joueur_préféré", "favorite_player", "joueur_favori");
        const iMatchs = idxOf("matchs_joues", "matches_joues", "matchs", "matches_played", "nb_matchs");
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

  // Filter and sort players for stats table
  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = [...players];
    
    // Filter by poste
    if (filterPoste !== "all") {
      filtered = filtered.filter((p) => posteToFr(p.poste) === filterPoste);
    }
    
    // Sort
    if (sortBy !== "none") {
      filtered.sort((a, b) => {
        let aVal = 0;
        let bVal = 0;
        
        switch (sortBy) {
          case "matchs":
            aVal = a.matchs_joues ?? 0;
            bVal = b.matchs_joues ?? 0;
            break;
          case "buts":
            aVal = a.buts ?? 0;
            bVal = b.buts ?? 0;
            break;
          case "passes":
            aVal = a.passes_decisives ?? 0;
            bVal = b.passes_decisives ?? 0;
            break;
        }
        
        return aVal - bVal; // Ascending order (croissant)
      });
    }
    
    return filtered;
  }, [players, filterPoste, sortBy]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section data-hero="true" className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
        
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center pt-24 sm:pt-28 pb-16 sm:pb-20">
          <div className="flex items-center justify-center gap-4 mb-6 animate-rise-up">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-magenta" />
            <Users className="h-8 w-8 text-magenta" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-magenta" />
          </div>
          
          <h1 className="font-display font-bold text-white leading-tight mb-4 animate-rise-up" style={{ animationDelay: "100ms" }}>
            <span className="block text-display-sm sm:text-display-md md:text-display-lg">Notre</span>
            <span className="block text-display-sm sm:text-display-md md:text-display-lg text-gradient-magenta">équipe</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/70 font-sport max-w-2xl mx-auto animate-rise-up" style={{ animationDelay: "200ms" }}>
            Découvrez les joueurs qui composent notre club
          </p>
        </div>
      </section>

      {/* Players Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-section">
        <div className="container max-w-7xl mx-auto">
          {loading ? (
            <div className="space-y-12">
              {ORDER_SECTIONS.map((section) => (
                <div key={section}>
                  <Skeleton className="h-10 w-48 mb-6" />
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => <PlayerCardSkeleton key={i} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-sport">{error}</p>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-20">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-sport text-lg">Aucun joueur pour le moment</p>
            </div>
          ) : (
            <>
              {/* Player Cards by Position */}
              {ORDER_SECTIONS.map((section) => {
                const list = grouped[section] || [];
                if (list.length === 0) return null;
                return (
                  <div key={section} className="mb-16">
                    <div className="flex items-center gap-4 mb-8">
                      <span className="text-3xl">{posteIcon(section)}</span>
                      <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-foreground">
                        {section}
                      </h2>
                      <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {list.map((p, idx) => (
                        <Card
                          key={`${section}-${idx}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelected(p)}
                          onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? setSelected(p) : null)}
                          className="premium-card overflow-hidden cursor-pointer group"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="relative">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-display font-bold text-lg shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                                  {p.numero ?? "—"}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-display font-bold text-lg text-foreground truncate">
                                  {(p.prenom || "").trim()} {(p.nom || "").trim()}
                                </div>
                                <div className="text-xs text-muted-foreground font-sport">{posteToFr(p.poste)}</div>
                              </div>
                            </div>

                            <div className="w-full aspect-square overflow-hidden rounded-xl bg-muted/30 relative">
                              {p.photo_url ? (
                                <img
                                  src={p.photo_url}
                                  alt={`${(p.prenom || "").trim()} ${(p.nom || "").trim()}`}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Users className="h-12 w-12 text-muted-foreground/30" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Stats Table */}
              <Card className="premium-card overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-6 w-6 text-magenta" />
                      <h3 className="font-display font-bold text-xl sm:text-2xl text-foreground">
                        Statistiques individuelles
                      </h3>
                    </div>
                    
                    {/* Filters and Sort */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Poste Filter */}
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                          value={filterPoste}
                          onChange={(e) => setFilterPoste(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-sport text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="all">Tous les postes</option>
                          {ORDER_SECTIONS.map((poste) => (
                            <option key={poste} value={poste}>{poste}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Sort */}
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as "matchs" | "buts" | "passes" | "none")}
                          className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-sport text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="none">Trier par...</option>
                          <option value="matchs">Matchs joués</option>
                          <option value="buts">Buts</option>
                          <option value="passes">Passes décisives</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-sm min-w-[600px]">
                      <thead>
                        <tr className="border-b-2 border-primary/20">
                          <th className="text-left py-3 px-3 font-display font-bold text-foreground">#</th>
                          <th className="text-left py-3 px-3 font-display font-bold text-foreground">Joueur</th>
                          <th className="text-left py-3 px-3 font-display font-bold text-foreground">Poste</th>
                          <th className="text-center py-3 px-3 font-display font-bold text-foreground">
                            <Target className="h-4 w-4 mx-auto" title="Matchs joués" />
                          </th>
                          <th className="text-center py-3 px-3 font-display font-bold text-foreground">⚽</th>
                          <th className="text-center py-3 px-3 font-display font-bold text-foreground">🎯</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedPlayers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-muted-foreground font-sport">
                              Aucun joueur trouvé avec ces critères
                            </td>
                          </tr>
                        ) : (
                          filteredAndSortedPlayers.map((p, idx) => (
                            <tr 
                              key={`row-${idx}`} 
                              className="border-b border-border/10 hover:bg-muted/50 transition-colors"
                            >
                              <td className="py-3 px-3 font-sport font-medium">{p.numero ?? "—"}</td>
                              <td className="py-3 px-3 font-sport font-medium">
                                {(p.prenom || "").trim()} {(p.nom || "").trim()}
                              </td>
                              <td className="py-3 px-3 font-sport text-muted-foreground">{posteToFr(p.poste)}</td>
                              <td className="text-center py-3 px-3 font-sport-condensed font-bold">{p.matchs_joues ?? 0}</td>
                              <td className="text-center py-3 px-3 font-sport-condensed font-bold text-primary">{p.buts ?? 0}</td>
                              <td className="text-center py-3 px-3 font-sport-condensed font-bold text-accent">{p.passes_decisives ?? 0}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* Player Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-3xl bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-2xl text-foreground flex items-center gap-3">
              {selected && (
                <>
                  <span className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                    {selected.numero ?? "—"}
                  </span>
                  {(selected.prenom || "").trim()} {(selected.nom || "").trim()}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="flex flex-col md:flex-row gap-6 mt-4">
              {/* Photo */}
              <div className="w-full md:w-1/2">
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-muted/30">
                  {selected.photo_url ? (
                    <img
                      src={selected.photo_url}
                      alt={`${(selected.prenom || "").trim()} ${(selected.nom || "").trim()}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Users className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="w-full md:flex-1 space-y-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground font-sport uppercase tracking-wide mb-1">Poste</p>
                  <p className="font-display font-bold text-foreground">{posteToFr(selected.poste)}</p>
                </div>

                {selected.origine && selected.origine.trim() !== "" && (
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground font-sport uppercase tracking-wide mb-1">Origine</p>
                    <p className="font-sport text-foreground">{selected.origine}</p>
                  </div>
                )}

                {selected.joueur_prefere && selected.joueur_prefere.trim() !== "" && (
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground font-sport uppercase tracking-wide mb-1">Joueur préféré</p>
                    <p className="font-sport text-foreground flex items-center gap-2">
                      <Star className="h-4 w-4 text-magenta" />
                      {selected.joueur_prefere}
                    </p>
                  </div>
                )}

                {selected.fun_fact && selected.fun_fact.trim() !== "" && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                    <p className="text-xs text-muted-foreground font-sport uppercase tracking-wide mb-1">Fun fact</p>
                    <p className="font-sport text-foreground">{selected.fun_fact}</p>
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
