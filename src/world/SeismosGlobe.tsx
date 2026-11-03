import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createTectonicGlobeTexture } from '../three/studioEngine';
import { ProjectScreenshot } from '../data/portfolioData';
import { computeAspectPreservedDimensions } from '../utils/atelierLogic';

interface SeismosGlobeProps {
  isFocused: boolean;
  screenshots: ProjectScreenshot[];
  activeScreenshotIndex: number;
  onFocusGlobe: () => void;
  onOpenFullscreenScreenshot?: (screenshotIndex: number) => void;
}

export const SeismosGlobe: React.FC<SeismosGlobeProps> = ({
  isFocused,
  screenshots,
  activeScreenshotIndex,
  onFocusGlobe,
  onOpenFullscreenScreenshot,
}) => {
  const { invalidate } = useThree();
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const armillaryOuterRef = useRef<THREE.Mesh | null>(null);
  const armillaryInnerRef = useRef<THREE.Mesh | null>(null);
  const displayGroupRef = useRef<THREE.Group | null>(null);

  const globeTexture = useMemo(() => createTectonicGlobeTexture(), []);

  const currentShot =
    screenshots[activeScreenshotIndex] || screenshots[0] || null;

  const [shotTexture, setShotTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!currentShot) return undefined;
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(
      currentShot.url,
      (tex) => {
        if (cancelled) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
        setShotTexture(tex);
        invalidate();
      },
      undefined,
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, [currentShot, invalidate]);

  const frameDims = useMemo(() => {
    const ratio = currentShot ? currentShot.aspectRatio : 1917 / 900;
    return computeAspectPreservedDimensions(ratio, 2.95, 1.55);
  }, [currentShot]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const elapsed = clock.getElapsedTime();
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y = elapsed * (isFocused ? 0.12 : 0.18);
    }
    if (armillaryOuterRef.current) {
      armillaryOuterRef.current.rotation.z = Math.sin(elapsed * 0.25) * 0.08;
    }
    if (armillaryInnerRef.current) {
      armillaryInnerRef.current.rotation.y = -elapsed * 0.1;
    }
    if (displayGroupRef.current) {
      const targetScale = isFocused ? 1.05 : 0.96;
      const nextScale = THREE.MathUtils.damp(
        displayGroupRef.current.scale.x,
        targetScale,
        7,
        dt,
      );
      displayGroupRef.current.scale.setScalar(nextScale);
    }
  });

  return (
    <group position={[0, 0, 0]} name="seismos-globe-installation">
      {/* Dedicated Warm Gallery Spotlight + Vermilion Accent Fill */}
      <pointLight
        position={[0, 3.4, 2.2]}
        intensity={isFocused ? 2.5 : 1.35}
        distance={10}
        color="#F1EEE7"
      />
      <pointLight
        position={[0, 1.1, -1.5]}
        intensity={isFocused ? 1.65 : 0.8}
        distance={8}
        color="#C7745C"
      />

      {/* 1. Museum Architectural Stone & Brass Armillary Pedestal */}
      <group position={[0, -1.35, 0]}>
        <mesh position={[0, -0.32, 0]}>
          <cylinderGeometry args={[1.25, 1.42, 0.22, 48]} />
          <meshStandardMaterial color="#111014" roughness={0.45} metalness={0.2} />
        </mesh>
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.98, 1.14, 0.42, 48]} />
          <meshStandardMaterial color="#18171C" roughness={0.55} metalness={0.18} />
        </mesh>
        <mesh position={[0, 0.21, 0]}>
          <cylinderGeometry args={[1.04, 1.04, 0.05, 48]} />
          <meshStandardMaterial color="#B9A078" roughness={0.22} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.48, 0]}>
          <cylinderGeometry args={[0.12, 0.2, 0.52, 24]} />
          <meshStandardMaterial color="#B9A078" roughness={0.24} metalness={0.9} />
        </mesh>
        {isFocused && (
          <mesh position={[0, -0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.48, 1.56, 64]} />
            <meshBasicMaterial color="#B9A078" side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>

      {/* 2. Brushed Brass Armillary Meridian Cradle & Tectonic Earth Sphere */}
      <group position={[0, 0.35, 0]}>
        <mesh ref={armillaryOuterRef} rotation={[0.22, 0.35, 0]}>
          <torusGeometry args={[1.38, 0.024, 20, 96]} />
          <meshStandardMaterial color="#B9A078" roughness={0.22} metalness={0.9} />
        </mesh>
        <mesh ref={armillaryInnerRef} rotation={[Math.PI / 2.15, 0.12, 0]}>
          <torusGeometry args={[1.28, 0.015, 16, 96]} />
          <meshStandardMaterial
            color="#B9A078"
            roughness={0.26}
            metalness={0.86}
            transparent
            opacity={0.78}
          />
        </mesh>

        {/* Subtle Vermilion Tectonic Fault Latitude Ring */}
        <mesh rotation={[Math.PI / 2.6, -0.28, 0.18]}>
          <torusGeometry args={[1.21, 0.01, 12, 96]} />
          <meshStandardMaterial
            color="#C7745C"
            emissive="#C7745C"
            emissiveIntensity={0.25}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>

        {/* 3. Rotating Cartographic & Tectonic Earth Sphere */}
        <group ref={globeGroupRef}>
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onFocusGlobe();
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
            <sphereGeometry args={[1.12, 64, 64]} />
            <meshStandardMaterial
              color="#FFFFFF"
              map={globeTexture}
              roughness={0.42}
              metalness={0.22}
            />
          </mesh>

          {/* Subtle Refractive Museum Glass Atmosphere Shell */}
          <mesh>
            <sphereGeometry args={[1.16, 48, 48]} />
            <meshPhysicalMaterial
              color="#B9A078"
              transparent
              opacity={0.07}
              roughness={0.12}
              metalness={0.1}
              clearcoat={1}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      </group>

      {/* 4. Architectural 3D Museum Exhibition Frame Displaying Authentic Seismos Screenshot */}
      <group
        ref={displayGroupRef}
        position={[0, 2.48, -0.55]}
        onClick={(e) => {
          e.stopPropagation();
          if (isFocused && onOpenFullscreenScreenshot) {
            onOpenFullscreenScreenshot(activeScreenshotIndex);
          } else {
            onFocusGlobe();
          }
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
        {/* Brushed Brass Outer Museum Frame */}
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry
            args={[frameDims.width + 0.18, frameDims.height + 0.18, 0.05]}
          />
          <meshStandardMaterial
            color={isFocused ? '#DFC086' : '#B9A078'}
            roughness={0.24}
            metalness={0.9}
          />
        </mesh>

        {/* Dark Obsidian Mat Backing */}
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry
            args={[frameDims.width + 0.08, frameDims.height + 0.08, 0.03]}
          />
          <meshStandardMaterial color="#0C0B0F" roughness={0.65} metalness={0.15} />
        </mesh>

        {/* Non-Stretched Authentic Project Screenshot Plane */}
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[frameDims.width, frameDims.height]} />
          {shotTexture ? (
            <meshBasicMaterial map={shotTexture} toneMapped={false} />
          ) : (
            <meshStandardMaterial color="#18161D" roughness={0.5} />
          )}
        </mesh>
      </group>
    </group>
  );
};
