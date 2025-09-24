import { useState, useEffect } from 'react';
import { Users, AlertCircle, Settings } from 'lucide-react';

// Configuration parameter for Google Sheets CSV
const GOOGLE_SHEET_CSV_URL = import.meta.env.VITE_GOOGLE_SHEET_CSV_URL || "";

interface Player {
  first_name: string;
  last_name: string;
  number: string;
  position: string;
  photo_url?: string;
}

interface PlayersByPosition {
  [key: string]: Player[];
}

const Equipe = () => {
  const [players, setPlayers] = useState<PlayersByPosition>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const positionOrder = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
  const positionLabels: { [key: string]: string } = {
    'Goalkeeper': 'Gardiens de but',
    'Defender': 'Défenseurs',
    'Midfielder': 'Milieux de terrain',
    'Forward': 'Attaquants'
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!GOOGLE_SHEET_CSV_URL) {
        setLoading(false);
        return;
      }

      try {
        // Anti-cache: on ajoute un timestamp pour forcer le rafraîchissement côté navigateur/CDN
        const url = `${GOOGLE_SHEET_CSV_URL}${GOOGLE_SHEET_CSV_URL.includes('?') ? '&' : '?'}_ts=${Date.now()}`;
        const response = await fetch(url, { cache: 'no-store' });
        const raw = await response.text();
        
        // Parse CSV
        // Parsing robuste: on retire les \r (Windows) puis on ignore les lignes vides
        const lines = raw.replace(/\r/g, '').split('\n').filter(Boolean);
        
        const playerData: Player[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= 4 && values[0]) {
            const player: Player = {
              first_name: values[0] || '',
              last_name: values[1] || '',
              number: values[2] || '',
              position: values[3] || '',
              photo_url: values[4] || undefined
            };
            playerData.push(player);
          }
        }

        // Group by position
        const grouped = playerData.reduce((acc, player) => {
          if (!acc[player.position]) {
            acc[player.position] = [];
          }
          acc[player.position].push(player);
          return acc;
        }, {} as PlayersByPosition);

        setPlayers(grouped);
        setError(null); // on remet l'erreur à zéro si tout s'est bien passé
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers(); // au montage
    const interval = setInterval(fetchPlayers, 10_000); // auto-refresh toutes les 10 s
    return () => clearInterval(interval);

  }, []);

  const PlayerCard = ({ player }: { player: Player }) => (
    <div className="bg-gradient-card p-6 rounded-2xl shadow-card border border-border/10 hover-lift group">
      <div className="aspect-square bg-gradient-to-br from-muted to-muted/70 rounded-xl mb-6 overflow-hidden">
        {player.photo_url ? (
          <img 
            src={player.photo_url} 
            alt={`${player.first_name} ${player.last_name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-sport"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-accent">
            <Users className="h-16 w-16 text-white" />
          </div>
        )}
      </div>
      
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="bg-gradient-to-r from-accent to-primary text-white font-sport-condensed font-bold text-xl px-4 py-2 rounded-full shadow-elevated">
            #{player.number}
          </span>
        </div>
        <h3 className="font-sport-condensed font-bold text-xl text-foreground mb-1">
          {player.first_name}
        </h3>
        <p className="font-sport-condensed font-bold text-xl text-foreground/80">
          {player.last_name}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Modern Hero Section */}
      <section className="bg-gradient-hero py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
        <div className="container max-w-5xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-sport-condensed font-bold text-white mb-8 leading-tight">
            Notre <span className="bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">équipe</span>
          </h1>
          <p className="text-2xl md:text-3xl text-white/95 font-sport font-medium">
            🏆 Découvrez les joueurs qui font la fierté du FC Ardentis
          </p>
        </div>
      </section>

      {/* Modern Admin Notice */}
      <section className="py-6 px-4 bg-gradient-section border-b border-border/10">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground font-sport bg-gradient-card p-4 rounded-xl shadow-card">
            <Settings className="h-5 w-5 text-primary" />
            <p>
              <strong className="text-foreground">Notice admin :</strong> Pour mettre à jour l'effectif, modifiez la Google Sheet. 
              La page se met à jour automatiquement toutes les 10 secondes.
            </p>
          </div>
        </div>
      </section>

      {/* Modern Players Grid */}
      <section className="py-20 px-4 bg-gradient-section">
        <div className="container max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-4 text-muted-foreground font-sport text-lg bg-gradient-card p-6 rounded-2xl shadow-card">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                Chargement de l'équipe...
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-4 text-destructive font-sport text-lg bg-gradient-card p-6 rounded-2xl shadow-card">
                <AlertCircle className="h-8 w-8" />
                {error}
              </div>
            </div>
          ) : Object.keys(players).length === 0 ? (
            <div className="text-center py-16 max-w-2xl mx-auto">
              <div className="bg-gradient-card p-12 rounded-3xl shadow-card border border-border/10">
                <Users className="h-20 w-20 text-primary mx-auto mb-6" />
                <h3 className="text-3xl font-sport-condensed font-bold text-foreground mb-4">
                  🚀 Effectif à venir
                </h3>
                <p className="text-muted-foreground font-sport text-lg mb-6 leading-relaxed">
                  L'effectif sera affiché une fois la Google Sheet configurée.<br />
                  Nos joueurs taléntueux arrivent bientôt !
                </p>
                <p className="text-sm text-muted-foreground font-sport bg-muted/50 p-4 rounded-xl">
                  <strong>Admin :</strong> Configurez VITE_GOOGLE_SHEET_CSV_URL pour afficher automatiquement les joueurs
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-16">
              {positionOrder.map(position => {
                const positionPlayers = players[position] || [];
                if (positionPlayers.length === 0) return null;

                return (
                  <div key={position} className="space-y-8">
                    <h2 className="text-3xl md:text-5xl font-sport-condensed font-bold text-center text-foreground">
                      <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {positionLabels[position]}
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {positionPlayers.map((player, index) => (
                        <PlayerCard key={`${position}-${index}`} player={player} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Equipe;
