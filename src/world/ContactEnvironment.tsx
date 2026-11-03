import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SPATIAL_DESTINATIONS } from '../data/portfolioData';
import {
  createCanvasBumpTexture,
  createSignatureCanvasTexture,
  createWalnutWoodTexture,
} from '../three/studioEngine';

interface ContactEnvironmentProps {
  hudExpanded?: boolean;
}

export const ContactEnvironment: React.FC<ContactEnvironmentProps> = ({
  hudExpanded = true,
}) => {
  const contactCenter = SPATIAL_DESTINATIONS[5].roomCenter;
  const stageGroupRef = useRef<THREE.Group | null>(null);
  const { size } = useThree();
  const isMobile = size.width < 768;

  const signatureCanvasTex = useMemo(() => createSignatureCanvasTexture(), []);
  const canvasBumpMap = useMemo(() => createCanvasBumpTexture(), []);
  const walnutMap = useMemo(() => createWalnutWoodTexture(), []);

  // Restrained, Poised Champagne-Gold & Warm-Ivory Horizon Signature Flourish
  // Positioned cleanly in the lower signature register below the central typography
  const { champagneRibbonGeo, ivoryInlayGeo } = useMemo(() => {
    const pts = [
      new THREE.Vector3(-1.92, -0.32, 0.076),
      new THREE.Vector3(-1.05, -0.18, 0.088),
      new THREE.Vector3(-0.18, -0.28, 0.082),
      new THREE.Vector3(0.68, -0.14, 0.092),
      new THREE.Vector3(1.42, -0.24, 0.084),
      new THREE.Vector3(1.94, -0.16, 0.088),
    ];
    const inlayPts = pts.map(
      (p) => new THREE.Vector3(p.x + 0.02, p.y - 0.032, p.z - 0.006),
    );
    const mainCurve = new THREE.CatmullRomCurve3(pts);
    const inlayCurve = new THREE.CatmullRomCurve3(inlayPts);
    return {
      champagneRibbonGeo: new THREE.TubeGeometry(mainCurve, 84, 0.022, 14, false),
      ivoryInlayGeo: new THREE.TubeGeometry(inlayCurve, 72, 0.011, 10, false),
    };
  }, []);

  // Lathe-Turned Walnut Brush Handle & Sculpted Bristle Heel (Static Collector's Detail)
  const { handleLatheGeo, bristleHeelGeo } = useMemo(() => {
    const handlePts = [
      new THREE.Vector2(0.01, 0.2),
      new THREE.Vector2(0.038, 0.55),
      new THREE.Vector2(0.052, 0.98),
      new THREE.Vector2(0.04, 1.32),
      new THREE.Vector2(0.012, 1.58),
    ];
    const bristlePts = [
      new THREE.Vector2(0.006, -0.36),
      new THREE.Vector2(0.026, -0.25),
      new THREE.Vector2(0.044, -0.12),
      new THREE.Vector2(0.046, 0.0),
    ];
    return {
      handleLatheGeo: new THREE.LatheGeometry(handlePts, 24),
      bristleHeelGeo: new THREE.LatheGeometry(bristlePts, 20),
    };
  }, []);

  useFrame((_, delta) => {
    if (!stageGroupRef.current) return;
    const dt = Math.min(delta, 0.05);
    const targetOffsetX = !isMobile && hudExpanded ? 0.38 : 0;
    stageGroupRef.current.position.x = THREE.MathUtils.damp(
      stageGroupRef.current.position.x,
      targetOffsetX,
      6.5,
      dt,
    );
  });

  return (
    <group position={contactCenter} name="contact-final-signature">
      <group ref={stageGroupRef}>
        {/* 1. Curated Warm Ivory Linen Signature Canvas in Deep American Walnut & Champagne Brass Frame */}
        <group position={[0.18, 0.44, -0.22]} rotation={[-0.12, -0.04, 0]}>
          {/* Recessed Dark Architectural Backing Box */}
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[5.72, 2.98, 0.14]} />
            <meshStandardMaterial
              color="#111215"
              roughness={0.54}
              metalness={0.28}
            />
          </mesh>

          {/* Inner Brushed Champagne Brass Fillet */}
          <mesh position={[0, 0, 0.0]}>
            <boxGeometry args={[5.58, 2.84, 0.14]} />
            <meshStandardMaterial
              color="#B9A078"
              emissive="#B9A078"
              emissiveIntensity={0.08}
              roughness={0.22}
              metalness={0.9}
            />
          </mesh>

          {/* Stretched Warm Ivory Belgian Linen Canvas Backing with Woven Bump Relief */}
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[5.42, 2.68, 0.12]} />
            <meshStandardMaterial
              color="#EAE1CF"
              bumpMap={canvasBumpMap}
              bumpScale={0.02}
              roughness={0.64}
              metalness={0.04}
            />
          </mesh>

          {/* Front Illuminated Warm Ivory Linen Typographic Signature Artwork */}
          <mesh position={[0, 0, 0.084]}>
            <planeGeometry args={[5.36, 2.62]} />
            <meshStandardMaterial
              color="#FFFFFF"
              map={signatureCanvasTex}
              emissive="#FFF8EC"
              emissiveMap={signatureCanvasTex}
              emissiveIntensity={0.38}
              bumpMap={canvasBumpMap}
              bumpScale={0.018}
              roughness={0.54}
              metalness={0.04}
            />
          </mesh>

          {/* Outer Mitred Dark American Walnut Gallery Frame */}
          <mesh position={[0, 1.48, 0.02]}>
            <boxGeometry args={[5.92, 0.14, 0.22]} />
            <meshStandardMaterial
              color="#FFFFFF"
              map={walnutMap}
              roughness={0.34}
              metalness={0.18}
            />
          </mesh>
          <mesh position={[0, -1.48, 0.02]}>
            <boxGeometry args={[5.92, 0.14, 0.22]} />
            <meshStandardMaterial
              color="#FFFFFF"
              map={walnutMap}
              roughness={0.34}
              metalness={0.18}
            />
          </mesh>
          <mesh position={[-2.89, 0, 0.02]}>
            <boxGeometry args={[0.14, 3.1, 0.22]} />
            <meshStandardMaterial
              color="#FFFFFF"
              map={walnutMap}
              roughness={0.34}
              metalness={0.18}
            />
          </mesh>
          <mesh position={[2.89, 0, 0.02]}>
            <boxGeometry args={[0.14, 3.1, 0.22]} />
            <meshStandardMaterial
              color="#FFFFFF"
              map={walnutMap}
              roughness={0.34}
              metalness={0.18}
            />
          </mesh>

          {/* Overhead Museum Picture Light Bar */}
          <group position={[0, 1.66, 0.22]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.026, 0.026, 2.4, 20]} />
              <meshStandardMaterial
                color="#B9A078"
                roughness={0.22}
                metalness={0.9}
              />
            </mesh>
            <mesh position={[0, -0.022, 0]}>
              <boxGeometry args={[2.32, 0.014, 0.03]} />
              <meshStandardMaterial
                color="#F6F1E6"
                emissive="#F6F1E6"
                emissiveIntensity={0.65}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[-0.85, -0.06, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.24, 12]} />
              <meshStandardMaterial
                color="#B9A078"
                roughness={0.26}
                metalness={0.88}
              />
            </mesh>
            <mesh position={[0.85, -0.06, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.24, 12]} />
              <meshStandardMaterial
                color="#B9A078"
                roughness={0.26}
                metalness={0.88}
              />
            </mesh>
          </group>

          {/* 2. Restrained Burnished Champagne-Gold & Warm Ivory Horizon Relief */}
          <mesh geometry={champagneRibbonGeo}>
            <meshStandardMaterial
              color="#C9A56A"
              emissive="#B9A078"
              emissiveIntensity={0.16}
              roughness={0.2}
              metalness={0.92}
            />
          </mesh>
          <mesh geometry={ivoryInlayGeo}>
            <meshStandardMaterial
              color="#F1EEE7"
              emissive="#F1EEE7"
              emissiveIntensity={0.12}
              roughness={0.32}
              metalness={0.24}
            />
          </mesh>

          {/* 3. Lower Easel Collectors Ledge & Static Resting Artist's Brush */}
          <mesh position={[0, -1.56, 0.14]}>
            <boxGeometry args={[4.6, 0.045, 0.16]} />
            <meshStandardMaterial
              color="#B9A078"
              roughness={0.26}
              metalness={0.88}
            />
          </mesh>

          <group
            position={[1.38, -1.5, 0.17]}
            rotation={[0.06, 0.08, Math.PI / 2 - 0.04]}
          >
            {/* Lathe-Turned Walnut Handle */}
            <mesh geometry={handleLatheGeo}>
              <meshStandardMaterial
                color="#FFFFFF"
                map={walnutMap}
                roughness={0.32}
                metalness={0.12}
              />
            </mesh>
            {/* Double-Crimped Brushed Brass Ferrule */}
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.044, 0.046, 0.22, 24]} />
              <meshStandardMaterial
                color="#C9A56A"
                roughness={0.18}
                metalness={0.94}
              />
            </mesh>
            {/* Sculpted Natural Bristle Heel */}
            <mesh geometry={bristleHeelGeo}>
              <meshStandardMaterial
                color="#3D2E22"
                bumpMap={canvasBumpMap}
                bumpScale={0.012}
                roughness={0.78}
                metalness={0.05}
              />
            </mesh>
            {/* Burnished Champagne Gold Tip */}
            <mesh position={[0, -0.31, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.028, 0.18, 18]} />
              <meshStandardMaterial
                color="#C9A56A"
                emissive="#B9A078"
                emissiveIntensity={0.18}
                roughness={0.18}
                metalness={0.85}
              />
            </mesh>
          </group>
        </group>

        {/* 4. Architectural Honed Basalt & Champagne Brass Presentation Plinth */}
        <group position={[0.18, -1.72, -0.24]}>
          {/* Structural Easel Uprights Connecting Plinth to Frame */}
          <mesh position={[-1.65, 0.62, -0.06]}>
            <cylinderGeometry args={[0.038, 0.044, 1.32, 20]} />
            <meshStandardMaterial
              color="#1A1B1F"
              roughness={0.36}
              metalness={0.68}
            />
          </mesh>
          <mesh position={[1.65, 0.62, -0.06]}>
            <cylinderGeometry args={[0.038, 0.044, 1.32, 20]} />
            <meshStandardMaterial
              color="#1A1B1F"
              roughness={0.36}
              metalness={0.68}
            />
          </mesh>

          {/* Lower Honed Basalt Plinth Base */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[3.15, 3.38, 0.44, 56]} />
            <meshStandardMaterial
              color="#121316"
              roughness={0.44}
              metalness={0.22}
            />
          </mesh>
          {/* Upper Stepped Plinth Deck */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[2.82, 2.96, 0.09, 56]} />
            <meshStandardMaterial
              color="#181A1E"
              roughness={0.38}
              metalness={0.28}
            />
          </mesh>
          {/* Champagne Brass Perimeter Inlay Ring */}
          <mesh position={[0, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.82, 0.02, 14, 72]} />
            <meshStandardMaterial
              color="#B9A078"
              roughness={0.22}
              metalness={0.9}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};
