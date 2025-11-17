import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Token {
  id: number;
  position: number;
  isHome: boolean;
  isFinished: boolean;
}

interface Player {
  id: number;
  name: string;
  color: string;
  tokens: Token[];
}

const BOARD_SIZE = 52;
const SAFE_POSITIONS = [1, 9, 14, 22, 27, 35, 40, 48];

export const LudoBoard = () => {
  const [players, setPlayers] = useState<Player[]>([
    {
      id: 1,
      name: "Rouge",
      color: "hsl(0, 84%, 60%)",
      tokens: [
        { id: 1, position: -1, isHome: true, isFinished: false },
        { id: 2, position: -1, isHome: true, isFinished: false },
        { id: 3, position: -1, isHome: true, isFinished: false },
        { id: 4, position: -1, isHome: true, isFinished: false },
      ],
    },
    {
      id: 2,
      name: "Bleu",
      color: "hsl(217, 91%, 60%)",
      tokens: [
        { id: 1, position: -1, isHome: true, isFinished: false },
        { id: 2, position: -1, isHome: true, isFinished: false },
        { id: 3, position: -1, isHome: true, isFinished: false },
        { id: 4, position: -1, isHome: true, isFinished: false },
      ],
    },
    {
      id: 3,
      name: "Jaune",
      color: "hsl(48, 96%, 53%)",
      tokens: [
        { id: 1, position: -1, isHome: true, isFinished: false },
        { id: 2, position: -1, isHome: true, isFinished: false },
        { id: 3, position: -1, isHome: true, isFinished: false },
        { id: 4, position: -1, isHome: true, isFinished: false },
      ],
    },
    {
      id: 4,
      name: "Vert",
      color: "hsl(142, 71%, 45%)",
      tokens: [
        { id: 1, position: -1, isHome: true, isFinished: false },
        { id: 2, position: -1, isHome: true, isFinished: false },
        { id: 3, position: -1, isHome: true, isFinished: false },
        { id: 4, position: -1, isHome: true, isFinished: false },
      ],
    },
  ]);

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [canMove, setCanMove] = useState(false);
  const [selectedToken, setSelectedToken] = useState<number | null>(null);

  const rollDice = () => {
    const value = Math.floor(Math.random() * 6) + 1;
    setDiceValue(value);
    setCanMove(true);
    setSelectedToken(null);
    
    const currentPlayer = players[currentPlayerIndex];
    const hasMovableTokens = currentPlayer.tokens.some(
      (token) => !token.isFinished && (token.position >= 0 || value === 6)
    );

    if (!hasMovableTokens) {
      toast.info(`${currentPlayer.name} ne peut pas bouger!`);
      setTimeout(() => nextTurn(), 1500);
    } else {
      toast.success(`${currentPlayer.name} a lancé un ${value}!`);
    }
  };

  const moveToken = (tokenIndex: number) => {
    if (!canMove || diceValue === null) return;

    const currentPlayer = players[currentPlayerIndex];
    const token = currentPlayer.tokens[tokenIndex];

    if (token.isFinished) return;

    // Can only leave home with a 6
    if (token.isHome && diceValue !== 6) {
      toast.error("Vous devez faire un 6 pour sortir!");
      return;
    }

    const newPlayers = [...players];
    const playerStartPosition = currentPlayerIndex * 13;

    if (token.isHome) {
      newPlayers[currentPlayerIndex].tokens[tokenIndex] = {
        ...token,
        isHome: false,
        position: playerStartPosition,
      };
      toast.success("Pion sorti de la base!");
    } else {
      const newPosition = (token.position + diceValue) % BOARD_SIZE;
      
      // Check if finished (simplified - after completing the board)
      if (token.position + diceValue >= BOARD_SIZE + 5) {
        newPlayers[currentPlayerIndex].tokens[tokenIndex] = {
          ...token,
          isFinished: true,
        };
        toast.success("Pion arrivé!");
      } else {
        newPlayers[currentPlayerIndex].tokens[tokenIndex] = {
          ...token,
          position: newPosition,
        };
      }
    }

    setPlayers(newPlayers);
    setCanMove(false);

    // Extra turn on 6
    if (diceValue !== 6) {
      setTimeout(() => nextTurn(), 800);
    } else {
      toast.info("Vous avez fait un 6! Rejouez!");
      setDiceValue(null);
    }
  };

  const nextTurn = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setDiceValue(null);
    setCanMove(false);
    setSelectedToken(null);
  };

  const DiceIcon = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6][
    diceValue ? diceValue - 1 : 0
  ];

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h1 className="text-4xl font-bold">Jeu de Ludo</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: currentPlayer.color }}
          />
          <span className="font-semibold">Tour de: {currentPlayer.name}</span>
          
          <Button onClick={rollDice} disabled={canMove} variant="default">
            {diceValue === null ? "Lancer le dé" : "Relancer"}
          </Button>

          {diceValue && (
            <div className="flex items-center gap-2">
              <DiceIcon className="w-8 h-8" />
              <span className="text-xl font-bold">{diceValue}</span>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2 w-[600px] h-[600px] bg-background border-4 border-border rounded-lg">
        {/* Red Home */}
        <div className="border-2 border-border p-4 flex items-center justify-center" style={{ backgroundColor: "hsl(0, 84%, 90%)" }}>
          <div className="grid grid-cols-2 gap-2">
            {players[0].tokens.map((token, idx) => (
              <Button
                key={idx}
                onClick={() => moveToken(idx)}
                disabled={!canMove || currentPlayerIndex !== 0}
                className="w-12 h-12 rounded-full p-0"
                style={{
                  backgroundColor: token.isHome ? players[0].color : "transparent",
                  border: token.isHome ? "none" : `2px solid ${players[0].color}`,
                }}
              >
                {!token.isHome && !token.isFinished && `P${token.position}`}
              </Button>
            ))}
          </div>
        </div>

        {/* Top Path */}
        <div className="border-2 border-border bg-accent/20" />

        {/* Blue Home */}
        <div className="border-2 border-border p-4 flex items-center justify-center" style={{ backgroundColor: "hsl(217, 91%, 90%)" }}>
          <div className="grid grid-cols-2 gap-2">
            {players[1].tokens.map((token, idx) => (
              <Button
                key={idx}
                onClick={() => moveToken(idx)}
                disabled={!canMove || currentPlayerIndex !== 1}
                className="w-12 h-12 rounded-full p-0"
                style={{
                  backgroundColor: token.isHome ? players[1].color : "transparent",
                  border: token.isHome ? "none" : `2px solid ${players[1].color}`,
                }}
              >
                {!token.isHome && !token.isFinished && `P${token.position}`}
              </Button>
            ))}
          </div>
        </div>

        {/* Left Path */}
        <div className="border-2 border-border bg-accent/20" />

        {/* Center */}
        <div className="border-2 border-border bg-primary/10 flex items-center justify-center">
          <div className="text-2xl font-bold">🏠</div>
        </div>

        {/* Right Path */}
        <div className="border-2 border-border bg-accent/20" />

        {/* Yellow Home */}
        <div className="border-2 border-border p-4 flex items-center justify-center" style={{ backgroundColor: "hsl(48, 96%, 90%)" }}>
          <div className="grid grid-cols-2 gap-2">
            {players[2].tokens.map((token, idx) => (
              <Button
                key={idx}
                onClick={() => moveToken(idx)}
                disabled={!canMove || currentPlayerIndex !== 2}
                className="w-12 h-12 rounded-full p-0"
                style={{
                  backgroundColor: token.isHome ? players[2].color : "transparent",
                  border: token.isHome ? "none" : `2px solid ${players[2].color}`,
                }}
              >
                {!token.isHome && !token.isFinished && `P${token.position}`}
              </Button>
            ))}
          </div>
        </div>

        {/* Bottom Path */}
        <div className="border-2 border-border bg-accent/20" />

        {/* Green Home */}
        <div className="border-2 border-border p-4 flex items-center justify-center" style={{ backgroundColor: "hsl(142, 71%, 90%)" }}>
          <div className="grid grid-cols-2 gap-2">
            {players[3].tokens.map((token, idx) => (
              <Button
                key={idx}
                onClick={() => moveToken(idx)}
                disabled={!canMove || currentPlayerIndex !== 3}
                className="w-12 h-12 rounded-full p-0"
                style={{
                  backgroundColor: token.isHome ? players[3].color : "transparent",
                  border: token.isHome ? "none" : `2px solid ${players[3].color}`,
                }}
              >
                {!token.isHome && !token.isFinished && `P${token.position}`}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Card className="p-4 max-w-md">
        <h3 className="font-semibold mb-2">Règles:</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Faites un 6 pour sortir un pion de la base</li>
          <li>• Déplacez vos pions selon le résultat du dé</li>
          <li>• Un 6 vous donne un tour supplémentaire</li>
          <li>• Le premier à amener tous ses pions à l'arrivée gagne!</li>
        </ul>
      </Card>
    </div>
  );
};
