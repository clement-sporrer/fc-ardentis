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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

// ENV
const GOOGLE_SHEET_EVENTS_CSV_URL = import.meta.env.VITE_GOOGLE_SHEET_EVENTS_CSV_URL || "";
const GOOGLE_SHEET_STANDINGS_CSV_URL = import.meta.env.VITE_SHEET_STANDINGS_CSV_URL || "";

/* ============================
   Types
============================ */
type EventType = "match" | "entrainement";

interface Event {
  // CSV "MATCHS" — colonnes attendues :
  // date,title,start_time,end_time,location,type,team_home,team_away,score_home,score_away,resultat,home_logo,away_logo
  date: string;            // JJ/MM/AAAA (ou ISO fallback)
  title: string;
  start_time?: string;     // HH:MM
  end_time?: string;       // HH:MM
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
const parseCSVLine = (line: string): string[] => {
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
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map((v) => v.trim());
};

const monthNames = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];
const dayNames = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

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

const computeResult = (e: Event) => {
  if (e.resultat === "V" || e.resultat === "N" || e.resultat === "D") return e.resultat;
  const h = typeof e.score_home === "number" ? e.score_home : NaN;
  const a = typeof e.score_away === "number" ? e.score_away : NaN;
  if (Number.isNaN(h) || Number.isNaN(a)) return null;
  if (h > a) return "V";
  if (h === a) return "N";
  return "D";
};

