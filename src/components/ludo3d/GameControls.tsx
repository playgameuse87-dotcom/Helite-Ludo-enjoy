import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PLAYER_COLORS } from "./constants";

interface GameControlsProps {
  currentPlayer: number;
  diceValue: number | null;
  canRoll: boolean;
  canMove: boolean;
  onRollDice: () => void;
  players: Array<{ name: string; tokensFinished: number }>;
  winner: number | null;
  onRestart: () => void;
}

export const GameControls = ({
  currentPlayer,
  diceValue,
  canRoll,
  canMove,
  onRollDice,
  players,
  winner,
  onRestart,
}: GameControlsProps) => {
  const currentPlayerInfo = PLAYER_COLORS[currentPlayer as keyof typeof PLAYER_COLORS];

  return (
    <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
      <div className="max-w-6xl mx-auto flex justify-between items-start gap-4">
        {/* Informations des joueurs */}
        <div className="grid grid-cols-2 gap-2 pointer-events-auto">
          {players.map((player, idx) => {
            const playerInfo = PLAYER_COLORS[idx as keyof typeof PLAYER_COLORS];
            const isActive = idx === currentPlayer && !winner;
            
            return (
              <Card
                key={idx}
                className={`p-3 transition-all ${
                  isActive 
                    ? 'ring-4 ring-primary shadow-lg scale-105' 
                    : 'opacity-70'
                }`}
                style={{
                  borderLeft: `4px solid ${playerInfo.color}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: playerInfo.color }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{player.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {player.tokensFinished}/4 terminés
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Contrôles du dé */}
        <Card className="p-6 pointer-events-auto min-w-[200px]">
          <div className="text-center space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tour de</p>
              <p 
                className="font-bold text-lg"
                style={{ color: currentPlayerInfo.color }}
              >
                {currentPlayerInfo.name}
              </p>
            </div>

            {diceValue !== null && (
              <div className="flex items-center justify-center gap-2">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold shadow-lg"
                  style={{
                    backgroundColor: currentPlayerInfo.color,
                    color: '#ffffff',
                  }}
                >
                  {diceValue}
                </div>
              </div>
            )}

            <Button
              onClick={onRollDice}
              disabled={!canRoll || !!winner}
              className="w-full"
              size="lg"
            >
              {canMove ? "En attente du mouvement..." : "Lancer le dé 🎲"}
            </Button>

            {!canMove && diceValue !== null && (
              <p className="text-xs text-muted-foreground">
                {diceValue === 6 ? "Vous pouvez rejouer !" : "Aucun mouvement possible"}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Message de victoire */}
      {winner !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center pointer-events-auto z-50">
          <Card className="p-8 max-w-md text-center space-y-4 animate-scale-in">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold">Victoire !</h2>
            <p 
              className="text-xl font-semibold"
              style={{ color: PLAYER_COLORS[winner as keyof typeof PLAYER_COLORS].color }}
            >
              {PLAYER_COLORS[winner as keyof typeof PLAYER_COLORS].name} a gagné !
            </p>
            <Button onClick={onRestart} size="lg" className="w-full">
              Nouvelle partie
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
