import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertCircle,
  Clock,
  MapPin,
  Trophy,
  Dumbbell,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { parseCSVLine, stripBOM } from "@/lib/utils";

// ENV
const GOOGLE_SHEET_EVENTS_CSV_URL = import.meta.env.VITE_GOOGLE_SHEET_EVENTS_CSV_URL || "";
const GOOGLE_SHEET_STANDINGS_CSV_URL = import.meta.env.VITE_SHEET_STANDINGS_CSV_URL || "";

/* ============================
   Types
============================ */
type EventType = "match" | "entrainement";

interface Event {
  date: string;
  title: string;
  start_time?: string;
  end_time?: string;
  location: string;
  type: EventType;
  team_home?: string;
  team_away?: string;
  score_home?: number;
  score_away?: number;
  resultat?: "V" | "N" | "D";
  home_logo?: string;
  away_logo?: string;
}

interface Standing {
  rank: number;
  team: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  points: number;
  team_logo_url?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: Event[];
}

/* ============================
   Utils
============================ */
const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const parseEventDate = (d: string): Date => {
  if (!d) return new Date(NaN);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
    const [jj, mm, aaaa] = d.split("/").map(Number);
    return new Date(aaaa, mm - 1, jj);
  }
  return new Date(d);
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const todayMidnight = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};

const normalizeResult = (val: string): "V" | "N" | "D" | null => {
  const v = (val || "").toLowerCase().trim();
  if (v === "win" || v === "v" || v === "victoire") return "V";
  if (v === "draw" || v === "n" || v === "nul" || v === "match nul") return "N";
  if (v === "loose" || v === "lose" || v === "d" || v === "défaite" || v === "defaite") return "D";
  return null;
};

const computeResult = (e: Event) => {
  if (e.resultat) return e.resultat;
  const h = typeof e.score_home === "number" ? e.score_home : NaN;
  const a = typeof e.score_away === "number" ? e.score_away : NaN;
  if (Number.isNaN(h) || Number.isNaN(a)) return null;
  if (h > a) return "V";
  if (h === a) return "N";
  return "D";
};

