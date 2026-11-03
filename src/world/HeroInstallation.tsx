import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SPATIAL_DESTINATIONS } from '../data/portfolioData';
import {
  createCanvasBumpTexture,
  createLivingCanvasTexture,
  createWalnutWoodTexture,
} from '../three/studioEngine';

export const HeroInstallation: React.FC = () => {
  const { pointer } = useThree();
  const homeCenter = SPATIAL_DESTINATIONS[0].roomCenter;

  const easelCanvasGroupRef = useRef<THREE.Group | null>(null);
  const brushGroupRef = useRef<THREE.Group | null>(null);
  const sculptureRef = useRef<THREE.Group | null>(null);

  const canvasAlbedoMap = useMemo(() => createLivingCanvasTexture(), []);
  const canvasBumpMap = useMemo(() => createCanvasBumpTexture(), []);
  const walnutMap = useMemo(() => createWalnutWoodTexture(), []);

  // Multi-layered 3D Impasto Oil Paint Ribbons across the Linen Canvas
  const { primaryImpastoGeo, goldHarmonicGeo, tealUnderstrokeGeo } = useMemo(() => {
    const mainCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.62, -0.04, 0.085),
      new THREE.Vector3(-0.62, 0.42, 0.13),
      new THREE.Vector3(0.42, -0.18, 0.14),
      new THREE.Vector3(1.58, 0.31, 0.105),
    ]);
    const goldCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.48, -0.26, 0.08),
      new THREE.Vector3(-0.35, 0.14, 0.115),
      new THREE.Vector3(0.55, -0.34, 0.12),
      new THREE.Vector3(1.52, 0.08, 0.095),
    ]);
    const tealCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.55, 0.12, 0.075),
      new THREE.Vector3(-0.48, 0.52, 0.105),
      new THREE.Vector3(0.62, -0.02, 0.11),
      new THREE.Vector3(1.45, 0.42, 0.085),
    ]);

    return {
      primaryImpastoGeo: new THREE.TubeGeometry(mainCurve, 64, 0.075, 16, false),
      goldHarmonicGeo: new THREE.TubeGeometry(goldCurve, 56, 0.032, 12, false),
      tealUnderstrokeGeo: new THREE.TubeGeometry(tealCurve, 52, 0.042, 12, false),
    };
  }, []);

  // Ergonomic Lathe-Turned Walnut Brush Handle + Sculpted Bristle Heel
  const { handleLatheGeo, bristleCoreGeo } = useMemo(() => {
    const handlePts = [
      new THREE.Vector2(0.012, -1.45),
      new THREE.Vector2(0.038, -1.05),
      new THREE.Vector2(0.068, -0.45),
      new THREE.Vector2(0.082, 0.05),
      new THREE.Vector2(0.064, 0.38),
      new THREE.Vector2(0.074, 0.56),
    ];
    const bristlePts = [
      new THREE.Vector2(0.074, 0.0),
      new THREE.Vector2(0.082, 0.12),
      new THREE.Vector2(0.066, 0.28),
      new THREE.Vector2(0.034, 0.44),
      new THREE.Vector2(0.008, 0.54),
    ];
    return {
      handleLatheGeo: new THREE.LatheGeometry(handlePts, 28),
      bristleCoreGeo: new THREE.LatheGeometry(bristlePts, 24),
    };
  }, []);

  useFrame(({ clock }, delta) => {
    const elapsed = clock.getElapsedTime();

    if (easelCanvasGroupRef.current) {
      easelCanvasGroupRef.current.rotation.y = THREE.MathUtils.damp(
        easelCanvasGroupRef.current.rotation.y,
        -0.05 + pointer.x * 0.08,
        5,
        delta,
      );
    }

    if (brushGroupRef.current) {
      const sweepPhase = (Math.sin(elapsed * 0.65) + 1) * 0.5;
      const targetX = THREE.MathUtils.lerp(-0.85, 0.95, sweepPhase) + pointer.x * 0.38;
      const targetY = 0.68 + Math.sin(sweepPhase * Math.PI * 2) * 0.18 + pointer.y * 0.28;

      brushGroupRef.current.position.x = THREE.MathUtils.damp(
        brushGroupRef.current.position.x,
        targetX,
        5,
        delta,
      );
      brushGroupRef.current.position.y = THREE.MathUtils.damp(
        brushGroupRef.current.position.y,
        targetY,
        5,
        delta,
      );
      brushGroupRef.current.rotation.z =
        0.78 + pointer.x * 0.16 + Math.sin(elapsed * 1.1) * 0.05;
    }

    if (sculptureRef.current) {
      sculptureRef.current.rotation.y = elapsed * 0.18;
      sculptureRef.current.rotation.x = Math.sin(elapsed * 0.35) * 0.1;
    }
  });

  return (
    <group position={homeCenter} name="home-artist-studio">
      {/* 1. Sculpted Dark Walnut & Brushed Brass Studio Easel + Framed Linen Canvas */}
      <group ref={easelCanvasGroupRef} position={[0.05, 0, -0.45]}>
        {/* Stepped Travertine & Dark Basalt Studio Dais Plinth */}
        <mesh position={[0, -2.14, 0.1]}>
          <cylinderGeometry args={[2.65, 2.85, 0.14, 48]} />
          <meshStandardMaterial color="#1B191D" roughness={0.48} metalness={0.18} />
        </mesh>
        <mesh position={[0, -2.06, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.52, 2.62, 48]} />
          <meshStandardMaterial
            color="#B9A078"
            roughness={0.26}
            metalness={0.88}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Studio Easel Base Skids & Crossbeam (Dark American Walnut) */}
        <mesh position={[-1.25, -2.0, 0.15]}>
          <boxGeometry args={[0.14, 0.12, 2.1]} />
          <meshStandardMaterial
            color="#FFFFFF"
            map={walnutMap}
            roughness={0.42}
            metalness={0.12}
          />
        </mesh>
        <mesh position={[1.25, -2.0, 0.15]}>
          <boxGeometry args={[0.14, 0.12, 2.1]} />
          <meshStandardMaterial
            color="#FFFFFF"
            map={walnutMap}
            roughness={0.42}
            metalness={0.12}
          />
        </mesh>
        <mesh position={[0, -1.98, 0.15]}>
          <boxGeometry args={[2.64, 0.1, 0.16]} />
          <meshStandardMaterial
            color="#FFFFFF"
            map={walnutMap}
            roughness={0.42}
            metalness={0.12}
          />
        </mesh>

        {/* Twin Walnut Vertical Easel Masts & Central Brushed Brass Ratchet Track */}
        <mesh position={[-1.25, 0.15, -0.18]} rotation={[-0.04, 0, 0]}>
          <boxGeometry args={[0.13, 4.3, 0.14]} />
          <meshStandardMaterial
            color="#FFFFFF"
            map={walnutMap}
            roughness={0.4}
            metalness={0.12}
          />
        </mesh>
        <mesh position={[1.25, 0.15, -0.18]} rotation={[-0.04, 0, 0]}>
          <boxGeometry args={[0.13, 4.3, 0.14]} />
          <meshStandardMaterial
            color="#FFFFFF"
            map={walnutMap}
            roughness={0.4}
            metalness={0.12}
          />
        </mesh>
        <mesh position={[0, 0.25, -0.18]} rotation={[-0.04, 0, 0]}>
          <boxGeometry args={[0.18, 4.5, 0.12]} />
          <meshStandardMaterial
            color="#FFFFFF"
            map={walnutMap}
            roughness={0.38}
            metalness={0.14}
          />
        </mesh>
        {/* Brushed Brass Ratchet Strip Along Central Mast */}
        <mesh position={[0, 0.25, -0.11]} rotation={[-0.04, 0, 0]}>
          <boxGeometry args={[0.06, 4.2, 0.02]} />
          <meshStandardMaterial color="#B9A078" roughness={0.24} metalness={0.88} />
        </mesh>

        {/* Rear Angled Support Strut */}
        <mesh position={[0, -0.35, -0.75]} rotation={[0.26, 0, 0]}>
          <boxGeometry args={[0.14, 3.4, 0.14]} />
          <meshStandardMaterial
            color="#FFFFFF"
            map={walnutMap}
            roughness={0.42}
            metalness={0.12}
          />
        </mesh>

        {/* Sculpted Walnut & Brass Easel Shelf Tray Supporting the Canvas */}
        <group position={[0, -0.88, 0.12]}>
          <mesh>
            <boxGeometry args={[4.85, 0.11, 0.38]} />
            <meshStandardMaterial
              color="#FFFFFF"
              map={walnutMap}
              roughness={0.36}
              metalness={0.15}
            />
          </mesh>
          {/* Brushed Champagne Brass Front Shelf Lip */}
          <mesh position={[0, 0.02, 0.18]}>
            <boxGeometry args={[4.88, 0.07, 0.03]} />
            <meshStandardMaterial color="#B9A078" roughness={0.22} metalness={0.9} />
          </mesh>

          {/* Studio Pigment Jars & Ceramic Vessels Resting on the Left/Right Easel Tray */}
          <group position={[-1.95, 0.16, 0.08]}>
            <mesh>
              <cylinderGeometry args={[0.09, 0.08, 0.22, 20]} />
              <meshStandardMaterial
                color="#F1EEE7"
                roughness={0.2}
                metalness={0.1}
              />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.04, 20]} />
              <meshStandardMaterial color="#B9A078" roughness={0.22} metalness={0.9} />
            </mesh>
          </group>
          <group position={[-1.72, 0.13, 0.09]}>
            <mesh>
              <cylinderGeometry args={[0.075, 0.07, 0.16, 20]} />
              <meshStandardMaterial
                color="#6B84C4"
                roughness={0.18}
                metalness={0.15}
              />
            </mesh>
          </group>
        </group>

        {/* Top Brushed Brass Canvas Clamp */}
        <mesh position={[0, 2.14, 0.02]}>
          <boxGeometry args={[0.42, 0.12, 0.28]} />
          <meshStandardMaterial color="#C9A56A" roughness={0.24} metalness={0.9} />
        </mesh>

        {/* Masterpiece Stretched Linen Canvas & Museum Frame */}
        <group position={[0, 0.62, 0.02]} rotation={[-0.03, 0, 0]}>
          {/* Stretched Woven Linen Surface with Bump Relief */}
          <mesh>
            <boxGeometry args={[4.5, 2.82, 0.12]} />
            <meshStandardMaterial
              color="#1A1817"
              bumpMap={canvasBumpMap}
              bumpScale={0.028}
              roughness={0.68}
              metalness={0.04}
            />
          </mesh>
          {/* Illuminated Front Painted Linen Canvas Artwork Face */}
          <mesh position={[0, 0, 0.068]}>
            <planeGeometry args={[4.46, 2.78]} />
            <meshBasicMaterial map={canvasAlbedoMap} />
          </mesh>

          {/* Outer Dark Walnut & Bronze Shadow-Box Gallery Frame */}
          <mesh position={[0, 1.46, 0.02]}>
            <boxGeometry args={[4.78, 0.14, 0.24]} />
            <meshStandardMaterial
              color="#FFFFFF"
              map={walnutMap}
              roughness={0.34}
              metalness={0.22}
            />
          </mesh>
          <mesh position={[0, -1.46, 0.02]}>
            <boxGeometry args={[4.78, 0.14, 0.24]} />
            <meshStandardMaterial
              color="#FFFFFF"
              map={walnutMap}
              roughness={0.34}
              metalness={0.22}
            />
          </mesh>
          <mesh position={[-2.32, 0, 0.02]}>
            <boxGeometry args={[0.14, 3.06, 0.24]} />
            <meshStandardMaterial
              color="#FFFFFF"
              map={walnutMap}
              roughness={0.34}
              metalness={0.22}
            />
          </mesh>
          <mesh position={[2.32, 0, 0.02]}>
            <boxGeometry args={[0.14, 3.06, 0.24]} />
            <meshStandardMaterial
              color="#FFFFFF"
              map={walnutMap}
              roughness={0.34}
              metalness={0.22}
            />
          </mesh>

          {/* Inner Brushed Champagne Brass Fillet */}
          <mesh position={[0, 0, -0.01]}>
            <boxGeometry args={[4.58, 2.9, 0.15]} />
            <meshStandardMaterial color="#C9A56A" roughness={0.22} metalness={0.9} />
          </mesh>

          {/* Volumetric 3D Impasto Oil Strokes */}
          <mesh geometry={tealUnderstrokeGeo}>
            <meshStandardMaterial
              color="#6B84C4"
              roughness={0.2}
              metalness={0.18}
            />
          </mesh>
          <mesh geometry={primaryImpastoGeo}>
            <meshStandardMaterial
              color="#C7745C"
              emissive="#C7745C"
              emissiveIntensity={0.14}
              roughness={0.14}
              metalness={0.15}
            />
          </mesh>
          <mesh geometry={goldHarmonicGeo}>
            <meshStandardMaterial
              color="#C9A56A"
              roughness={0.18}
              metalness={0.92}
            />
          </mesh>
        </group>
      </group>

      {/* 2. Physically Crafted Multi-Part Artist's Paintbrush with Sculpted Bristles */}
      <group
        ref={brushGroupRef}
        position={[0.55, 0.68, 0.62]}
        rotation={[0.32, -0.42, 0.82]}
      >
        {/* Lathe-Turned Dark Walnut Handle */}
        <mesh geometry={handleLatheGeo}>
          <meshStandardMaterial
            color="#FFFFFF"
            map={walnutMap}
            roughness={0.32}
            metalness={0.12}
          />
        </mesh>

        {/* Brass End-Cap Finial */}
        <mesh position={[0, -1.46, 0]}>
          <sphereGeometry args={[0.018, 16, 16]} />
          <meshStandardMaterial color="#C9A56A" roughness={0.2} metalness={0.92} />
        </mesh>

        {/* Seamless Double-Crimped Brushed Brass Ferrule */}
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.075, 0.074, 0.34, 28]} />
          <meshStandardMaterial color="#C9A56A" roughness={0.18} metalness={0.94} />
        </mesh>
        {/* Ferrule Crimp Rings */}
        {[0.58, 0.64, 0.85].map((ry, rIdx) => (
          <mesh key={rIdx} position={[0, ry, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.076, 0.007, 12, 28]} />
            <meshStandardMaterial color="#DFC28E" roughness={0.16} metalness={0.95} />
          </mesh>
        ))}

        {/* Sculpted Natural Hog-Bristle Heel */}
        <mesh position={[0, 0.88, 0]} geometry={bristleCoreGeo}>
          <meshStandardMaterial
            color="#3D2E22"
            bumpMap={canvasBumpMap}
            bumpScale={0.015}
            roughness={0.82}
            metalness={0.04}
          />
        </mesh>

        {/* Individual Sculpted Bristle Tufts Forming the Chisel Tip */}
        {[-0.028, -0.014, 0, 0.014, 0.028].map((bx, bIdx) => (
          <mesh
            key={bIdx}
            position={[bx, 1.18, (bIdx % 2 === 0 ? 1 : -1) * 0.008]}
            rotation={[0, 0, -bx * 1.4]}
          >
            <coneGeometry args={[0.026, 0.36, 12]} />
            <meshStandardMaterial color="#4A382B" roughness={0.78} metalness={0.05} />
          </mesh>
        ))}

        {/* Glossy Wet Vermilion & Gold Oil Paint Loaded on the Bristle Tip */}
        <mesh position={[0, 1.32, 0]}>
          <coneGeometry args={[0.042, 0.22, 20]} />
          <meshStandardMaterial
            color="#C7745C"
            emissive="#C7745C"
            emissiveIntensity={0.22}
            roughness={0.12}
            metalness={0.12}
          />
        </mesh>
      </group>

      {/* 3. Background Curated Gallery Sculpture on a Travertine Pedestal (Right Wing) */}
      <group position={[3.52, -0.82, -1.75]}>
        {/* Pedestal Column */}
        <mesh position={[0, -1.05, 0]}>
          <cylinderGeometry args={[0.48, 0.54, 1.65, 32]} />
          <meshStandardMaterial color="#1A191D" roughness={0.55} metalness={0.15} />
        </mesh>
        <mesh position={[0, -0.21, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.04, 32]} />
          <meshStandardMaterial color="#C9A56A" roughness={0.24} metalness={0.88} />
        </mesh>

        {/* Kinetic Equilibrium Sculpture */}
        <group ref={sculptureRef} position={[0, 0.72, 0]} scale={0.68}>
          <mesh rotation={[0.35, 0.5, 0]}>
            <torusGeometry args={[1.05, 0.042, 20, 64]} />
            <meshStandardMaterial color="#C9A56A" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh rotation={[-0.55, 0.25, 0.75]}>
            <torusGeometry args={[0.76, 0.032, 18, 56]} />
            <meshStandardMaterial color="#8A724C" roughness={0.28} metalness={0.85} />
          </mesh>
          <mesh>
            <octahedronGeometry args={[0.36, 0]} />
            <meshStandardMaterial
              color="#F1EBDD"
              roughness={0.18}
              metalness={0.2}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};
