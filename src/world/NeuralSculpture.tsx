import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SKILL_CATEGORIES, SPATIAL_DESTINATIONS } from '../data/portfolioData';

interface NeuralSculptureProps {
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const NeuralSculpture: React.FC<NeuralSculptureProps> = ({
  activeCategoryId,
  onSelectCategory,
}) => {
  const skillsCenter = SPATIAL_DESTINATIONS[2].roomCenter;
  const coreCrystalRef = useRef<THREE.Mesh | null>(null);
  const categoryRefs = useRef<Record<string, THREE.Group | null>>({});
  const gemRefs = useRef<Record<string, THREE.Mesh | null>>({});

  // Precompute 6 slender, restrained pathways connecting the central nucleus rear collar
  // to the rear mounting socket of each category node so pathways never cross through gemstones.
  const neuralPathways = useMemo(() => {
    return SKILL_CATEGORIES.map((cat) => {
      const targetPos = new THREE.Vector3(...cat.nodePosition);
      const radialDir = new THREE.Vector3(targetPos.x, targetPos.y, 0).normalize();

      // Start at the outer rear perimeter of the central nucleus housing
      const startPoint = new THREE.Vector3(
        radialDir.x * 0.48,
        radialDir.y * 0.48,
        -0.12,
      );

      // Dock cleanly into the rear mounting socket behind the category node housing
      const endPoint = new THREE.Vector3(
        targetPos.x,
        targetPos.y,
        targetPos.z - 0.13,
      );

      // Gentle architectural arch recessed in -Z behind the primary node plane
      const controlPoint = new THREE.Vector3(
        targetPos.x * 0.54,
        targetPos.y * 0.62,
        -0.24,
      );

      const curve = new THREE.CatmullRomCurve3([
        startPoint,
        controlPoint,
        endPoint,
      ]);

      return {
        id: cat.id,
        geo: new THREE.TubeGeometry(curve, 36, 0.013, 10, false),
        color: cat.color,
      };
    });
  }, []);

  useFrame(({ clock }, delta) => {
    const elapsed = clock.getElapsedTime();

    // Subtle, calm rotation on the central core crystal only; category nodes remain spatially stable
    if (coreCrystalRef.current) {
      coreCrystalRef.current.rotation.y = elapsed * 0.16;
      coreCrystalRef.current.rotation.x = Math.sin(elapsed * 0.22) * 0.08;
    }

    for (let i = 0; i < SKILL_CATEGORIES.length; i++) {
      const cat = SKILL_CATEGORIES[i];
      const grp = categoryRefs.current[cat.id];
      if (grp) {
        const isSelected = activeCategoryId === cat.id;
        const targetScale = isSelected ? 1.12 : 1.0;
        const nextScale = THREE.MathUtils.damp(
          grp.scale.x,
          targetScale,
          7,
          delta,
        );
        grp.scale.setScalar(nextScale);
      }

      const gem = gemRefs.current[cat.id];
      if (gem) {
        const isSelected = activeCategoryId === cat.id;
        gem.rotation.y =
          i * 0.55 + elapsed * (isSelected ? 0.22 : 0.06);
      }
    }
  });

  return (
    <group position={skillsCenter} name="skills-neural-sculpture">
      {/* 1. Architectural Museum Pedestal Anchoring the Neural Sculpture */}
      <group position={[0, -2.25, 0]}>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[1.85, 2.05, 0.55, 48]} />
          <meshStandardMaterial
            color="#151618"
            roughness={0.54}
            metalness={0.18}
          />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[1.45, 1.65, 0.12, 48]} />
          <meshStandardMaterial
            color="#1C1D20"
            roughness={0.48}
            metalness={0.22}
          />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.38, 1.43, 48]} />
          <meshStandardMaterial
            color="#B9A078"
            roughness={0.26}
            metalness={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Central Brass Suspension Column (Docks Cleanly into Bottom Rear of Nucleus) */}
        <mesh position={[0, 1.02, -0.07]}>
          <cylinderGeometry args={[0.038, 0.056, 2.04, 20]} />
          <meshStandardMaterial
            color="#B9A078"
            roughness={0.28}
            metalness={0.84}
          />
        </mesh>
      </group>

      {/* 2. Curated Neural Installation Assembly */}
      <group position={[0, 0.25, 0]}>
        {/* Refined Central Nucleus — Dark Architectural Collar, Champagne Core & Single Coplanar Rim */}
        <group name="neural-central-nucleus">
          {/* Dark matte backing disc separating nucleus from gallery backdrop */}
          <mesh position={[0, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.45, 0.49, 0.08, 32]} />
            <meshStandardMaterial
              color="#141518"
              roughness={0.78}
              metalness={0.16}
            />
          </mesh>

          {/* Recessed dark obsidian inner well */}
          <mesh position={[0, 0, -0.015]}>
            <circleGeometry args={[0.37, 32]} />
            <meshStandardMaterial
              color="#0B0C0E"
              roughness={0.9}
              metalness={0.08}
            />
          </mesh>

          {/* Single Precision Champagne Accent Rim on Nucleus Housing */}
          <mesh position={[0, 0, -0.01]}>
            <ringGeometry args={[0.365, 0.4, 48]} />
            <meshStandardMaterial
              color="#B9A078"
              roughness={0.26}
              metalness={0.86}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Faceted Brushed Champagne Nucleus Core */}
          <mesh ref={coreCrystalRef} position={[0, 0, 0.05]}>
            <icosahedronGeometry args={[0.23, 0]} />
            <meshStandardMaterial
              color="#B9A078"
              roughness={0.22}
              metalness={0.88}
              flatShading
            />
          </mesh>

          {/* Subtle Translucent Glass Envelope */}
          <mesh position={[0, 0, 0.05]}>
            <dodecahedronGeometry args={[0.32, 0]} />
            <meshStandardMaterial
              color="#F1EEE7"
              transparent
              opacity={0.18}
              roughness={0.14}
              metalness={0.1}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* Six Slender Rear-Docked Pathways Connecting Nucleus to Category Nodes */}
        {neuralPathways.map((item) => {
          const isSelected = activeCategoryId === item.id;
          return (
            <mesh key={`neural-path-${item.id}`} geometry={item.geo}>
              <meshStandardMaterial
                color={isSelected ? item.color : '#8E8D88'}
                emissive={isSelected ? item.color : '#000000'}
                emissiveIntensity={isSelected ? 0.32 : 0}
                transparent
                opacity={isSelected ? 0.86 : 0.25}
                roughness={0.25}
                metalness={0.18}
              />
            </mesh>
          );
        })}

        {/* Six Clickable Curated Category Nodes */}
        {SKILL_CATEGORIES.map((cat, cIdx) => {
          const isSelected = activeCategoryId === cat.id;
          const housingSides = cIdx % 2 === 0 ? 8 : 6;
          const housingRotationZ =
            housingSides === 8 ? Math.PI / 8 : Math.PI / 6;

          return (
            <group
              key={cat.id}
              position={cat.nodePosition}
              rotation={[0.04, -cat.nodePosition[0] * 0.06, 0]}
              ref={(el) => {
                categoryRefs.current[cat.id] = el;
              }}
            >
              <group
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCategory(cat.id);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'auto';
                }}
              >
                {/* Rear Matte Mounting Socket (Receives Neural Pathway) */}
                <mesh
                  position={[0, 0, -0.11]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry args={[0.12, 0.16, 0.08, 16]} />
                  <meshStandardMaterial
                    color="#18191C"
                    roughness={0.76}
                    metalness={0.2}
                  />
                </mesh>

                {/* Stepped Dark Matte Architectural Outer Housing (Creates Strong Silhouette) */}
                <mesh
                  position={[0, 0, -0.05]}
                  rotation={[Math.PI / 2, housingRotationZ, 0]}
                >
                  <cylinderGeometry
                    args={[0.45, 0.48, 0.07, housingSides]}
                  />
                  <meshStandardMaterial
                    color={isSelected ? '#212329' : '#141518'}
                    roughness={0.76}
                    metalness={0.18}
                  />
                </mesh>

                {/* Inner Chamfered Matte Bezel Step */}
                <mesh
                  position={[0, 0, -0.01]}
                  rotation={[Math.PI / 2, housingRotationZ, 0]}
                >
                  <cylinderGeometry
                    args={[0.38, 0.42, 0.05, housingSides]}
                  />
                  <meshStandardMaterial
                    color={isSelected ? '#2A2D34' : '#191A1E'}
                    roughness={0.68}
                    metalness={0.22}
                  />
                </mesh>

                {/* Deep Obsidian Recessed Well Behind Gemstone for High Contrast */}
                <mesh position={[0, 0, 0.018]}>
                  <circleGeometry args={[0.32, 32]} />
                  <meshStandardMaterial
                    color="#090A0C"
                    roughness={0.92}
                    metalness={0.05}
                  />
                </mesh>

                {/* Single Refined Accent Rim (Brighter & Higher Contrast When Active) */}
                <mesh position={[0, 0, 0.022]}>
                  <ringGeometry
                    args={[0.312, isSelected ? 0.364 : 0.352, 48]}
                  />
                  <meshStandardMaterial
                    color={cat.color}
                    emissive={cat.color}
                    emissiveIntensity={isSelected ? 0.52 : 0.07}
                    roughness={isSelected ? 0.16 : 0.36}
                    metalness={0.72}
                    side={THREE.DoubleSide}
                  />
                </mesh>

                {/* Single Faceted Gemstone Visual Centre */}
                <mesh
                  position={[0, 0, 0.088]}
                  rotation={[0.35 + cIdx * 0.25, cIdx * 0.55, 0]}
                  ref={(el) => {
                    gemRefs.current[cat.id] = el;
                  }}
                >
                  {cIdx % 3 === 0 ? (
                    <octahedronGeometry args={[0.2, 0]} />
                  ) : cIdx % 3 === 1 ? (
                    <icosahedronGeometry args={[0.2, 0]} />
                  ) : (
                    <dodecahedronGeometry args={[0.2, 0]} />
                  )}
                  <meshStandardMaterial
                    color={cat.color}
                    emissive={cat.color}
                    emissiveIntensity={isSelected ? 0.48 : 0.11}
                    roughness={isSelected ? 0.14 : 0.26}
                    metalness={0.24}
                    flatShading
                  />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
};

