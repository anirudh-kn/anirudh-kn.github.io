import React, { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  DestinationId,
  SPATIAL_DESTINATIONS,
  SpatialDestination,
} from '../data/portfolioData';
import { createWalnutWoodTexture } from '../three/studioEngine';

interface PaletteNavigation3DProps {
  activeDestination: DestinationId;
  onSelectDestination: (destinationId: DestinationId) => void;
  onHoverPigment: (pigment: SpatialDestination | null) => void;
  hudExpanded?: boolean;
}

export const PaletteNavigation3D: React.FC<PaletteNavigation3DProps> = ({
  activeDestination,
  onSelectDestination,
  onHoverPigment,
  hudExpanded = false,
}) => {
  const { camera, size } = useThree();
  const paletteGroupRef = useRef<THREE.Group | null>(null);
  const brushRef = useRef<THREE.Group | null>(null);
  const [hoveredId, setHoveredId] = useState<DestinationId | null>(null);

  const walnutMap = useMemo(() => createWalnutWoodTexture(), []);

  // Construct an organic kidney-shaped traditional artist's palette with an authentic thumbhole
  const paletteGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.85, -0.15);
    shape.bezierCurveTo(-2.05, 0.72, -1.05, 1.38, 0.15, 1.32);
    shape.bezierCurveTo(1.38, 1.25, 2.05, 0.58, 1.88, -0.35);
    shape.bezierCurveTo(1.72, -1.12, 0.85, -1.28, 0.18, -0.92);
    shape.bezierCurveTo(-0.35, -0.62, -0.78, -0.98, -1.32, -0.82);
    shape.bezierCurveTo(-1.68, -0.72, -1.75, -0.45, -1.85, -0.15);

    const thumbHole = new THREE.Path();
    thumbHole.absellipse(-0.98, -0.35, 0.28, 0.2, 0, Math.PI * 2, false, 0);
    shape.holes.push(thumbHole);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 1,
      depth: 0.085,
      bevelEnabled: true,
      bevelThickness: 0.032,
      bevelSize: 0.035,
      bevelSegments: 5,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    return geo;
  }, []);

  // Pre-extract reusable temp vectors so useFrame does zero per-frame allocations
  const { forwardVec, rightVec, upVec, targetWorldPos } = useMemo(
    () => ({
      forwardVec: new THREE.Vector3(),
      rightVec: new THREE.Vector3(),
      upVec: new THREE.Vector3(),
      targetWorldPos: new THREE.Vector3(),
    }),
    [],
  );

  // Keep the 3D palette docked harmoniously in the camera's lower-right/center studio foreground,
  // adapting scale, horizontal offset, and vertical height for portrait smartphones (360px+)
  useFrame(({ clock }) => {
    const group = paletteGroupRef.current;
    if (!group) return;

    const elapsed = clock.getElapsedTime();
    const aspect = size.width / Math.max(1, size.height);
    const isMobilePortrait = size.width < 768 || aspect < 0.85;

    let forwardDist: number;
    let rightOffset: number;
    let upOffset: number;
    let scaleVal: number;

    if (isMobilePortrait) {
      // On narrow mobile portrait viewports, center the 3D palette horizontally and position it
      // in the lower-middle foreground above the collapsible bottom sheet so all 6 pigments remain
      // 100% inside the 360px+ viewport without clipping.
      forwardDist = 5.4;
      rightOffset = 0;
      upOffset = hudExpanded ? -0.48 : -1.08;
      scaleVal = Math.max(0.28, Math.min(0.42, aspect * 0.64));
    } else if (size.width < 1100) {
      forwardDist = 4.9;
      rightOffset = 1.05;
      upOffset = -1.25;
      scaleVal = 0.48;
    } else {
      forwardDist = 4.7;
      rightOffset = 1.68;
      upOffset = -1.22;
      scaleVal = 0.56;
    }

    forwardVec.set(0, 0, -1).applyQuaternion(camera.quaternion);
    rightVec.set(1, 0, 0).applyQuaternion(camera.quaternion);
    upVec.set(0, 1, 0).applyQuaternion(camera.quaternion);

    targetWorldPos
      .copy(camera.position)
      .addScaledVector(forwardVec, forwardDist)
      .addScaledVector(rightVec, rightOffset)
      .addScaledVector(upVec, upOffset + Math.sin(elapsed * 1.4) * 0.015);

    group.position.copy(targetWorldPos);
    group.quaternion.copy(camera.quaternion);

    // Tilt the palette toward the viewer so the oil pigment mounds and wood grain catch gallery key lights
    group.rotateX(isMobilePortrait ? -0.64 : -0.68);
    group.rotateY(isMobilePortrait ? 0 : -0.18);
    group.rotateZ(
      (isMobilePortrait ? 0.02 : 0.06) + Math.cos(elapsed * 1.1) * 0.012,
    );
    group.scale.setScalar(scaleVal);

    if (brushRef.current) {
      brushRef.current.rotation.z = -0.44 + Math.sin(elapsed * 1.8) * 0.025;
    }
  });

  return (
    <group ref={paletteGroupRef} name="atelier-3d-palette-navigator">
      {/* Hand-Rubbed Dark American Walnut Artist's Palette Board */}
      <mesh geometry={paletteGeometry}>
        <meshStandardMaterial
          color="#FFFFFF"
          map={walnutMap}
          roughness={0.34}
          metalness={0.14}
        />
      </mesh>

      {/* Beveled Champagne Brass Rim Accent Around Thumbhole */}
      <mesh position={[-0.98, -0.35, 0.065]} scale={[1.38, 1, 1]}>
        <torusGeometry args={[0.21, 0.016, 14, 36]} />
        <meshStandardMaterial
          color="#B9A078"
          roughness={0.22}
          metalness={0.9}
        />
      </mesh>

      {/* Center Brass Atelier Medallion Inlay */}
      <mesh position={[-0.1, -0.18, 0.062]}>
        <cylinderGeometry args={[0.26, 0.28, 0.018, 32]} />
        <meshStandardMaterial
          color="#B9A078"
          roughness={0.25}
          metalness={0.88}
        />
      </mesh>

      {/* 6 Sculpted Oil Pigment Impasto Mounds — Each Navigates the Camera to Its Spatial Room */}
      {SPATIAL_DESTINATIONS.map((dest) => {
        const isActive = activeDestination === dest.id;
        const isHovered = hoveredId === dest.id;
        const moundScale = isActive ? 1.24 : isHovered ? 1.15 : 1.0;

        return (
          <group
            key={dest.id}
            position={dest.paletteLocalPos}
            scale={moundScale}
            onClick={(e) => {
              e.stopPropagation();
              onSelectDestination(dest.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredId(dest.id);
              onHoverPigment(dest);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredId(null);
              onHoverPigment(null);
              document.body.style.cursor = 'auto';
            }}
          >
            {/* Invisible Generous Touch Target Sphere for Reliable Mobile Finger Tapping */}
            <mesh visible={false}>
              <sphereGeometry args={[0.36, 12, 12]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Brushed Brass Pigment Well Ring */}
            <mesh position={[0, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.25, 0.27, 0.03, 28]} />
              <meshStandardMaterial
                color={isActive || isHovered ? '#E6C88E' : '#8A724C'}
                roughness={0.24}
                metalness={0.88}
              />
            </mesh>

            {/* Primary Oil Paint Impasto Mound */}
            <mesh position={[0, 0, 0.02]} scale={[1.12, 0.96, 0.65]}>
              <dodecahedronGeometry args={[0.21, 2]} />
              <meshPhysicalMaterial
                color={dest.hex}
                emissive={dest.hex}
                emissiveIntensity={isActive ? 0.28 : isHovered ? 0.16 : 0.04}
                roughness={0.18}
                metalness={0.08}
                clearcoat={1}
                clearcoatRoughness={0.12}
              />
            </mesh>

            {/* Secondary Paint Swirl Crest (Simulating Palette Knife Peak) */}
            <mesh
              position={[0.04, 0.03, 0.11]}
              rotation={[0.3, 0.5, 0.2]}
              scale={[0.68, 0.48, 0.42]}
            >
              <icosahedronGeometry args={[0.16, 1]} />
              <meshPhysicalMaterial
                color={dest.hex}
                roughness={0.14}
                metalness={0.1}
                clearcoat={1}
              />
            </mesh>

            {/* Active / Hovered Brass Halo Ring */}
            {(isActive || isHovered) && (
              <mesh position={[0, 0, -0.02]}>
                <ringGeometry args={[0.28, 0.32, 36]} />
                <meshBasicMaterial
                  color="#C9A56A"
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Sculpted Artist's Brush Resting Across the Palette */}
      <group
        ref={brushRef}
        position={[0.28, -0.32, 0.16]}
        rotation={[0.08, 0.14, -0.44]}
      >
        {/* Lacquered Ebony & Walnut Wooden Handle */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.026, 0.048, 2.25, 20]} />
          <meshStandardMaterial
            color="#181210"
            roughness={0.28}
            metalness={0.22}
          />
        </mesh>
        {/* Gold Ferrule */}
        <mesh position={[-1.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.048, 0.032, 0.28, 20]} />
          <meshStandardMaterial
            color="#C9A56A"
            roughness={0.18}
            metalness={0.92}
          />
        </mesh>
        {/* Sable Bristle Tip Dipped in Active Room's Pigment */}
        <mesh position={[-1.46, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.052, 0.26, 20]} />
          <meshPhysicalMaterial
            color={
              SPATIAL_DESTINATIONS.find((d) => d.id === activeDestination)?.hex ||
              '#476BFF'
            }
            roughness={0.22}
            clearcoat={0.9}
          />
        </mesh>
      </group>
    </group>
  );
};
