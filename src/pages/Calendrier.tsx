import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Dumbbell, Calendar as CalendarIcon, Clock, MapPin, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

// Configuration parameter for Google Sheets CSV
const GOOGLE_SHEET_EVENTS_CSV_URL = import.meta.env.VITE_GOOGLE_SHEET_EVENTS_CSV_URL || "";

interface Event {
  date: string; // DD/MM/YYYY
  time: string; // HH:MM
  type: 'match' | 'entrainement';
  opponent?: string;
  location: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: Event[];
}

const Calendrier = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<{ events: Event[], date: string } | null>(null);

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
              location: values.slice(4).join(',').trim() || ''
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
      <section className="bg-gradient-hero py-16 px-4 text-center">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-sport-condensed font-bold text-white mb-6">
            Calendrier
          </h1>
          <p className="text-xl text-white/90 font-sport">
            Consultez nos matchs et entraînements à venir
          </p>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
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
