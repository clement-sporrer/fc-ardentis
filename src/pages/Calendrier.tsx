import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Dumbbell, Calendar as CalendarIcon, Clock, MapPin, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

// Configuration parameter for Google Sheets CSV
const GOOGLE_SHEET_EVENTS_CSV_URL = import.meta.env.VITE_GOOGLE_SHEET_EVENTS_CSV_URL || "";
const GOOGLE_SHEET_STANDINGS_CSV_URL = import.meta.env.VITE_SHEET_STANDINGS_CSV_URL || "";

interface Event {
  date: string; // DD/MM/YYYY
  time: string; // HH:MM
  type: 'match' | 'entrainement';
  opponent?: string;
  location: string;
  score_for?: number;
  score_against?: number;
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

const Calendrier = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [standingsLoading, setStandingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<{ events: Event[], date: string } | null>(null);
  const [showAllPastMatches, setShowAllPastMatches] = useState(false);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  useEffect(() => {
    const fetchEvents = async () => {
      if (!GOOGLE_SHEET_EVENTS_CSV_URL) {
        setLoading(false);
        return;
      }

      try {
        const url = `${GOOGLE_SHEET_EVENTS_CSV_URL}${GOOGLE_SHEET_EVENTS_CSV_URL.includes('?') ? '&' : '?'}_ts=${Date.now()}`;
        const response = await fetch(url, { cache: 'no-store' });
        const raw = await response.text();
        
        const lines = raw.replace(/\r/g, '').split('\n').filter(Boolean);
        
        const eventData: Event[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= 4 && values[0]) {
            const event: Event = {
              date: values[0] || '',
              time: values[1] || '',
              type: (values[2]?.toLowerCase() === 'match' ? 'match' : 'entrainement') as 'match' | 'entrainement',
              opponent: values[3] || undefined,
              location: values[4] || '',
              score_for: values[5] ? parseInt(values[5]) : undefined,
              score_against: values[6] ? parseInt(values[6]) : undefined,
              home_logo: values[7] || undefined,
              away_logo: values[8] || undefined
            };
            eventData.push(event);
          }
        }

        setEvents(eventData);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des événements");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStandings = async () => {
      if (!GOOGLE_SHEET_STANDINGS_CSV_URL) {
        setStandingsLoading(false);
        return;
      }

      try {
        const url = `${GOOGLE_SHEET_STANDINGS_CSV_URL}${GOOGLE_SHEET_STANDINGS_CSV_URL.includes('?') ? '&' : '?'}_ts=${Date.now()}`;
        const response = await fetch(url, { cache: 'no-store' });
        const raw = await response.text();
        
        const lines = raw.replace(/\r/g, '').split('\n').filter(Boolean);
        const standingData: Standing[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= 8 && values[0]) {
            const standing: Standing = {
              rank: parseInt(values[0]) || 0,
              team: values[1] || '',
              played: parseInt(values[2]) || 0,
              won: parseInt(values[3]) || 0,
              draw: parseInt(values[4]) || 0,
              lost: parseInt(values[5]) || 0,
              goals_for: parseInt(values[6]) || 0,
              goals_against: parseInt(values[7]) || 0,
              points: parseInt(values[8]) || 0,
              team_logo_url: values[9] || undefined
            };
            standingData.push(standing);
          }
        }

        setStandings(standingData);
      } catch (err) {
        console.error('Error fetching standings:', err);
      } finally {
        setStandingsLoading(false);
      }
    };

    fetchStandings();
  }, []);

