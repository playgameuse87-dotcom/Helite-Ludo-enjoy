import { useState, useCallback } from "react";
import { Scene } from "./Scene";
import { Board3D } from "./Board3D";
import { Token3D } from "./Token3D";
import { Dice3D } from "./Dice3D";
import { GameControls } from "./GameControls";
import { 
  PLAYER_COLORS, 
  TOKENS_PER_PLAYER, 
  BOARD_SIZE, 
  SAFE_POSITIONS,
  START_POSITIONS,
  FINISH_PATH_LENGTH,
  getBoardCellPosition,
  getBaseTokenPosition,
  getFinishPathPosition,
} from "./constants";
import { useToast } from "@/hooks/use-toast";

interface Token {
  position: number; // -1 = dans la base, 0-51 = sur le parcours, 52+ = chemin final, 58 = HOME
  isHome: boolean;
  isFinished: boolean;
  inFinishPath: boolean;
  finishPathStep: number;
}

interface Player {
  id: number;
  name: string;
  tokens: Token[];
  tokensFinished: number;
}

export const LudoGame3D = () => {
  const { toast } = useToast();
  
  // Initialiser les joueurs
  const [players, setPlayers] = useState<Player[]>(() =>
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      name: PLAYER_COLORS[i as keyof typeof PLAYER_COLORS].name,
      tokens: Array.from({ length: TOKENS_PER_PLAYER }, () => ({
        position: -1,
        isHome: true,
        isFinished: false,
        inFinishPath: false,
        finishPathStep: 0,
      })),
      tokensFinished: 0,
    }))
  );

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [canMove, setCanMove] = useState(false);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [movingTokens, setMovingTokens] = useState<Set<string>>(new Set());
  const [winner, setWinner] = useState<number | null>(null);

  // Vérifier si un joueur peut jouer
  const canPlayerMove = useCallback((player: Player, diceVal: number): boolean => {
    return player.tokens.some((token) => {
      if (token.isFinished) return false;
      
      // Si le token est à la maison, il faut un 6
      if (token.isHome) return diceVal === 6;
      
      // Si dans le chemin final
      if (token.inFinishPath) {
        return token.finishPathStep + diceVal <= FINISH_PATH_LENGTH;
      }
      
      // Sur le parcours principal
      return true;
    });
  }, []);

  // Lancer le dé
  const rollDice = useCallback(() => {
    if (canMove || isRolling || winner !== null) return;

    setIsRolling(true);
    setSelectedTokenIndex(null);

    setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1;
      setDiceValue(value);
      setIsRolling(false);

      const currentPlayer = players[currentPlayerIndex];
      const canMoveNow = canPlayerMove(currentPlayer, value);

      if (canMoveNow) {
        setCanMove(true);
        toast({
          title: `${currentPlayer.name} a lancé un ${value}`,
          description: "Sélectionnez un pion à déplacer",
        });
      } else {
        toast({
          title: `${currentPlayer.name} a lancé un ${value}`,
          description: "Aucun mouvement possible",
          variant: "destructive",
        });
        
        setTimeout(() => nextTurn(), 1500);
      }
    }, 1000);
  }, [canMove, isRolling, winner, players, currentPlayerIndex, canPlayerMove, toast]);

  // Passer au tour suivant
  const nextTurn = useCallback(() => {
    setDiceValue(null);
    setCanMove(false);
    setSelectedTokenIndex(null);
    setCurrentPlayerIndex((prev) => (prev + 1) % 4);
  }, []);

  // Déplacer un token
  const moveToken = useCallback((tokenIndex: number) => {
    if (!canMove || diceValue === null || winner !== null) return;

    const currentPlayer = players[currentPlayerIndex];
    const token = currentPlayer.tokens[tokenIndex];

    if (token.isFinished) return;

    const tokenKey = `${currentPlayerIndex}-${tokenIndex}`;
    setMovingTokens(prev => new Set(prev).add(tokenKey));

    setTimeout(() => {
      setPlayers((prevPlayers) => {
        const newPlayers = [...prevPlayers];
        const player = { ...newPlayers[currentPlayerIndex] };
        const tokens = [...player.tokens];
        const newToken = { ...tokens[tokenIndex] };

        // Sortir de la maison avec un 6
        if (newToken.isHome && diceValue === 6) {
          newToken.isHome = false;
          newToken.position = START_POSITIONS[currentPlayerIndex];
          
          toast({
            title: "Pion sorti de la base !",
            description: `${player.name} entre dans la partie`,
          });
        }
        // Déplacement dans le chemin final
        else if (newToken.inFinishPath) {
          newToken.finishPathStep += diceValue;
          
          if (newToken.finishPathStep >= FINISH_PATH_LENGTH) {
            newToken.isFinished = true;
            player.tokensFinished += 1;
            
            toast({
              title: "Pion terminé !",
              description: `${player.name} a un pion qui arrive à HOME`,
            });

            // Vérifier la victoire
            if (player.tokensFinished === TOKENS_PER_PLAYER) {
              setWinner(currentPlayerIndex);
              toast({
                title: "🏆 Victoire !",
                description: `${player.name} remporte la partie !`,
              });
            }
          }
        }
        // Déplacement sur le parcours principal
        else if (!newToken.isHome) {
          const distanceFromStart = (newToken.position - START_POSITIONS[currentPlayerIndex] + BOARD_SIZE) % BOARD_SIZE;
          
          // Entrer dans le chemin final
          if (distanceFromStart + diceValue >= BOARD_SIZE - 1) {
            newToken.inFinishPath = true;
            newToken.finishPathStep = (distanceFromStart + diceValue) - (BOARD_SIZE - 1);
            
            if (newToken.finishPathStep >= FINISH_PATH_LENGTH) {
              newToken.isFinished = true;
              player.tokensFinished += 1;
              
              if (player.tokensFinished === TOKENS_PER_PLAYER) {
                setWinner(currentPlayerIndex);
              }
            }
          } else {
            // Déplacement normal
            newToken.position = (newToken.position + diceValue) % BOARD_SIZE;

            // Vérifier les captures
            newPlayers.forEach((otherPlayer, playerIdx) => {
              if (playerIdx !== currentPlayerIndex) {
                otherPlayer.tokens.forEach((otherToken, idx) => {
                  if (
                    !otherToken.isHome &&
                    !otherToken.inFinishPath &&
                    !otherToken.isFinished &&
                    otherToken.position === newToken.position &&
                    !SAFE_POSITIONS.includes(newToken.position)
                  ) {
                    // Capturer le pion
                    const capturedPlayer = { ...newPlayers[playerIdx] };
                    const capturedTokens = [...capturedPlayer.tokens];
                    capturedTokens[idx] = {
                      position: -1,
                      isHome: true,
                      isFinished: false,
                      inFinishPath: false,
                      finishPathStep: 0,
                    };
                    capturedPlayer.tokens = capturedTokens;
                    newPlayers[playerIdx] = capturedPlayer;

                    toast({
                      title: "Pion capturé !",
                      description: `${player.name} capture un pion de ${otherPlayer.name}`,
                    });
                  }
                });
              }
            });
          }
        }

        tokens[tokenIndex] = newToken;
        player.tokens = tokens;
        newPlayers[currentPlayerIndex] = player;

        return newPlayers;
      });

      setMovingTokens(prev => {
        const next = new Set(prev);
        next.delete(tokenKey);
        return next;
      });

      setCanMove(false);
      setSelectedTokenIndex(null);

      // Rejouer si 6, sinon passer au tour suivant
      setTimeout(() => {
        if (diceValue === 6 && winner === null) {
          setDiceValue(null);
          toast({
            title: "Vous avez fait un 6 !",
            description: "Vous pouvez rejouer",
          });
        } else {
          nextTurn();
        }
      }, 500);
    }, 100);
  }, [canMove, diceValue, winner, players, currentPlayerIndex, nextTurn, toast]);

  // Sélectionner un token
  const selectToken = useCallback((tokenIndex: number) => {
    if (!canMove || diceValue === null) return;

    const token = players[currentPlayerIndex].tokens[tokenIndex];
    
    // Vérifier si le token peut bouger
    if (token.isFinished) return;
    
    if (token.isHome && diceValue !== 6) return;
    
    if (token.inFinishPath && token.finishPathStep + diceValue > FINISH_PATH_LENGTH) return;

    setSelectedTokenIndex(tokenIndex);
    moveToken(tokenIndex);
  }, [canMove, diceValue, players, currentPlayerIndex, moveToken]);

  // Obtenir la position 3D d'un token
  const getTokenPosition = (playerId: number, token: Token, tokenIndex: number): [number, number, number] => {
    if (token.isFinished) {
      return [0, 0.5, 0]; // Centre HOME
    }
    
    if (token.isHome) {
      return getBaseTokenPosition(playerId, tokenIndex);
    }
    
    if (token.inFinishPath) {
      const pos = getFinishPathPosition(playerId, token.finishPathStep);
      return [pos[0], pos[1] + 0.3, pos[2]];
    }
    
    const pos = getBoardCellPosition(token.position);
    return [pos[0], pos[1] + 0.3, pos[2]];
  };

  // Vérifier si un token est jouable
  const isTokenPlayable = (token: Token): boolean => {
    if (!canMove || diceValue === null || token.isFinished) return false;
    
    if (token.isHome) return diceValue === 6;
    
    if (token.inFinishPath) {
      return token.finishPathStep + diceValue <= FINISH_PATH_LENGTH;
    }
    
    return true;
  };

  // Redémarrer la partie
  const restartGame = useCallback(() => {
    setPlayers(
      Array.from({ length: 4 }, (_, i) => ({
        id: i,
        name: PLAYER_COLORS[i as keyof typeof PLAYER_COLORS].name,
        tokens: Array.from({ length: TOKENS_PER_PLAYER }, () => ({
          position: -1,
          isHome: true,
          isFinished: false,
          inFinishPath: false,
          finishPathStep: 0,
        })),
        tokensFinished: 0,
      }))
    );
    setCurrentPlayerIndex(0);
    setDiceValue(null);
    setCanMove(false);
    setSelectedTokenIndex(null);
    setWinner(null);
  }, []);

  return (
    <div className="w-full h-screen relative">
      <Scene>
        <Board3D />
        
        {/* Dé 3D */}
        <Dice3D value={diceValue || 1} isRolling={isRolling} position={[-8, 1.5, 8]} />

        {/* Tokens pour chaque joueur */}
        {players.map((player, playerIdx) =>
          player.tokens.map((token, tokenIdx) => {
            if (token.isFinished) return null;
            
            const position = getTokenPosition(playerIdx, token, tokenIdx);
            const tokenKey = `${playerIdx}-${tokenIdx}`;
            
            return (
              <Token3D
                key={tokenKey}
                color={PLAYER_COLORS[playerIdx as keyof typeof PLAYER_COLORS].color}
                position={position}
                isSelected={selectedTokenIndex === tokenIdx && playerIdx === currentPlayerIndex}
                isPlayable={playerIdx === currentPlayerIndex && isTokenPlayable(token)}
                onClick={() => selectToken(tokenIdx)}
                isMoving={movingTokens.has(tokenKey)}
              />
            );
          })
        )}
      </Scene>

      {/* Interface utilisateur superposée */}
      <GameControls
        currentPlayer={currentPlayerIndex}
        diceValue={diceValue}
        canRoll={!canMove && !isRolling && winner === null}
        canMove={canMove}
        onRollDice={rollDice}
        players={players.map(p => ({ name: p.name, tokensFinished: p.tokensFinished }))}
        winner={winner}
        onRestart={restartGame}
      />
    </div>
  );
};
