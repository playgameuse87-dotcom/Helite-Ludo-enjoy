// Constantes pour le jeu Ludo 3D

export const BOARD_SIZE = 52; // Nombre de cases du parcours principal
export const TOKENS_PER_PLAYER = 4;
export const FINISH_PATH_LENGTH = 6; // Cases du chemin final coloré

// Couleurs des joueurs
export const PLAYER_COLORS = {
  0: { name: "Rouge", color: "#ef4444", startPos: 0 },
  1: { name: "Bleu", color: "#3b82f6", startPos: 13 },
  2: { name: "Jaune", color: "#facc15", startPos: 26 },
  3: { name: "Vert", color: "#22c55e", startPos: 39 },
};

// Positions sécurisées (étoiles) où les pions ne peuvent pas être capturés
export const SAFE_POSITIONS = [1, 9, 14, 22, 27, 35, 40, 48];

// Positions de départ pour chaque joueur
export const START_POSITIONS = [0, 13, 26, 39];

// Configuration du plateau 3D
export const BOARD_CONFIG = {
  cellSize: 0.8,
  cellHeight: 0.1,
  cellGap: 0.05,
  tokenRadius: 0.3,
  tokenHeight: 0.6,
  diceSize: 0.5,
  boardThickness: 0.3,
};

// Positions 3D des cases du plateau (disposition en croix)
export const getBoardCellPosition = (index: number): [number, number, number] => {
  const { cellSize, cellGap } = BOARD_CONFIG;
  const step = cellSize + cellGap;
  
  // Le plateau est disposé en croix avec 4 bras
  // Chaque bras fait 6 cases de long
  
  // Bras inférieur (cases 0-5) - Rouge monte
  if (index >= 0 && index < 6) {
    return [-step, 0, 3 * step - index * step];
  }
  
  // Coin inférieur gauche (cases 6-7)
  if (index === 6) return [-step, 0, -2 * step];
  if (index === 7) return [-2 * step, 0, -2 * step];
  
  // Bras gauche (cases 8-12) - Rouge vers la gauche
  if (index >= 8 && index < 13) {
    return [-2 * step - (index - 8) * step, 0, -step];
  }
  
  // Bras gauche (case 13) - Bleu commence
  if (index === 13) return [-2 * step - 5 * step, 0, -step];
  
  // Bras gauche montant (cases 14-18) - Bleu monte
  if (index >= 14 && index < 19) {
    return [-2 * step - 5 * step, 0, -step - (index - 13) * step];
  }
  
  // Coin supérieur gauche (cases 19-20)
  if (index === 19) return [-2 * step - 5 * step, 0, -6 * step];
  if (index === 20) return [-2 * step - 5 * step, 0, -7 * step];
  
  // Bras supérieur (cases 21-25) - vers la droite
  if (index >= 21 && index < 26) {
    return [-2 * step - 5 * step + (index - 20) * step, 0, -7 * step];
  }
  
  // Case 26 - Jaune commence
  if (index === 26) return [step, 0, -7 * step];
  
  // Bras supérieur droite (cases 27-31)
  if (index >= 27 && index < 32) {
    return [step, 0, -7 * step + (index - 26) * step];
  }
  
  // Coin supérieur droit (cases 32-33)
  if (index === 32) return [step, 0, -step];
  if (index === 33) return [2 * step, 0, -step];
  
  // Bras droit (cases 34-38)
  if (index >= 34 && index < 39) {
    return [2 * step + (index - 33) * step, 0, -step];
  }
  
  // Case 39 - Vert commence
  if (index === 39) return [7 * step, 0, -step];
  
  // Bras droit descendant (cases 40-44) - Vert descend
  if (index >= 40 && index < 45) {
    return [7 * step, 0, -step + (index - 39) * step];
  }
  
  // Coin inférieur droit (cases 45-46)
  if (index === 45) return [7 * step, 0, 3 * step];
  if (index === 46) return [7 * step, 0, 4 * step];
  
  // Bras inférieur retour (cases 47-51)
  if (index >= 47 && index < 52) {
    return [7 * step - (index - 46) * step, 0, 4 * step];
  }
  
  // Défaut - centre
  return [0, 0, 0];
};

// Positions des zones de départ (bases)
export const getHomeBasePosition = (playerId: number): [number, number, number] => {
  const offset = 2;
  switch (playerId) {
    case 0: return [-offset, 0.2, offset]; // Rouge - bas gauche
    case 1: return [-offset, 0.2, -offset]; // Bleu - haut gauche
    case 2: return [offset, 0.2, -offset]; // Jaune - haut droite
    case 3: return [offset, 0.2, offset]; // Vert - bas droite
    default: return [0, 0, 0];
  }
};

// Positions des tokens dans leur base (4 tokens par base)
export const getBaseTokenPosition = (playerId: number, tokenIndex: number): [number, number, number] => {
  const basePos = getHomeBasePosition(playerId);
  const offset = 0.5;
  
  const offsets: [number, number][] = [
    [-offset, -offset],
    [offset, -offset],
    [-offset, offset],
    [offset, offset],
  ];
  
  const [dx, dz] = offsets[tokenIndex];
  return [basePos[0] + dx, basePos[1], basePos[2] + dz];
};

// Positions du chemin final coloré (6 cases avant HOME)
export const getFinishPathPosition = (playerId: number, step: number): [number, number, number] => {
  const { cellSize, cellGap } = BOARD_CONFIG;
  const cellStep = cellSize + cellGap;
  
  switch (playerId) {
    case 0: // Rouge - monte vers le centre
      return [-cellStep, 0.05, 3 * cellStep - step * cellStep];
    case 1: // Bleu - va vers la droite
      return [-2 * cellStep - 5 * cellStep + step * cellStep, 0.05, -cellStep];
    case 2: // Jaune - descend vers le centre
      return [cellStep, 0.05, -7 * cellStep + step * cellStep];
    case 3: // Vert - va vers la gauche
      return [7 * cellStep - step * cellStep, 0.05, -cellStep];
    default:
      return [0, 0, 0];
  }
};