  const parseEventDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatEventDate = (dateStr: string) => {
    const date = parseEventDate(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    
    // Generate 6 weeks of days (42 days)
    for (let i = 0; i < 42; i++) {
      const dayEvents = events.filter(event => {
        const eventDate = parseEventDate(event.date);
        return eventDate.getTime() === current.getTime();
      });
      
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        events: dayEvents
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: CalendarDay) => {
    if (day.events.length > 0) {
      setSelectedEvent({
        events: day.events,
        date: day.events[0].date
      });
    }
  };

  const getEventIcons = (events: Event[]) => {
    const hasMatch = events.some(e => e.type === 'match');
    const hasTraining = events.some(e => e.type === 'entrainement');
    
    return (
      <div className="flex gap-1 justify-center">
        {hasMatch && <Trophy className="h-3 w-3 text-primary" />}
        {hasTraining && <Dumbbell className="h-3 w-3 text-secondary" />}
      </div>
    );
  };

  const calendarDays = generateCalendarDays();
  const currentMonthEvents = events.filter(event => {
    const eventDate = parseEventDate(event.date);
    return eventDate.getFullYear() === currentDate.getFullYear() &&
           eventDate.getMonth() === currentDate.getMonth();
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
        <div className="container max-w-5xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-sport-condensed font-bold text-white mb-6 text-center">
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Calendrier</span>
          </h1>
          <p className="text-lg text-white/90 font-sport max-w-3xl mx-auto text-center">
            Consultez nos matchs et entraînements à venir
          </p>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-20 px-4 bg-gradient-section">
        <div className="container max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar Grid - Left Column */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-3 text-muted-foreground font-sport">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
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
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-6">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth('prev')}
                        className="hover:bg-secondary hover:text-secondary-foreground"
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
                          Aujourd'hui
                        </Button>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth('next')}
                        className="hover:bg-secondary hover:text-secondary-foreground"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Day Headers */}
                      {dayNames.map(day => (
                        <div key={day} className="p-2 text-center text-sm font-sport font-medium text-muted-foreground">
                          {day}
                        </div>
                      ))}
                      
                      {/* Calendar Days */}
                      {calendarDays.map((day, index) => (
                        <div
                          key={index}
                          onClick={() => handleDayClick(day)}
                          className={`
                            p-2 min-h-[60px] border border-border/20 transition-sport
                            ${day.isCurrentMonth 
                              ? 'bg-card text-card-foreground' 
                              : 'bg-muted/30 text-muted-foreground'
                            }
                            ${day.events.length > 0 
                              ? 'cursor-pointer hover:bg-accent hover:border-primary/50' 
                              : ''
                            }
                            ${day.date.toDateString() === new Date().toDateString() 
                              ? 'ring-2 ring-primary ring-opacity-50' 
                              : ''
                            }
                          `}
                        >
                          <div className="text-sm font-sport font-medium mb-1">
                            {day.date.getDate()}
                          </div>
                          {day.events.length > 0 && getEventIcons(day.events)}
                        </div>
                      ))}
                    </div>

                    {/* No events message */}
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

            {/* Matches List - Right Column */}
            <div className="lg:col-span-1 space-y-8">
              {/* Upcoming Matches */}
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-sport-condensed font-bold text-foreground mb-4">Matchs à venir</h3>
                  <div className="space-y-3">
                    {events
                      .filter(event => event.type === 'match' && parseEventDate(event.date) >= new Date())
                      .slice(0, 5)
                      .map((event, index) => (
                        <div key={index} className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-sport">
                              <Trophy className="h-4 w-4 text-primary" />
                              <span className="font-medium">vs {event.opponent}</span>
                            </div>
                            <span className="text-xs text-muted-foreground font-sport">
                              {event.date} • {event.time}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 font-sport">{event.location}</p>
                        </div>
                      ))}
                    {events.filter(event => event.type === 'match' && parseEventDate(event.date) >= new Date()).length === 0 && (
                      <p className="text-sm text-muted-foreground font-sport">Aucun match programmé</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Past Matches */}
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-sport-condensed font-bold text-foreground">Matchs passés</h3>
                    {events.filter(event => event.type === 'match' && parseEventDate(event.date) < new Date()).length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllPastMatches(!showAllPastMatches)}
                        className="text-sm"
                      >
                        {showAllPastMatches ? 'Voir moins' : 'Voir plus'}
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {events
                      .filter(event => event.type === 'match' && parseEventDate(event.date) < new Date())
                      .slice(0, showAllPastMatches ? undefined : 3)
                      .map((event, index) => (
                        <div key={index} className="bg-muted/30 p-3 rounded-lg border border-border/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-sport">
                              <Trophy className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">vs {event.opponent}</span>
                              {(event.score_for !== undefined && event.score_against !== undefined) && (
                                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-bold">
                                  {event.score_for > event.score_against ? 'V' : 
                                   event.score_for === event.score_against ? 'N' : 'D'}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground font-sport">
                              {event.date}
                            </span>
                          </div>
                          {(event.score_for !== undefined && event.score_against !== undefined) && (
                            <p className="text-xs text-muted-foreground mt-1 font-sport">
                              Score: {event.score_for} - {event.score_against}
                            </p>
                          )}
                        </div>
                      ))}
                    {events.filter(event => event.type === 'match' && parseEventDate(event.date) < new Date()).length === 0 && (
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
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Classement
                    </span>
                  </h3>
                  {standingsLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-3 text-muted-foreground font-sport">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
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
                          {standings.map((standing, index) => (
                            <tr key={index} className={`border-b border-border/10 ${standing.team === 'FC Ardentis' ? 'bg-primary/5' : ''}`}>
                              <td className="py-2 font-sport font-medium">{standing.rank}</td>
                              <td className="py-2 font-sport font-medium flex items-center gap-2">
                                {standing.team_logo_url && (
                                  <img src={standing.team_logo_url} alt={`Logo ${standing.team}`} className="h-5 w-5 object-contain" />
                                )}
                                {standing.team}
                              </td>
                              <td className="text-center py-2 font-sport">{standing.played}</td>
                              <td className="text-center py-2 font-sport">{standing.won}</td>
                              <td className="text-center py-2 font-sport">{standing.draw}</td>
                              <td className="text-center py-2 font-sport">{standing.lost}</td>
                              <td className="text-center py-2 font-sport">{standing.goals_for}</td>
                              <td className="text-center py-2 font-sport">{standing.goals_against}</td>
                              <td className="text-center py-2 font-sport font-bold text-primary">{standing.points}</td>
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
              {selectedEvent && formatEventDate(selectedEvent.date)}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedEvent?.events.map((event, index) => (
              <Card key={index} className="border border-border/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {event.type === 'match' ? (
                      <Trophy className="h-5 w-5 text-primary" />
                    ) : (
                      <Dumbbell className="h-5 w-5 text-secondary" />
                    )}
                    <span className="font-sport-condensed font-bold text-lg capitalize">
                      {event.type}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm font-sport">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{event.time}</span>
                    </div>
                    
                    {event.opponent && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>vs {event.opponent}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
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