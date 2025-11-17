import { BOARD_SIZE, SAFE_POSITIONS, PLAYER_COLORS, getBoardCellPosition, getHomeBasePosition, getFinishPathPosition, FINISH_PATH_LENGTH } from "./constants";
import { Text } from "@react-three/drei";

export const Board3D = () => {
  // Créer les cases du parcours principal
  const renderMainPath = () => {
    const cells = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = getBoardCellPosition(i);
      const isSafe = SAFE_POSITIONS.includes(i);
      
      cells.push(
        <group key={`cell-${i}`} position={pos}>
          {/* Case */}
          <mesh receiveShadow>
            <boxGeometry args={[0.75, 0.08, 0.75]} />
            <meshStandardMaterial 
              color={isSafe ? "#fbbf24" : "#f5f5f5"} 
              metalness={0.2}
              roughness={0.8}
            />
          </mesh>
          
          {/* Bordure */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.78, 0.02, 0.78]} />
            <meshStandardMaterial color="#666666" />
          </mesh>

          {/* Étoile sur les positions sécurisées */}
          {isSafe && (
            <Text
              position={[0, 0.09, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.3}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              ★
            </Text>
          )}
        </group>
      );
    }
    return cells;
  };

  // Créer les zones de départ (bases) pour chaque joueur
  const renderHomeBases = () => {
    const bases = [];
    
    for (let playerId = 0; playerId < 4; playerId++) {
      const basePos = getHomeBasePosition(playerId);
      const playerColor = PLAYER_COLORS[playerId as keyof typeof PLAYER_COLORS].color;
      
      bases.push(
        <group key={`base-${playerId}`} position={basePos}>
          {/* Plateforme de la base */}
          <mesh receiveShadow>
            <cylinderGeometry args={[1.8, 1.8, 0.15, 32]} />
            <meshStandardMaterial 
              color={playerColor} 
              metalness={0.3}
              roughness={0.6}
              opacity={0.9}
              transparent
            />
          </mesh>

          {/* Cercles pour les positions des tokens */}
          {[0, 1, 2, 3].map((tokenIdx) => {
            const offset = 0.6;
            const positions: [number, number, number][] = [
              [-offset, 0.1, -offset],
              [offset, 0.1, -offset],
              [-offset, 0.1, offset],
              [offset, 0.1, offset],
            ];
            
            return (
              <mesh key={`circle-${tokenIdx}`} position={positions[tokenIdx]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.3, 0.38, 32]} />
                <meshStandardMaterial color="#ffffff" opacity={0.6} transparent />
              </mesh>
            );
          })}
        </group>
      );
    }
    
    return bases;
  };

  // Créer les chemins finaux colorés (6 cases avant HOME)
  const renderFinishPaths = () => {
    const paths = [];
    
    for (let playerId = 0; playerId < 4; playerId++) {
      const playerColor = PLAYER_COLORS[playerId as keyof typeof PLAYER_COLORS].color;
      
      for (let step = 0; step < FINISH_PATH_LENGTH; step++) {
        const pos = getFinishPathPosition(playerId, step);
        
        paths.push(
          <group key={`finish-${playerId}-${step}`} position={pos}>
            <mesh receiveShadow>
              <boxGeometry args={[0.7, 0.06, 0.7]} />
              <meshStandardMaterial 
                color={playerColor} 
                metalness={0.2}
                roughness={0.7}
                opacity={0.8}
                transparent
              />
            </mesh>
            
            {/* Numéro */}
            <Text
              position={[0, 0.07, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.2}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {step + 1}
            </Text>
          </group>
        );
      }
    }
    
    return paths;
  };

  // Zone centrale HOME (triangle)
  const renderHomeCenter = () => {
    return (
      <group position={[0, 0.1, 0]}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.2, 3]} />
          <meshStandardMaterial 
            color="#ffd700" 
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
        
        <Text
          position={[0, 0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.4}
          color="#1a1a1a"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          HOME
        </Text>
      </group>
    );
  };

  // Base du plateau (table)
  const renderBase = () => {
    return (
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[20, 0.3, 20]} />
        <meshStandardMaterial 
          color="#8b4513" 
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>
    );
  };

  return (
    <group>
      {renderBase()}
      {renderMainPath()}
      {renderHomeBases()}
      {renderFinishPaths()}
      {renderHomeCenter()}
    </group>
  );
};
