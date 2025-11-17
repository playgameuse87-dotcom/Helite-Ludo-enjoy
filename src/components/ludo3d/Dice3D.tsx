import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";

interface Dice3DProps {
  value: number;
  isRolling: boolean;
  position?: [number, number, number];
}

export const Dice3D = ({ value, isRolling, position = [0, 1, 0] }: Dice3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [targetRotation] = useState(new THREE.Euler());

  // Configuration des rotations pour chaque face du dé
  const faceRotations: { [key: number]: [number, number, number] } = {
    1: [0, 0, 0],
    2: [0, Math.PI / 2, 0],
    3: [0, 0, Math.PI / 2],
    4: [0, 0, -Math.PI / 2],
    5: [0, -Math.PI / 2, 0],
    6: [Math.PI, 0, 0],
  };

  useEffect(() => {
    if (!isRolling && meshRef.current) {
      const [x, y, z] = faceRotations[value] || [0, 0, 0];
      targetRotation.set(x, y, z);
    }
  }, [value, isRolling, targetRotation]);

  // Animation de rotation
  useFrame((state) => {
    if (meshRef.current) {
      if (isRolling) {
        // Rotation rapide et aléatoire pendant le lancer
        meshRef.current.rotation.x += 0.2;
        meshRef.current.rotation.y += 0.15;
        meshRef.current.rotation.z += 0.1;
        
        // Effet de rebond
        meshRef.current.position.y = position[1] + Math.abs(Math.sin(state.clock.elapsedTime * 8)) * 0.5;
      } else {
        // Interpolation vers la rotation cible
        meshRef.current.rotation.x += (targetRotation.x - meshRef.current.rotation.x) * 0.1;
        meshRef.current.rotation.y += (targetRotation.y - meshRef.current.rotation.y) * 0.1;
        meshRef.current.rotation.z += (targetRotation.z - meshRef.current.rotation.z) * 0.1;
        
        // Retour à la position normale
        meshRef.current.position.y += (position[1] - meshRef.current.position.y) * 0.1;
      }
    }
  });

  // Créer les points pour chaque face
  const createDots = (faceValue: number, facePosition: [number, number, number], rotation: [number, number, number]) => {
    const dots: JSX.Element[] = [];
    const dotPositions: { [key: number]: [number, number][] } = {
      1: [[0, 0]],
      2: [[-0.15, 0.15], [0.15, -0.15]],
      3: [[-0.15, 0.15], [0, 0], [0.15, -0.15]],
      4: [[-0.15, 0.15], [0.15, 0.15], [-0.15, -0.15], [0.15, -0.15]],
      5: [[-0.15, 0.15], [0.15, 0.15], [0, 0], [-0.15, -0.15], [0.15, -0.15]],
      6: [[-0.15, 0.15], [0.15, 0.15], [-0.15, 0], [0.15, 0], [-0.15, -0.15], [0.15, -0.15]],
    };

    const positions = dotPositions[faceValue] || [];
    positions.forEach((pos, idx) => {
      dots.push(
        <mesh
          key={`${faceValue}-${idx}`}
          position={[facePosition[0] + pos[0], facePosition[1] + pos[1], facePosition[2]]}
          rotation={rotation}
        >
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      );
    });

    return dots;
  };

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial 
          color="#ffffff" 
          metalness={0.1} 
          roughness={0.3}
        />
      </mesh>

      {/* Points sur les faces (visibles seulement quand le dé ne roule pas) */}
      {!isRolling && meshRef.current && (
        <group 
          position={[meshRef.current.position.x, meshRef.current.position.y, meshRef.current.position.z]}
          rotation={[meshRef.current.rotation.x, meshRef.current.rotation.y, meshRef.current.rotation.z]}
        >
          {/* Face 1 (avant) */}
          {value === 1 && createDots(1, [0, 0, 0.31], [0, 0, 0])}
          
          {/* Face 2 (droite) */}
          {value === 2 && createDots(2, [0.31, 0, 0], [0, Math.PI / 2, 0])}
          
          {/* Face 3 (dessus) */}
          {value === 3 && createDots(3, [0, 0.31, 0], [Math.PI / 2, 0, 0])}
          
          {/* Face 4 (dessous) */}
          {value === 4 && createDots(4, [0, -0.31, 0], [-Math.PI / 2, 0, 0])}
          
          {/* Face 5 (gauche) */}
          {value === 5 && createDots(5, [-0.31, 0, 0], [0, -Math.PI / 2, 0])}
          
          {/* Face 6 (arrière) */}
          {value === 6 && createDots(6, [0, 0, -0.31], [0, Math.PI, 0])}
        </group>
      )}

      {/* Ombre sous le dé */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.4, 32]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  );
};
