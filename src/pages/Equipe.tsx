import { useState, useEffect } from 'react';
import { Users, AlertCircle, Settings } from 'lucide-react';

// Configuration parameter for Google Sheets CSV
const GOOGLE_SHEET_CSV_URL = process.env.GOOGLE_SHEET_CSV_URL || "";

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
        const response = await fetch(GOOGLE_SHEET_CSV_URL);
        const csvText = await response.text();
        
        // Parse CSV
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
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
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const PlayerCard = ({ player }: { player: Player }) => (
    <div className="bg-card p-4 rounded-lg shadow-card border border-border/20 transition-sport hover:shadow-sport">
      <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
        {player.photo_url ? (
          <img 
            src={player.photo_url} 
            alt={`${player.first_name} ${player.last_name}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-hero">
            <Users className="h-12 w-12 text-white" />
          </div>
        )}
      </div>
      
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="bg-primary text-primary-foreground font-sport-condensed font-bold text-lg px-3 py-1 rounded">
            #{player.number}
          </span>
        </div>
        <h3 className="font-sport-condensed font-bold text-lg text-foreground">
          {player.first_name}
        </h3>
        <p className="font-sport-condensed font-bold text-lg text-foreground">
          {player.last_name}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 px-4 text-center">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-sport-condensed font-bold text-white mb-6">
            Notre équipe
          </h1>
          <p className="text-xl text-white/90 font-sport">
            Découvrez les joueurs qui font la fierté du FC Ardentis
          </p>
        </div>
      </section>

      {/* Admin Notice */}
      <section className="py-8 px-4 bg-accent/20">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-sport">
            <Settings className="h-5 w-5" />
            <p>
              <strong>Notice admin :</strong> Pour mettre à jour l'effectif, modifiez la Google Sheet. 
              La page se met à jour automatiquement.
            </p>
          </div>
        </div>
      </section>

      {/* Players Grid */}
      <section className="py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 text-muted-foreground font-sport">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                Chargement de l'équipe...
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 text-destructive font-sport">
                <AlertCircle className="h-6 w-6" />
                {error}
              </div>
            </div>
          ) : Object.keys(players).length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-sport-condensed font-bold text-foreground mb-2">
                Effectif à venir
              </h3>
              <p className="text-muted-foreground font-sport mb-4">
                L'effectif sera affiché une fois la Google Sheet configurée
              </p>
              <p className="text-sm text-muted-foreground font-sport">
                Configurez GOOGLE_SHEET_CSV_URL pour afficher automatiquement les joueurs
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {positionOrder.map(position => {
                const positionPlayers = players[position] || [];
                if (positionPlayers.length === 0) return null;

                return (
                  <div key={position} className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-sport-condensed font-bold text-center text-foreground">
                      {positionLabels[position]}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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