const ResultBadge = ({ r }: { r?: string | null }) => {
  if (!r) return null;
  const map: Record<string, string> = { V: "bg-green-600", N: "bg-gray-600", D: "bg-red-600" };
  return <span className={`px-2 py-0.5 rounded text-white text-xs font-sport ${map[r] || "bg-gray-600"}`}>{r}</span>;
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

  /* ------- Fetch Events (13 colonnes) ------- */
  useEffect(() => {
    const fetchEvents = async () => {
      if (!GOOGLE_SHEET_EVENTS_CSV_URL) {
        setLoading(false);
        return;
      }
      try {
        const url = `${GOOGLE_SHEET_EVENTS_CSV_URL}${GOOGLE_SHEET_EVENTS_CSV_URL.includes("?") ? "&" : "?"}_ts=${Date.now()}`;
        const response = await fetch(url, { cache: "no-store" });
        const raw = await response.text();

        const lines = raw.replace(/\r/g, "").split("\n").filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setEvents([]);
          setError(null);
          return;
        }

        const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
        const idx = (name: string) => header.indexOf(name);

        const i_date = idx("date");
        const i_title = idx("title");
        const i_start = idx("start_time");
        const i_end = idx("end_time");
        const i_location = idx("location");
        const i_type = idx("type");
        const i_th = idx("team_home");
        const i_ta = idx("team_away");
        const i_sh = idx("score_home");
        const i_sa = idx("score_away");
        const i_res = idx("resultat");
        const i_hl = idx("home_logo");
        const i_al = idx("away_logo");

        const parsed: Event[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cells = parseCSVLine(lines[i]);

          const date = i_date >= 0 ? cells[i_date] || "" : "";
          const type = (i_type >= 0 ? cells[i_type] || "" : "").toLowerCase() as EventType;
          if (!date || (type !== "match" && type !== "entrainement")) continue;

          parsed.push({
            date,
            title: i_title >= 0 ? cells[i_title] || "" : "",
            start_time: i_start >= 0 ? cells[i_start] || "" : "",
            end_time: i_end >= 0 ? cells[i_end] || "" : "",
            location: i_location >= 0 ? cells[i_location] || "" : "",
            type,
            team_home: i_th >= 0 ? cells[i_th] || "" : "",
            team_away: i_ta >= 0 ? cells[i_ta] || "" : "",
            score_home: i_sh >= 0 && cells[i_sh] !== "" ? Number(cells[i_sh]) : undefined,
            score_away: i_sa >= 0 && cells[i_sa] !== "" ? Number(cells[i_sa]) : undefined,
            resultat:
              i_res >= 0 && cells[i_res]
                ? (cells[i_res] as "V" | "N" | "D")
                : (computeResult({
                    date,
                    title: i_title >= 0 ? cells[i_title] || "" : "",
                    start_time: i_start >= 0 ? cells[i_start] || "" : "",
                    end_time: i_end >= 0 ? cells[i_end] || "" : "",
                    location: i_location >= 0 ? cells[i_location] || "" : "",
                    type,
                    team_home: i_th >= 0 ? cells[i_th] || "" : "",
                    team_away: i_ta >= 0 ? cells[i_ta] || "" : "",
                    score_home: i_sh >= 0 && cells[i_sh] !== "" ? Number(cells[i_sh]) : undefined,
                    score_away: i_sa >= 0 && cells[i_sa] !== "" ? Number(cells[i_sa]) : undefined,
                    home_logo: i_hl >= 0 ? cells[i_hl] || "" : "",
                    away_logo: i_al >= 0 ? cells[i_al] || "" : "",
                  }) as any),
            home_logo: i_hl >= 0 ? cells[i_hl] || "" : "",
            away_logo: i_al >= 0 ? cells[i_al] || "" : "",
          });
        }

        parsed.sort((a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime());

        setEvents(parsed);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des événements");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 60_000);
    return () => clearInterval(interval);
  }, []);

  /* ------- Fetch Standings ------- */
  useEffect(() => {
    const fetchStandings = async () => {
      if (!GOOGLE_SHEET_STANDINGS_CSV_URL) {
        setStandingsLoading(false);
        return;
      }
      try {
        const url = `${GOOGLE_SHEET_STANDINGS_CSV_URL}${GOOGLE_SHEET_STANDINGS_CSV_URL.includes("?") ? "&" : "?"}_ts=${Date.now()}`;
        const response = await fetch(url, { cache: "no-store" });
        const raw = await response.text();

        const lines = raw.replace(/\r/g, "").split("\n").filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setStandings([]);
          return;
        }

        const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
        const id = (name: string) => header.indexOf(name);

        const ir = id("rank");
        const it = id("team");
        const ip = id("played");
        const iw = id("won");
        const idr = id("draw");
        const il = id("lost");
        const igf = id("goals_for");
        const iga = id("goals_against");
        const ipts = id("points");
        const ilogo = id("team_logo_url");

        const parsed: Standing[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cells = parseCSVLine(lines[i]);
          parsed.push({
            rank: ir >= 0 ? Number(cells[ir] || 0) : 0,
            team: it >= 0 ? cells[it] || "" : "",
            played: ip >= 0 ? Number(cells[ip] || 0) : 0,
            won: iw >= 0 ? Number(cells[iw] || 0) : 0,
            draw: idr >= 0 ? Number(cells[idr] || 0) : 0,
            lost: il >= 0 ? Number(cells[il] || 0) : 0,
            goals_for: igf >= 0 ? Number(cells[igf] || 0) : 0,
            goals_against: iga >= 0 ? Number(cells[iga] || 0) : 0,
            points: ipts >= 0 ? Number(cells[ipts] || 0) : 0,
            team_logo_url: ilogo >= 0 ? cells[ilogo] || "" : "",
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

  /* ------- Génération calendrier Lundi→Dimanche ------- */
  const calendarDays = useMemo<CalendarDay[]>(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    // Lundi=0 … Dimanche=6
    const dayOfWeek = (d: Date) => (d.getDay() + 6) % 7;

    const start = new Date(firstOfMonth);
    const offsetToMonday = dayOfWeek(start);
    start.setDate(start.getDate() - offsetToMonday);

    const days: CalendarDay[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const evts = events.filter((e) => isSameDay(parseEventDate(e.date), d));
      days.push({
        date: d,
        isCurrentMonth: d >= new Date(year, month, 1) && d <= lastOfMonth,
        events: evts,
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
  const goToToday = () => setCurrentDate(new Date());

  const handleDayClick = (day: CalendarDay) => {
    if (day.events.length > 0) {
      setSelectedEvent({ events: day.events, date: day.events[0].date });
    }
  };

  const getEventIcons = (evts: Event[]) => {
    const hasMatch = evts.some((e) => e.type === "match");
    const hasTraining = evts.some((e) => e.type === "entrainement");
    return (
      <div className="flex gap-1 justify-center mt-1">
        {hasMatch && <Trophy className="h-3 w-3 text-primary" />}
        {hasTraining && <Dumbbell className="h-3 w-3 text-secondary" />}
      </div>
    );
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
      {/* Hero Section (identique à Notre équipe) */}
      <section className="bg-gradient-hero py-20 md:py-28 px-4 text-center !mt-0">
        <div className="container max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-sport-condensed font-bold text-white mb-3"><span className="text-white">Notre </span><span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">calendrier</span></h1>
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Notre calendrier</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-sport max-w-3xl mx-auto">
            Matchs et entraînements à jour.
          </p>
        </div>
      </section>

      {/* Calendar + Lists */}
      <section className="py-20 px-4 bg-gradient-section">
        <div className="container max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar Grid */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-3 text-muted-foreground font-sport">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    Chargement du calendrier...
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-3 text-destructive font-sport">
                    <AlertCircle className="h-6 w-6" />
                    {error}
                  </div>
                </div>
              ) : (
                <Card className="shadow-card">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth("prev")}
                        className="hover:bg-secondary hover:text-secondary-foreground"
                        aria-label="Mois précédent"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="text-center">
                        <h2 className="text-2xl font-sport-condensed font-bold text-foreground">
                          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={goToToday}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          Aujourd&apos;hui
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth("next")}
                        className="hover:bg-secondary hover:text-secondary-foreground"
                        aria-label="Mois suivant"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Day headers (Mon→Sun) */}
                    <div className="grid grid-cols-7 gap-1">
                      {dayNames.map((d) => (
                        <div key={d} className="p-2 text-center text-sm font-sport font-medium text-muted-foreground">
                          {d}
                        </div>
                      ))}

                      {/* 42 cells */}
                      {calendarDays.map((day, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleDayClick(day)}
                          className={[
                            "p-2 min-h-[70px] border border-border/20 transition-sport",
                            day.isCurrentMonth ? "bg-card text-card-foreground" : "bg-muted/30 text-muted-foreground",
                            day.events.length > 0 ? "cursor-pointer hover:bg-accent hover:border-primary/50" : "",
                            isSameDay(day.date, todayMidnight()) ? "ring-2 ring-primary/50" : "",
                          ].join(" ")}
                        >
                          <div className="text-sm font-sport font-medium mb-1">{day.date.getDate()}</div>
                          {day.events.length > 0 && getEventIcons(day.events)}
                        </div>
                      ))}
                    </div>

                    {currentMonthEvents.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground font-sport">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Aucun événement prévu ce mois-ci.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column: Upcoming / Past */}
            <div className="lg:col-span-1 space-y-8">
              {/* Upcoming */}
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-sport-condensed font-bold text-foreground mb-4">Matchs à venir</h3>
                  <div className="space-y-3">
                    {upcomingMatches.slice(0, 5).map((e, i) => (
                      <div
                        key={`up-${i}`}
                        className="p-4 rounded-2xl bg-white bg-[radial-gradient(120%_120%_at_50%_0%,#888ce6_0%,transparent_55%)] border border-[#888ce6]/35 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-sport"
                      >
                        <div className="flex items-center justify-center gap-3 text-center">
                          {e.home_logo && (
                            <img src={e.home_logo} alt={e.team_home || "Domicile"} className="h-7 w-7 object-contain" />
                          )}
                          <span className="font-sport-condensed font-bold">{e.team_home || "Domicile"}</span>
                          <span className="text-muted-foreground">VS</span>
                          <span className="font-sport-condensed font-bold">{e.team_away || "Extérieur"}</span>
                          {e.away_logo && (
                            <img src={e.away_logo} alt={e.team_away || "Extérieur"} className="h-7 w-7 object-contain" />
                          )}
                        </div>
                        <div className="mt-2 text-center text-xs text-muted-foreground font-sport">
                          {e.date}{e.start_time ? ` • ${e.start_time}` : ""}
                        </div>
                      </div>
                    ))}
                    {upcomingMatches.length === 0 && (
                      <p className="text-sm text-muted-foreground font-sport">Aucun match programmé</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Past */}
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-sport-condensed font-bold text-foreground">Matchs passés</h3>
                    {pastMatches.length > 3 && (
                      <Button variant="ghost" size="sm" onClick={() => setShowAllPastMatches((v) => !v)} className="text-sm">
                        {showAllPastMatches ? "Voir moins" : "Voir plus"}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {(showAllPastMatches ? pastMatches : pastMatches.slice(0, 3)).map((e, i) => {
                      const res = computeResult(e);
                      return (
                        <div
                          key={`past-${i}`}
                          className="p-0 rounded-2xl bg-white bg-[radial-gradient(120%_120%_at_50%_0%,#888ce6_0%,transparent_55%)] border border-[#888ce6]/35 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-sport overflow-hidden"
                        >
                          <div className="flex">
                            {/* Zone contenu 85% */}
                            <div className="basis-[85%] px-4 py-3">
                              <div className="flex items-center justify-center gap-3 text-center">
                                {e.home_logo && (
                                  <img src={e.home_logo} alt={e.team_home || "Domicile"} className="h-7 w-7 object-contain" />
                                )}
                                <div className="flex flex-col items-center">
                                  <span className="font-sport-condensed font-bold">{e.team_home || "Domicile"}</span>
                                  {typeof e.score_home === "number" && (
                                    <span className="text-xs text-muted-foreground font-sport mt-0.5">{e.score_home}</span>
                                  )}
                                </div>
                                <span className="text-muted-foreground">VS</span>
                                <div className="flex flex-col items-center">
                                  <span className="font-sport-condensed font-bold">{e.team_away || "Extérieur"}</span>
                                  {typeof e.score_away === "number" && (
                                    <span className="text-xs text-muted-foreground font-sport mt-0.5">{e.score_away}</span>
                                  )}
                                </div>
                                {e.away_logo && (
                                  <img src={e.away_logo} alt={e.team_away || "Extérieur"} className="h-7 w-7 object-contain" />
                                )}
                              </div>
                            </div>

                            {/* Zone badge 15% */}
                            <div className="basis-[15%] flex items-center justify-center px-2">
                              <ResultBadge r={res} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {pastMatches.length === 0 && (
                      <p className="text-sm text-muted-foreground font-sport">Aucun match passé</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Standings Section */}
          {GOOGLE_SHEET_STANDINGS_CSV_URL && (
            <div className="mt-12">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-sport-condensed font-bold text-foreground mb-6 text-center">
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Classement</span>
                  </h3>
                  {standingsLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-3 text-muted-foreground font-sport">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        Chargement du classement...
                      </div>
                    </div>
                  ) : standings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground font-sport">Classement non disponible</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/20">
                            <th className="text-left py-2 font-sport-condensed font-bold text-foreground">#</th>
                            <th className="text-left py-2 font-sport-condensed font-bold text-foreground">Équipe</th>
                            <th className="text-center py-2 font-sport-condensed font-bold text-foreground">J</th>
                            <th className="text-center py-2 font-sport-condensed font-bold text-foreground">V</th>
                            <th className="text-center py-2 font-sport-condensed font-bold text-foreground">N</th>
                            <th className="text-center py-2 font-sport-condensed font-bold text-foreground">D</th>
                            <th className="text-center py-2 font-sport-condensed font-bold text-foreground">BP</th>
                            <th className="text-center py-2 font-sport-condensed font-bold text-foreground">BC</th>
                            <th className="text-center py-2 font-sport-condensed font-bold text-foreground">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((s, idx) => (
                            <tr key={idx} className={`border-b border-border/10 ${s.team === "FC Ardentis" ? "bg-primary/5" : ""}`}>
                              <td className="py-2 font-sport font-medium">{s.rank}</td>
                              <td className="py-2 font-sport font-medium">
                                <div className="flex items-center gap-2">
                                  {s.team_logo_url && <img src={s.team_logo_url} alt={`Logo ${s.team}`} className="h-5 w-5 object-contain" />}
                                  {s.team}
                                </div>
                              </td>
                              <td className="text-center py-2 font-sport">{s.played}</td>
                              <td className="text-center py-2 font-sport">{s.won}</td>
                              <td className="text-center py-2 font-sport">{s.draw}</td>
                              <td className="text-center py-2 font-sport">{s.lost}</td>
                              <td className="text-center py-2 font-sport">{s.goals_for}</td>
                              <td className="text-center py-2 font-sport">{s.goals_against}</td>
                              <td className="text-center py-2 font-sport font-bold text-primary">{s.points}</td>
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

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sport-condensed font-bold text-foreground">
              {selectedEvent && formatLongDate(selectedEvent.date)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedEvent?.events.map((e, i) => (
              <Card key={i} className="border border-border/20">
                <CardContent className="p-4 space-y-3">
                  {e.type === "match" && (
                    <div className="flex items-center justify-center gap-3 text-center">
                      {e.home_logo && <img src={e.home_logo} alt={e.team_home || "Domicile"} className="h-7 w-7 object-contain" />}
                      <span className="font-sport-condensed font-bold">{e.team_home || "Domicile"}</span>
                      <span className="text-muted-foreground">VS</span>
                      <span className="font-sport-condensed font-bold">{e.team_away || "Extérieur"}</span>
                      {e.away_logo && <img src={e.away_logo} alt={e.team_away || "Extérieur"} className="h-7 w-7 object-contain" />}
                    </div>
                  )}

                  <div className="space-y-2 text-sm font-sport">
                    {(e.start_time || e.end_time) && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {e.start_time || ""} {e.end_time ? `→ ${e.end_time}` : ""}
                        </span>
                      </div>
                    )}
                    {e.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{e.location}</span>
                      </div>
                    )}
                    {typeof e.score_home === "number" && typeof e.score_away === "number" && (
                      <div>Score : {e.score_home} - {e.score_away}</div>
                    )}
                    {e.title && <div className="text-muted-foreground">{e.title}</div>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendrier;