const ResultBadge = ({ r }: { r?: string | null }) => {
  if (!r) return null;
  const styles: Record<string, string> = {
    V: "bg-green-500 text-white",
    N: "bg-gray-500 text-white",
    D: "bg-red-500 text-white",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-display font-bold ${styles[r] || "bg-gray-500"}`}>
      {r}
    </span>
  );
};

/* ============================
   Component
============================ */
const Calendrier = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [standingsLoading, setStandingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<{ events: Event[]; date: string } | null>(null);
  const [showAllPastMatches, setShowAllPastMatches] = useState(false);

  /* Fetch Events */
  useEffect(() => {
    const fetchEvents = async () => {
      if (!GOOGLE_SHEET_EVENTS_CSV_URL) {
        setLoading(false);
        return;
      }
      try {
        const url = `${GOOGLE_SHEET_EVENTS_CSV_URL}${GOOGLE_SHEET_EVENTS_CSV_URL.includes("?") ? "&" : "?"}_ts=${Date.now()}`;
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const raw = stripBOM(await response.text());
        if (!raw || raw.trim().length === 0) {
          throw new Error("Réponse vide du serveur");
        }

        const lines = raw.replace(/\r/g, "").split("\n").filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setEvents([]);
          setError(null);
          return;
        }

        const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
        const idx = (name: string) => header.indexOf(name);

        const parsed: Event[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cells = parseCSVLine(lines[i]);
          const date = cells[idx("date")] || "";
          const type = (cells[idx("type")] || "").toLowerCase() as EventType;
          if (!date || (type !== "match" && type !== "entrainement")) continue;

          const scoreHome = cells[idx("score_home")];
          const scoreAway = cells[idx("score_away")];

          parsed.push({
            date,
            title: cells[idx("title")] || "",
            start_time: cells[idx("start_time")] || "",
            end_time: cells[idx("end_time")] || "",
            location: cells[idx("location")] || "",
            type,
            team_home: cells[idx("team_home")] || "",
            team_away: cells[idx("team_away")] || "",
            score_home: scoreHome !== "" ? Number(scoreHome) : undefined,
            score_away: scoreAway !== "" ? Number(scoreAway) : undefined,
            resultat: normalizeResult(cells[idx("resultat")] || "") || undefined,
            home_logo: cells[idx("home_logo")] || "",
            away_logo: cells[idx("away_logo")] || "",
          });
        }

        parsed.sort((a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime());
        setEvents(parsed);
        setError(null);
      } catch (err) {
        console.error("Erreur chargement événements:", err);
        const errMsg = err instanceof Error ? err.message : String(err);
        setError(`Erreur lors du chargement des événements. ${errMsg.includes("HTTP") ? errMsg : "Vérifiez la configuration."}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    // Refresh events every 5 minutes instead of 60s to reduce unnecessary requests
    // Data changes rarely - manual refresh available via "Aujourd'hui" button
    const interval = setInterval(fetchEvents, 5 * 60_000);
    return () => clearInterval(interval);
  }, []);

  /* Fetch Standings */
  useEffect(() => {
    const fetchStandings = async () => {
      if (!GOOGLE_SHEET_STANDINGS_CSV_URL) {
        setStandingsLoading(false);
        return;
      }
      try {
        const url = `${GOOGLE_SHEET_STANDINGS_CSV_URL}${GOOGLE_SHEET_STANDINGS_CSV_URL.includes("?") ? "&" : "?"}_ts=${Date.now()}`;
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          console.warn(`Standings fetch failed: HTTP ${response.status}`);
          setStandings([]);
          return;
        }
        const raw = stripBOM(await response.text());
        if (!raw || raw.trim().length === 0) {
          console.warn("Standings response is empty");
          setStandings([]);
          return;
        }

        const lines = raw.replace(/\r/g, "").split("\n").filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setStandings([]);
          return;
        }

        const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
        const anyIdx = (...names: string[]) => {
          for (const n of names) {
            const i = header.indexOf(n);
            if (i >= 0) return i;
          }
          return -1;
        };

        const parsed: Standing[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cells = parseCSVLine(lines[i]);
          parsed.push({
            rank: Number(cells[anyIdx("rank")] || 0),
            team: cells[anyIdx("team")] || "",
            played: Number(cells[anyIdx("played")] || 0),
            won: Number(cells[anyIdx("won")] || 0),
            draw: Number(cells[anyIdx("draw")] || 0),
            lost: Number(cells[anyIdx("lost")] || 0),
            goals_for: Number(cells[anyIdx("goals_for", "goal_for", "bp")] || 0),
            goals_against: Number(cells[anyIdx("goals_against", "goal_against", "bc")] || 0),
            points: Number(cells[anyIdx("points")] || 0),
            team_logo_url: cells[anyIdx("team_logo_url")] || "",
          });
        }

        parsed.sort((a, b) => (a.rank || 999) - (b.rank || 999) || b.points - a.points);
        setStandings(parsed);
      } catch (err) {
        console.error("Error fetching standings:", err);
      } finally {
        setStandingsLoading(false);
      }
    };

    fetchStandings();
  }, []);

  /* Calendar Grid */
  const calendarDays = useMemo<CalendarDay[]>(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const dayOfWeek = (d: Date) => (d.getDay() + 6) % 7;

    const start = new Date(firstOfMonth);
    start.setDate(start.getDate() - dayOfWeek(start));

    const days: CalendarDay[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        date: d,
        isCurrentMonth: d >= new Date(year, month, 1) && d <= lastOfMonth,
        events: events.filter((e) => isSameDay(parseEventDate(e.date), d)),
      });
    }
    return days;
  }, [currentDate, events]);

  const currentMonthEvents = useMemo(() => {
    return events.filter((e) => {
      const d = parseEventDate(e.date);
      return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
    });
  }, [events, currentDate]);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const pastMatches = useMemo(() => {
    const t0 = todayMidnight().getTime();
    return events
      .filter((e) => e.type === "match" && parseEventDate(e.date).getTime() < t0)
      .sort((a, b) => parseEventDate(b.date).getTime() - parseEventDate(a.date).getTime());
  }, [events]);

  const upcomingMatches = useMemo(() => {
    const t0 = todayMidnight().getTime();
    return events
      .filter((e) => e.type === "match" && parseEventDate(e.date).getTime() >= t0)
      .sort((a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime());
  }, [events]);

  const formatLongDate = (d: string) =>
    new Date(parseEventDate(d)).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section data-hero="true" className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/15 rounded-full blur-3xl" />
        
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center pt-24 sm:pt-28 pb-16 sm:pb-20">
          <div className="flex items-center justify-center gap-4 mb-6 animate-rise-up">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-magenta" />
            <CalendarIcon className="h-8 w-8 text-magenta" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-magenta" />
          </div>
          
          <h1 className="font-display font-bold text-white leading-tight mb-4 animate-rise-up" style={{ animationDelay: "100ms" }}>
            <span className="block text-display-sm sm:text-display-md md:text-display-lg">Notre</span>
            <span className="block text-display-sm sm:text-display-md md:text-display-lg text-gradient-magenta">calendrier</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/70 font-sport max-w-2xl mx-auto animate-rise-up" style={{ animationDelay: "200ms" }}>
            Matchs et entraînements à jour
          </p>
        </div>
      </section>

      {/* Calendar + Lists */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-section">
        <div className="container max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar Grid */}
            <div className="lg:col-span-2">
              {loading ? (
                <Card className="premium-card">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-10 w-10 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {[...Array(42)].map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-lg" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card className="premium-card">
                  <CardContent className="p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-sport">{error}</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="premium-card overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth("prev")}
                        className="rounded-xl hover:bg-primary hover:text-white hover:border-primary"
                      >
                        <ChevronLeft className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      </Button>

                      <div className="text-center">
                        <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">
                          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentDate(new Date())}
                          className="text-sm text-primary hover:text-primary/80 font-sport"
                        >
                          Aujourd'hui
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth("next")}
                        className="rounded-xl hover:bg-primary hover:text-white hover:border-primary"
                      >
                        <ChevronRight className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      </Button>
                    </div>

                    {/* Days Header */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                      {dayNames.map((d) => (
                        <div key={d} className="p-2 text-center text-xs sm:text-sm font-display font-bold text-muted-foreground">
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {calendarDays.map((day, idx) => (
                        <div
                          key={idx}
                          onClick={() => day.events.length > 0 && setSelectedEvent({ events: day.events, date: day.events[0].date })}
                          className={`
                            p-1 sm:p-2 min-h-[60px] sm:min-h-[80px] rounded-xl border transition-all
                            ${day.isCurrentMonth ? "bg-card" : "bg-muted/30"}
                            ${day.events.length > 0 ? "cursor-pointer hover:border-primary hover:shadow-md" : "border-transparent"}
                            ${isSameDay(day.date, todayMidnight()) ? "ring-2 ring-primary ring-offset-2" : ""}
                          `}
                        >
                          <div className={`text-xs sm:text-sm font-sport font-medium ${day.isCurrentMonth ? "text-foreground" : "text-muted-foreground"}`}>
                            {day.date.getDate()}
                          </div>
                          {day.events.length > 0 && (
                            <div className="flex gap-1 mt-1 justify-center flex-wrap">
                              {day.events.some((e) => e.type === "match") && (
                                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                              )}
                              {day.events.some((e) => e.type === "entrainement") && (
                                <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {currentMonthEvents.length === 0 && (
                      <div className="text-center py-8 mt-4 rounded-xl bg-muted/50">
                        <CalendarIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground font-sport">Aucun événement ce mois-ci</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Upcoming Matches */}
              <Card className="premium-card">
                <CardContent className="p-5 sm:p-6">
                  <h3 className="font-display font-bold text-lg sm:text-xl text-foreground mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Matchs à venir
                  </h3>
                  <div className="space-y-3">
                    {upcomingMatches.slice(0, 5).map((e, i) => (
                      <div
                        key={`up-${i}`}
                        className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center justify-center gap-2 text-center">
                          {e.home_logo && (
                            <img src={e.home_logo} alt="" loading="lazy" className="h-6 w-6 object-contain" />
                          )}
                          <span className="font-display font-bold text-sm">{e.team_home || "Domicile"}</span>
                          <span className="text-muted-foreground text-xs">VS</span>
                          <span className="font-display font-bold text-sm">{e.team_away || "Extérieur"}</span>
                          {e.away_logo && (
                            <img src={e.away_logo} alt="" loading="lazy" className="h-6 w-6 object-contain" />
                          )}
                        </div>
                        <div className="mt-2 text-center text-xs text-muted-foreground font-sport">
                          {e.date}{e.start_time ? ` • ${e.start_time}` : ""}
                        </div>
                      </div>
                    ))}
                    {upcomingMatches.length === 0 && (
                      <p className="text-sm text-muted-foreground font-sport text-center py-4">Aucun match programmé</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Past Matches */}
              <Card className="premium-card">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-lg sm:text-xl text-foreground flex items-center gap-2">
                      <Star className="h-5 w-5 text-magenta" />
                      Résultats
                    </h3>
                    {pastMatches.length > 3 && (
                      <Button variant="ghost" size="sm" onClick={() => setShowAllPastMatches((v) => !v)} className="text-sm">
                        {showAllPastMatches ? "Moins" : "Plus"}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {(showAllPastMatches ? pastMatches : pastMatches.slice(0, 3)).map((e, i) => {
                      const res = computeResult(e);
                      return (
                        <div
                          key={`past-${i}`}
                          className="p-4 rounded-xl bg-muted/50 border border-border/50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {e.home_logo && <img src={e.home_logo} alt="" loading="lazy" className="h-5 w-5 object-contain" />}
                              <span className="font-sport text-sm font-medium">{e.team_home}</span>
                              <span className="font-display font-bold text-primary">{e.score_home}</span>
                              <span className="text-muted-foreground">-</span>
                              <span className="font-display font-bold text-primary">{e.score_away}</span>
                              <span className="font-sport text-sm font-medium">{e.team_away}</span>
                              {e.away_logo && <img src={e.away_logo} alt="" loading="lazy" className="h-5 w-5 object-contain" />}
                            </div>
                            <ResultBadge r={res} />
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground font-sport">{e.date}</div>
                        </div>
                      );
                    })}
                    {pastMatches.length === 0 && (
                      <p className="text-sm text-muted-foreground font-sport text-center py-4">Aucun résultat</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Standings */}
          {GOOGLE_SHEET_STANDINGS_CSV_URL && (
            <div className="mt-12">
              <Card className="premium-card overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-foreground mb-6 flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-magenta" />
                    Classement
                  </h3>
                  
                  {standingsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : standings.length === 0 ? (
                    <p className="text-center text-muted-foreground font-sport py-8">Classement non disponible</p>
                  ) : (
                    <div className="overflow-x-auto -mx-6 px-6">
                      <table className="w-full text-sm min-w-[600px]">
                        <thead>
                          <tr className="border-b-2 border-primary/20">
                            <th className="text-left py-3 px-2 font-display font-bold text-foreground">#</th>
                            <th className="text-left py-3 px-2 font-display font-bold text-foreground">Équipe</th>
                            <th className="text-center py-3 px-2 font-display font-bold text-foreground">J</th>
                            <th className="text-center py-3 px-2 font-display font-bold text-foreground">V</th>
                            <th className="text-center py-3 px-2 font-display font-bold text-foreground">N</th>
                            <th className="text-center py-3 px-2 font-display font-bold text-foreground">D</th>
                            <th className="text-center py-3 px-2 font-display font-bold text-foreground">+/-</th>
                            <th className="text-center py-3 px-2 font-display font-bold text-foreground">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((s, idx) => (
                            <tr 
                              key={idx} 
                              className={`border-b border-border/10 hover:bg-muted/50 transition-colors ${
                                s.team.toLowerCase().includes("ardentis") ? "bg-primary/5" : ""
                              }`}
                            >
                              <td className="py-3 px-2 font-display font-bold">{s.rank}</td>
                              <td className="py-3 px-2 font-sport font-medium">
                                <div className="flex items-center gap-2">
                                  {s.team_logo_url && <img src={s.team_logo_url} alt="" loading="lazy" className="h-5 w-5 object-contain" />}
                                  <span className={s.team.toLowerCase().includes("ardentis") ? "text-primary font-bold" : ""}>
                                    {s.team}
                                  </span>
                                </div>
                              </td>
                              <td className="text-center py-3 px-2 font-sport">{s.played}</td>
                              <td className="text-center py-3 px-2 font-sport text-green-600">{s.won}</td>
                              <td className="text-center py-3 px-2 font-sport">{s.draw}</td>
                              <td className="text-center py-3 px-2 font-sport text-red-500">{s.lost}</td>
                              <td className="text-center py-3 px-2 font-sport">{s.goals_for - s.goals_against}</td>
                              <td className="text-center py-3 px-2 font-display font-bold text-primary">{s.points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Event Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl text-foreground">
              {selectedEvent && formatLongDate(selectedEvent.date)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {selectedEvent?.events.map((e, i) => (
              <div key={i} className="p-4 rounded-xl bg-muted/50 space-y-3">
                {e.type === "match" && (
                  <div className="flex items-center justify-center gap-3 text-center">
                    {e.home_logo && <img src={e.home_logo} alt="" loading="lazy" className="h-8 w-8 object-contain" />}
                    <span className="font-display font-bold">{e.team_home || "Domicile"}</span>
                    <span className="text-muted-foreground">VS</span>
                    <span className="font-display font-bold">{e.team_away || "Extérieur"}</span>
                    {e.away_logo && <img src={e.away_logo} alt="" loading="lazy" className="h-8 w-8 object-contain" />}
                  </div>
                )}

                <div className="space-y-2 text-sm font-sport">
                  {(e.start_time || e.end_time) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{e.start_time || ""} {e.end_time ? `→ ${e.end_time}` : ""}</span>
                    </div>
                  )}
                  {e.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{e.location}</span>
                    </div>
                  )}
                  {typeof e.score_home === "number" && typeof e.score_away === "number" && (
                    <div className="text-center font-display font-bold text-lg text-primary">
                      {e.score_home} - {e.score_away}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendrier;
