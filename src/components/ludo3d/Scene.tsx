import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { ReactNode, Suspense } from "react";
import * as THREE from "three";

interface SceneProps {
  children: ReactNode;
}

export const Scene = ({ children }: SceneProps) => {
  return (
    <Canvas
      shadows
      gl={{ 
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ background: 'linear-gradient(to bottom, #1e3a8a, #3b82f6)' }}
    >
      <Suspense fallback={null}>
        {/* Caméra */}
        <PerspectiveCamera makeDefault position={[0, 15, 12]} fov={50} />
        
        {/* Contrôles de la caméra */}
        <OrbitControls
          enablePan={false}
          minDistance={10}
          maxDistance={25}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          target={[0, 0, 0]}
        />

        {/* Lumières */}
        {/* Lumière ambiante douce */}
        <ambientLight intensity={0.4} />
        
        {/* Lumière directionnelle principale (soleil) */}
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
          shadow-bias={-0.0001}
        />

        {/* Lumières ponctuelles colorées au-dessus de chaque base */}
        <pointLight position={[-3, 5, 3]} color="#ef4444" intensity={0.5} distance={8} />
        <pointLight position={[-3, 5, -3]} color="#3b82f6" intensity={0.5} distance={8} />
        <pointLight position={[3, 5, -3]} color="#facc15" intensity={0.5} distance={8} />
        <pointLight position={[3, 5, 3]} color="#22c55e" intensity={0.5} distance={8} />

        {/* Lumière de remplissage */}
        <hemisphereLight args={["#ffffff", "#444444", 0.5]} />

        {/* Brouillard pour la profondeur */}
        <fog attach="fog" args={["#3b82f6", 20, 50]} />

        {/* Contenu de la scène */}
        {children}
      </Suspense>
    </Canvas>
  );
};
