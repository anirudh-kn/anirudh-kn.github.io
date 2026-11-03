import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PROFILE_DATA, SPATIAL_DESTINATIONS } from '../data/portfolioData';
import {
  createGalleryFrameTexture,
  createPlasterWallTexture,
  createSmokedGraphitePortraitTexture,
  createWalnutWoodTexture,
  loadCleanTransparentPortraitTexture,
} from '../three/studioEngine';

export const AboutEnvironment3D: React.FC = () => {
  const aboutCenter = SPATIAL_DESTINATIONS[1].roomCenter;
  const centerFrameRef = useRef<THREE.Group | null>(null);
  const pipelineArtifactsRef = useRef<THREE.Group | null>(null);

  const [portraitTexture, setPortraitTexture] = useState<THREE.Texture | null>(null);
  const [portraitAspect, setPortraitAspect] = useState<number>(1096 / 1280);

  useEffect(() => {
    let active = true;
    loadCleanTransparentPortraitTexture(
      PROFILE_DATA.portraitImageUrl,
      (tex, aspect) => {
        if (!active) {
          tex.dispose();
          return;
        }
        setPortraitTexture(tex);
        if (aspect > 0.4 && aspect < 2.0) {
          setPortraitAspect(aspect);
        }
      },
      () => {
        if (active) setPortraitTexture(null);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const walnutMap = useMemo(() => createWalnutWoodTexture(), []);
  const plasterMap = useMemo(() => createPlasterWallTexture(), []);
  const portraitBackingTex = useMemo(
    () => createSmokedGraphitePortraitTexture(),
    [],
  );

  const leftCanvasTex = useMemo(
    () =>
      createGalleryFrameTexture(
        'ARCHIVE 01 · EDUCATION',
        'BCA Graduate',
        'CGPA 8.5 / 10 · Bengaluru North Univ.',
        '#659B93',
      ),
    [],
  );

  const rightCanvasTex = useMemo(
    () =>
      createGalleryFrameTexture(
        'ARCHIVE 02 · PRACTICE',
        '3 Data Internships',
        'Future Interns · Zetheta · Quest',
        '#B9A078',
      ),
    [],
  );

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (centerFrameRef.current) {
      centerFrameRef.current.rotation.y = Math.sin(elapsed * 0.25) * 0.03;
    }
    if (pipelineArtifactsRef.current) {
      pipelineArtifactsRef.current.children.forEach((child, idx) => {
        child.rotation.y = elapsed * 0.3 + idx * 0.6;
      });
    }
  });

  // Preserve exact aspect ratio of Anirudh K N's transparent cutout portrait (1096 x 1280 -> ~0.85625)
  const portraitHeight = 2.48;
  const portraitWidth = Number((portraitHeight * portraitAspect).toFixed(3));

  return (
    <group
      position={[aboutCenter[0] + 0.55, aboutCenter[1], aboutCenter[2]]}
      name="about-creators-space"
    >
      {/* 1. Architectural Museum Feature Wall Behind the Portrait */}
      <group position={[0, 0.55, -1.25]}>
        {/* Venetian Plaster Central Monolith Wall */}
        <mesh>
          <boxGeometry args={[3.9, 5.4, 0.28]} />
          <meshStandardMaterial
            color="#FFFFFF"
            map={plasterMap}
            roughness={0.78}
            metalness={0.08}
          />
        </mesh>
        {/* Recessed Brushed Brass Architectural Reveal Channels */}
        <mesh position={[-1.98, 0, 0]}>
          <boxGeometry args={[0.06, 5.42, 0.3]} />
          <meshStandardMaterial color="#B9A078" roughness={0.25} metalness={0.88} />
        </mesh>
        <mesh position={[1.98, 0, 0]}>
          <boxGeometry args={[0.06, 5.42, 0.3]} />
          <meshStandardMaterial color="#B9A078" roughness={0.25} metalness={0.88} />
        </mesh>
        {/* Stone Plinth Baseboard */}
        <mesh position={[0, -2.55, 0.06]}>
          <boxGeometry args={[4.1, 0.32, 0.4]} />
          <meshStandardMaterial color="#111014" roughness={0.48} metalness={0.2} />
        </mesh>
      </group>

      {/* 2. Centerpiece Portrait Exhibition Frame (Anirudh K N Transparent Professional Cutout) */}
      <group ref={centerFrameRef} position={[0, 0.68, -0.92]}>
        {/* Brass Museum Picture Light Mounted Above the Portrait */}
        <group position={[0, 1.88, 0.25]}>
          <mesh position={[0, 0, -0.15]}>
            <boxGeometry args={[0.16, 0.08, 0.32]} />
            <meshStandardMaterial color="#B9A078" roughness={0.24} metalness={0.9} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 1.25, 20]} />
            <meshStandardMaterial color="#B9A078" roughness={0.22} metalness={0.92} />
          </mesh>
          <mesh position={[0, -0.042, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.18, 0.05]} />
            <meshBasicMaterial color="#FFF6E5" />
          </mesh>
        </group>

        {/* Outer Dark American Walnut Shadow-Box Frame */}
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[2.68, 3.38, 0.16]} />
          <meshStandardMaterial
            color="#FFFFFF"
            map={walnutMap}
            roughness={0.36}
            metalness={0.18}
          />
        </mesh>

        {/* Champagne Brass Inner Fillet */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[2.46, 3.16, 0.15]} />
          <meshStandardMaterial color="#B9A078" roughness={0.22} metalness={0.9} />
        </mesh>

        {/* Museum Conservation Smoked-Graphite Mat Board */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[2.38, 3.08, 0.1]} />
          <meshStandardMaterial color="#201F21" roughness={0.68} metalness={0.12} />
        </mesh>

        {/* Smoked-Bronze Inner Recessed Bevel Framing the Cutout Portrait */}
        <mesh position={[0, 0.04, 0.0715]}>
          <planeGeometry args={[portraitWidth + 0.08, portraitHeight + 0.08]} />
          <meshStandardMaterial color="#34302E" roughness={0.46} metalness={0.32} />
        </mesh>

        {/* Textured Smoked-Graphite & Warm Radial Glow Backing Surface Behind Transparent Portrait */}
        <mesh position={[0, 0.04, 0.0745]}>
          <planeGeometry args={[portraitWidth + 0.02, portraitHeight + 0.02]} />
          <meshStandardMaterial
            color="#FFFFFF"
            map={portraitBackingTex}
            roughness={0.62}
            metalness={0.08}
          />
        </mesh>

        {/* Authentic Transparent Portrait Cutout (Preserves Alpha Transparency & Natural Aspect Ratio) */}
        <mesh position={[0, 0.04, 0.08]}>
          <planeGeometry args={[portraitWidth, portraitHeight]} />
          {portraitTexture ? (
            <meshBasicMaterial
              map={portraitTexture}
              transparent
              alphaTest={0.05}
              depthWrite={false}
            />
          ) : (
            <meshStandardMaterial
              color="#FFFFFF"
              map={portraitBackingTex}
              roughness={0.62}
              metalness={0.08}
            />
          )}
        </mesh>

        {/* Engraved Brass Museum Nameplate Below Portrait */}
        <mesh position={[0, -1.38, 0.08]}>
          <boxGeometry args={[0.92, 0.11, 0.02]} />
          <meshStandardMaterial color="#B9A078" roughness={0.24} metalness={0.88} />
        </mesh>
      </group>

      {/* 3. Left Curated Exhibition Stele — Academic Foundation (BCA Degree) */}
      <group position={[-2.78, 0.35, -0.35]} rotation={[0, 0.28, 0]}>
        <mesh position={[0, -0.15, -0.14]}>
          <boxGeometry args={[2.35, 4.4, 0.18]} />
          <meshStandardMaterial color="#161519" roughness={0.78} metalness={0.08} />
        </mesh>
        <mesh position={[0, 1.48, 0.12]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.032, 0.032, 0.85, 16]} />
          <meshStandardMaterial color="#B9A078" roughness={0.24} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.12, -0.02]}>
          <boxGeometry args={[2.02, 2.62, 0.12]} />
          <meshStandardMaterial
            color="#FFFFFF"
            map={walnutMap}
            roughness={0.38}
            metalness={0.18}
          />
        </mesh>
        <mesh position={[0, 0.12, 0.01]}>
          <boxGeometry args={[1.9, 2.5, 0.1]} />
          <meshStandardMaterial color="#B9A078" roughness={0.24} metalness={0.88} />
        </mesh>
        <mesh position={[0, 0.12, 0.065]}>
          <planeGeometry args={[1.82, 2.42]} />
          <meshBasicMaterial map={leftCanvasTex} />
        </mesh>
      </group>

      {/* 4. Right Curated Exhibition Stele — 3 Data Internships */}
      <group position={[2.82, 0.35, -0.35]} rotation={[0, -0.28, 0]}>
        <mesh position={[0, -0.15, -0.14]}>
          <boxGeometry args={[2.35, 4.4, 0.18]} />
          <meshStandardMaterial color="#161519" roughness={0.78} metalness={0.08} />
        </mesh>
        <mesh position={[0, 1.48, 0.12]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.032, 0.032, 0.85, 16]} />
          <meshStandardMaterial color="#B9A078" roughness={0.24} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.12, -0.02]}>
          <boxGeometry args={[2.02, 2.62, 0.12]} />
          <meshStandardMaterial
            color="#FFFFFF"
            map={walnutMap}
            roughness={0.38}
            metalness={0.18}
          />
        </mesh>
        <mesh position={[0, 0.12, 0.01]}>
          <boxGeometry args={[1.9, 2.5, 0.1]} />
          <meshStandardMaterial color="#B9A078" roughness={0.24} metalness={0.88} />
        </mesh>
        <mesh position={[0, 0.12, 0.065]}>
          <planeGeometry args={[1.82, 2.42]} />
          <meshBasicMaterial map={rightCanvasTex} />
        </mesh>
      </group>

      {/* 5. Foreground Museum Bench Plinth & 5-Stage Data-to-Art Sculptural Artifacts */}
      <group position={[0, -1.68, 1.05]}>
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[3.6, 0.42, 0.72]} />
          <meshStandardMaterial color="#151418" roughness={0.48} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.0, 0]}>
          <boxGeometry args={[3.42, 0.03, 0.58]} />
          <meshStandardMaterial color="#C9A56A" roughness={0.26} metalness={0.88} />
        </mesh>

        <group ref={pipelineArtifactsRef} position={[0, 0.22, 0]}>
          {[
            { x: -1.28, color: '#F1EEE7', type: 'octa' },
            { x: -0.64, color: '#6B84C4', type: 'torus' },
            { x: 0, color: '#C9A56A', type: 'icosa' },
            { x: 0.64, color: '#54B7AB', type: 'cylinder' },
            { x: 1.28, color: '#C7745C', type: 'dodeca' },
          ].map((item, idx) => (
            <mesh key={idx} position={[item.x, 0, 0]}>
              {item.type === 'octa' && <octahedronGeometry args={[0.14, 0]} />}
              {item.type === 'torus' && <torusGeometry args={[0.12, 0.035, 14, 28]} />}
              {item.type === 'icosa' && <icosahedronGeometry args={[0.15, 0]} />}
              {item.type === 'cylinder' && <cylinderGeometry args={[0.11, 0.11, 0.24, 20]} />}
              {item.type === 'dodeca' && <dodecahedronGeometry args={[0.15, 0]} />}
              <meshStandardMaterial
                color={item.color}
                roughness={0.2}
                metalness={0.4}
              />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};
