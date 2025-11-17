import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { animated, useSpring } from "@react-spring/three";
import * as THREE from "three";

interface Token3DProps {
  color: string;
  position: [number, number, number];
  isSelected: boolean;
  isPlayable: boolean;
  onClick: () => void;
  isMoving?: boolean;
}

export const Token3D = ({ 
  color, 
  position, 
  isSelected, 
  isPlayable, 
  onClick,
  isMoving = false 
}: Token3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Animation de position
  const { pos } = useSpring({
    pos: position,
    config: { mass: 1, tension: 280, friction: 60 },
  });

  // Animation de rebond lors du mouvement
  useFrame((state) => {
    if (meshRef.current && isMoving) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 10) * 0.1 + 0.2;
    } else if (meshRef.current && !isMoving) {
      meshRef.current.position.y = position[1];
    }
  });

  // Animation de rotation pour le token sélectionné
  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  const scale = isSelected ? 1.2 : hovered ? 1.1 : 1;
  const emissiveIntensity = isSelected ? 0.5 : isPlayable ? 0.3 : 0;

  return (
    <animated.group position={pos as any}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          if (isPlayable) onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (isPlayable) {
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        scale={scale}
        castShadow
      >
        {/* Corps du pion (cylindre) */}
        <cylinderGeometry args={[0.3, 0.35, 0.4, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Tête du pion (sphère) */}
      <mesh position={[0, 0.3, 0]} castShadow scale={scale}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Effet de glow si sélectionné */}
      {isSelected && (
        <mesh position={[0, 0.2, 0]} scale={1.5}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Indicateur si jouable */}
      {isPlayable && !isSelected && (
        <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.45, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      )}
    </animated.group>
  );
};
