import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  CONTACT_GALLERY_ARTWORKS,
  DestinationId,
  EXPERIENCE_GALLERY_ARTWORKS,
  HOME_GALLERY_ARTWORKS,
  SKILLS_GALLERY_ARTWORKS,
  SPATIAL_DESTINATIONS,
} from '../data/portfolioData';
import {
  createArchitecturalStoneTexture,
  createPersonalPhilosophyCardTexture,
  createPlasterWallTexture,
  isSoftwareGl,
} from '../three/studioEngine';
import { computeAspectPreservedDimensions } from '../utils/atelierLogic';

interface EnvironmentManagerProps {
  activeDestination: DestinationId;
  onSelectDestination: (id: DestinationId) => void;
  particleCount?: number;
  enableEnvironmentMap?: boolean;
  animationScale?: number;
}

export const EnvironmentManager: React.FC<EnvironmentManagerProps> = ({
  activeDestination,
  onSelectDestination,
  particleCount,
  enableEnvironmentMap = !isSoftwareGl,
  animationScale = 1,
}) => {
  const { gl, scene, size, invalidate } = useThree();
  const dustRef = useRef<THREE.InstancedMesh | null>(null);
  const isMobileViewport = size.width < 768;

  const [leftHomeArtworkTex, setLeftHomeArtworkTex] =
    useState<THREE.Texture | null>(null);
  const [rightHomeArtworkTex, setRightHomeArtworkTex] =
    useState<THREE.Texture | null>(null);
  const [leftHomeAspect, setLeftHomeAspect] = useState<number>(
    HOME_GALLERY_ARTWORKS.left.aspectRatio,
  );
  const [rightHomeAspect, setRightHomeAspect] = useState<number>(
    HOME_GALLERY_ARTWORKS.right.aspectRatio,
  );

  const [leftSkillsArtworkTex, setLeftSkillsArtworkTex] =
    useState<THREE.Texture | null>(null);
  const [rightSkillsArtworkTex, setRightSkillsArtworkTex] =
    useState<THREE.Texture | null>(null);
  const [leftSkillsAspect, setLeftSkillsAspect] = useState<number>(
    SKILLS_GALLERY_ARTWORKS.left.aspectRatio,
  );
  const [rightSkillsAspect, setRightSkillsAspect] = useState<number>(
    SKILLS_GALLERY_ARTWORKS.right.aspectRatio,
  );

  const [leftExperienceArtworkTex, setLeftExperienceArtworkTex] =
    useState<THREE.Texture | null>(null);
  const [rightExperienceArtworkTex, setRightExperienceArtworkTex] =
    useState<THREE.Texture | null>(null);
  const [leftExperienceAspect, setLeftExperienceAspect] = useState<number>(
    EXPERIENCE_GALLERY_ARTWORKS.left.aspectRatio,
  );
  const [rightExperienceAspect, setRightExperienceAspect] = useState<number>(
    EXPERIENCE_GALLERY_ARTWORKS.right.aspectRatio,
  );

  const [leftContactArtworkTex, setLeftContactArtworkTex] =
    useState<THREE.Texture | null>(null);
  const [rightContactArtworkTex, setRightContactArtworkTex] =
    useState<THREE.Texture | null>(null);
  const [leftContactAspect, setLeftContactAspect] = useState<number>(
    CONTACT_GALLERY_ARTWORKS.left.aspectRatio,
  );
  const [rightContactAspect, setRightContactAspect] = useState<number>(
    CONTACT_GALLERY_ARTWORKS.right.aspectRatio,
  );

  // Load the authentic Home, Skills, Experience, and Contact gallery artworks once
  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    const loadedTextures: THREE.Texture[] = [];

    const loadArtwork = (
      url: string,
      onAspect: (aspect: number) => void,
      onTexture: (tex: THREE.Texture) => void,
    ) => {
      loader.load(
        url,
        (tex) => {
          if (cancelled) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.needsUpdate = true;
          loadedTextures.push(tex);
          const img = tex.image as
            | { width?: number; height?: number }
            | undefined;
          if (img?.width && img?.height) {
            onAspect(img.width / img.height);
          }
          onTexture(tex);
          invalidate();
        },
        undefined,
        () => {},
      );
    };

    loadArtwork(
      HOME_GALLERY_ARTWORKS.left.url,
      setLeftHomeAspect,
      setLeftHomeArtworkTex,
    );
    loadArtwork(
      HOME_GALLERY_ARTWORKS.right.url,
      setRightHomeAspect,
      setRightHomeArtworkTex,
    );
    loadArtwork(
      SKILLS_GALLERY_ARTWORKS.left.url,
      setLeftSkillsAspect,
      setLeftSkillsArtworkTex,
    );
    loadArtwork(
      SKILLS_GALLERY_ARTWORKS.right.url,
      setRightSkillsAspect,
      setRightSkillsArtworkTex,
    );
    loadArtwork(
      EXPERIENCE_GALLERY_ARTWORKS.left.url,
      setLeftExperienceAspect,
      setLeftExperienceArtworkTex,
    );
    loadArtwork(
      EXPERIENCE_GALLERY_ARTWORKS.right.url,
      setRightExperienceAspect,
      setRightExperienceArtworkTex,
    );
    loadArtwork(
      CONTACT_GALLERY_ARTWORKS.left.url,
      setLeftContactAspect,
      setLeftContactArtworkTex,
    );
    loadArtwork(
      CONTACT_GALLERY_ARTWORKS.right.url,
      setRightContactAspect,
      setRightContactArtworkTex,
    );

    return () => {
      cancelled = true;
      for (const tex of loadedTextures) {
        tex.dispose();
      }
    };
  }, [invalidate]);

  const leftHomeArtworkDims = useMemo(
    () => computeAspectPreservedDimensions(leftHomeAspect, 1.94, 1.5),
    [leftHomeAspect],
  );
  const rightHomeArtworkDims = useMemo(
    () => computeAspectPreservedDimensions(rightHomeAspect, 1.68, 2.26),
    [rightHomeAspect],
  );
  const leftSkillsArtworkDims = useMemo(
    () => computeAspectPreservedDimensions(leftSkillsAspect, 1.9, 1.46),
    [leftSkillsAspect],
  );
  const rightSkillsArtworkDims = useMemo(
    () => computeAspectPreservedDimensions(rightSkillsAspect, 1.9, 1.46),
    [rightSkillsAspect],
  );
  const leftExperienceArtworkDims = useMemo(
    () => computeAspectPreservedDimensions(leftExperienceAspect, 1.68, 2.26),
    [leftExperienceAspect],
  );
  const rightExperienceArtworkDims = useMemo(
    () => computeAspectPreservedDimensions(rightExperienceAspect, 1.68, 2.26),
    [rightExperienceAspect],
  );
  const leftContactArtworkDims = useMemo(
    () => computeAspectPreservedDimensions(leftContactAspect, 1.9, 1.48),
    [leftContactAspect],
  );
  const rightContactArtworkDims = useMemo(
    () => computeAspectPreservedDimensions(rightContactAspect, 1.9, 1.48),
    [rightContactAspect],
  );

  // Set up procedural Studio RoomEnvironment reflection map on hardware GPUs
  useEffect(() => {
    if (isSoftwareGl || !enableEnvironmentMap) return undefined;
    try {
      const pmrem = new THREE.PMREMGenerator(gl);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;
      pmrem.dispose();
      return () => {
        envTex.dispose();
      };
    } catch {
      return undefined;
    }
  }, [enableEnvironmentMap, gl, scene]);

  const { map: stoneMap, bumpMap: stoneBump } = useMemo(
    () => createArchitecturalStoneTexture(),
    [],
  );
  const plasterMap = useMemo(() => createPlasterWallTexture(), []);
  const aboutPhilosophyCardTex = useMemo(
    () => createPersonalPhilosophyCardTexture(),
    [],
  );

  // Architectural Brass Inlay Promenade connecting all 6 museum wings
  const { centerInlayGeo, leftCurbGeo, rightCurbGeo } = useMemo(() => {
    const centerPts = SPATIAL_DESTINATIONS.map(
      (d) => new THREE.Vector3(d.roomCenter[0], d.roomCenter[1] - 2.22, d.roomCenter[2]),
    );
    const leftPts = SPATIAL_DESTINATIONS.map(
      (d) =>
        new THREE.Vector3(d.roomCenter[0] - 2.3, d.roomCenter[1] - 2.21, d.roomCenter[2]),
    );
    const rightPts = SPATIAL_DESTINATIONS.map(
      (d) =>
        new THREE.Vector3(d.roomCenter[0] + 2.3, d.roomCenter[1] - 2.21, d.roomCenter[2]),
    );

    const centerCurve = new THREE.CatmullRomCurve3(centerPts);
    const leftCurve = new THREE.CatmullRomCurve3(leftPts);
    const rightCurve = new THREE.CatmullRomCurve3(rightPts);

    return {
      centerInlayGeo: new THREE.TubeGeometry(centerCurve, 160, 0.035, 8, false),
      leftCurbGeo: new THREE.TubeGeometry(leftCurve, 140, 0.055, 8, false),
      rightCurbGeo: new THREE.TubeGeometry(rightCurve, 140, 0.055, 8, false),
    };
  }, []);

  // Subtle warm atmospheric motes suspended in museum spotlight beams (lighter on mobile for smooth FPS)
  const maxParticleCount = 120;
  const activeParticleCount = Math.min(
    maxParticleCount,
    particleCount ?? (isMobileViewport ? 36 : maxParticleCount),
  );
  const { dummy, particleTransforms, particleColors } = useMemo(() => {
    const d = new THREE.Object3D();
    const transforms: { pos: [number, number, number]; scale: number }[] = [];
    const colors: THREE.Color[] = [];
    const palette = [
      new THREE.Color('#F1EEE7'),
      new THREE.Color('#B9A078'),
      new THREE.Color('#A5A39D'),
      new THREE.Color('#B9A078'),
    ];

    for (let i = 0; i < maxParticleCount; i++) {
      const dest = SPATIAL_DESTINATIONS[i % SPATIAL_DESTINATIONS.length];
      const angle = (i * 1.37) % (Math.PI * 2);
      const radius = 2.4 + (i % 6) * 0.95;
      const px = dest.roomCenter[0] + Math.cos(angle) * radius;
      const py = dest.roomCenter[1] + ((i % 7) - 2.5) * 0.55;
      const pz = dest.roomCenter[2] + Math.sin(angle) * radius;
      transforms.push({ pos: [px, py, pz], scale: 0.35 + (i % 3) * 0.18 });
      colors.push(palette[i % palette.length]);
    }
    return { dummy: d, particleTransforms: transforms, particleColors: colors };
  }, []);

  useFrame(({ clock }) => {
    const mesh = dustRef.current;
    if (!mesh) return;
    const elapsed = clock.getElapsedTime() * animationScale;
    mesh.count = activeParticleCount;
    for (let i = 0; i < activeParticleCount; i++) {
      const item = particleTransforms[i];
      dummy.position.set(
        item.pos[0] + Math.sin(elapsed * 0.22 + i) * 0.08 * animationScale,
        item.pos[1] + Math.cos(elapsed * 0.28 + i * 0.5) * 0.09 * animationScale,
        item.pos[2],
      );
      dummy.scale.setScalar(item.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, particleColors[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <group name="atelier-environment-manager">
      {/* Cinematic Museum Illumination — Warm Key, Neutral Architectural Fill, Controlled Rim */}
      <ambientLight intensity={0.54} color="#F1EEE7" />
      <hemisphereLight args={['#F1EEE7', '#101112', 0.78]} position={[0, 28, 0]} />
      <directionalLight position={[14, 24, 16]} intensity={1.55} color="#F5F0E6" />
      <directionalLight position={[-16, 18, -42]} intensity={0.8} color="#D8DEE9" />

      {/* Active Gallery Room Key & Rim Spotlights (Follows Active Room to Keep Total PointLights <= 3) */}
      {(() => {
        const activeRoom =
          SPATIAL_DESTINATIONS.find((d) => d.id === activeDestination) ||
          SPATIAL_DESTINATIONS[0];
        return (
          <group position={activeRoom.roomCenter}>
            <pointLight
              position={[0.4, 4.4, 3.4]}
              intensity={2.4}
              distance={24}
              decay={1.6}
              color="#F1EEE7"
            />
            <pointLight
              position={[-3.5, 2.2, -2.0]}
              intensity={0.85}
              distance={16}
              decay={1.8}
              color={activeRoom.hex}
            />
          </group>
        );
      })()}

      {/* Continuous Recessed Champagne Brass Promenade Inlays Connecting the 6 Museum Wings */}
      <mesh geometry={centerInlayGeo}>
        <meshStandardMaterial
          color="#B9A078"
          roughness={0.32}
          metalness={0.78}
        />
      </mesh>
      <mesh geometry={leftCurbGeo}>
        <meshStandardMaterial
          color="#1D1E20"
          roughness={0.62}
          metalness={0.28}
        />
      </mesh>
      <mesh geometry={rightCurbGeo}>
        <meshStandardMaterial
          color="#1D1E20"
          roughness={0.62}
          metalness={0.28}
        />
      </mesh>

      {/* Six Interconnected Contemporary Museum Gallery Halls */}
      {SPATIAL_DESTINATIONS.map((dest) => {
        const isCurrent = activeDestination === dest.id;
        return (
          <group key={dest.id} position={dest.roomCenter}>
            {/* Architectural Dark Honed Stone Floor Pavilion (Replaces Oversized Blue Platform) */}
            <mesh position={[0, -2.32, 0]}>
              <boxGeometry args={[17.5, 0.16, 13.5]} />
              <meshStandardMaterial
                color="#FFFFFF"
                map={stoneMap}
                bumpMap={stoneBump}
                bumpScale={0.015}
                roughness={0.58}
                metalness={0.14}
              />
            </mesh>

            {/* Stepped Inner Travertine & Basalt Exhibition Dais */}
            <mesh position={[0, -2.21, -0.3]}>
              <boxGeometry args={[11.6, 0.06, 8.4]} />
              <meshStandardMaterial
                color="#171819"
                roughness={0.52}
                metalness={0.14}
              />
            </mesh>

            {/* Recessed Brushed Champagne Brass Floor Inlay Frame */}
            <mesh position={[0, -2.175, -0.3]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[4.65, 4.71, 64]} />
              <meshStandardMaterial
                color="#B9A078"
                roughness={0.32}
                metalness={0.78}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Subtle Radial Contact Shadow Grounding Disc Under Central Installation */}
            <mesh position={[0, -2.17, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[3.8, 48]} />
              <meshBasicMaterial
                color="#090A0B"
                transparent
                opacity={0.45}
                depthWrite={false}
              />
            </mesh>

            {/* 3. Architectural Venetian Plaster Back Gallery Wall & Fluted Side Wings */}
            <group position={[0, 1.35, -5.2]}>
              {/* Left & Right Rear Wall Panels framing a central vista portal */}
              <mesh position={[-5.2, 0, 0]}>
                <boxGeometry args={[5.6, 7.2, 0.32]} />
                <meshStandardMaterial
                  color="#FFFFFF"
                  map={plasterMap}
                  roughness={0.84}
                  metalness={0.05}
                />
              </mesh>
              <mesh position={[5.2, 0, 0]}>
                <boxGeometry args={[5.6, 7.2, 0.32]} />
                <meshStandardMaterial
                  color="#FFFFFF"
                  map={plasterMap}
                  roughness={0.84}
                  metalness={0.05}
                />
              </mesh>

              {/* Architectural Portal Header Lintel */}
              <mesh position={[0, 2.85, 0]}>
                <boxGeometry args={[5.2, 1.5, 0.36]} />
                <meshStandardMaterial
                  color="#171819"
                  roughness={0.8}
                  metalness={0.06}
                />
              </mesh>

              {/* Brushed Bronze Portal Jambs Framing the Vista Corridor */}
              <mesh position={[-2.48, -0.75, 0.04]}>
                <boxGeometry args={[0.18, 5.7, 0.42]} />
                <meshStandardMaterial color="#7B6A50" roughness={0.38} metalness={0.72} />
              </mesh>
              <mesh position={[2.48, -0.75, 0.04]}>
                <boxGeometry args={[0.18, 5.7, 0.42]} />
                <meshStandardMaterial color="#7B6A50" roughness={0.38} metalness={0.72} />
              </mesh>
              <mesh position={[0, 2.12, 0.04]}>
                <boxGeometry args={[5.14, 0.14, 0.42]} />
                <meshStandardMaterial color="#B9A078" roughness={0.34} metalness={0.78} />
              </mesh>

              {/* Dark Stone Baseboard Skirting */}
              <mesh position={[-5.2, -3.42, 0.05]}>
                <boxGeometry args={[5.6, 0.36, 0.36]} />
                <meshStandardMaterial color="#101112" roughness={0.55} metalness={0.16} />
              </mesh>
              <mesh position={[5.2, -3.42, 0.05]}>
                <boxGeometry args={[5.6, 0.36, 0.36]} />
                <meshStandardMaterial color="#101112" roughness={0.55} metalness={0.16} />
              </mesh>

              {/* Framed Rear Wall Displays (Home, Skills, Experience & Contact Rooms Display Authentic Artworks; Other Rooms Keep Subtle Relief Motif) */}
              {[-5.2, 5.2].map((wx, idx) => {
                const isHomeRoom = dest.id === 'home';
                const isAboutRoom = dest.id === 'about';
                const isSkillsRoom = dest.id === 'skills';
                const isExperienceRoom = dest.id === 'experience';
                const isContactRoom = dest.id === 'contact';
                const hasCustomArtwork =
                  isHomeRoom ||
                  isSkillsRoom ||
                  isExperienceRoom ||
                  isContactRoom;
                const isLeftWall = idx === 0;
                const isAboutRightPhilosophyCard = isAboutRoom && !isLeftWall;
                const isLeftHomeLandscape = isHomeRoom && isLeftWall;
                const isLeftSkillsLandscape = isSkillsRoom && isLeftWall;
                const isRightSkillsLandscape = isSkillsRoom && !isLeftWall;
                const isLeftContactLandscape = isContactRoom && isLeftWall;
                const isRightContactLandscape = isContactRoom && !isLeftWall;

                const artworkDims = isHomeRoom
                  ? isLeftWall
                    ? leftHomeArtworkDims
                    : rightHomeArtworkDims
                  : isSkillsRoom
                    ? isLeftWall
                      ? leftSkillsArtworkDims
                      : rightSkillsArtworkDims
                    : isExperienceRoom
                      ? isLeftWall
                        ? leftExperienceArtworkDims
                        : rightExperienceArtworkDims
                      : isContactRoom
                        ? isLeftWall
                          ? leftContactArtworkDims
                          : rightContactArtworkDims
                        : rightHomeArtworkDims;

                const artworkTexture = isHomeRoom
                  ? isLeftWall
                    ? leftHomeArtworkTex
                    : rightHomeArtworkTex
                  : isSkillsRoom
                    ? isLeftWall
                      ? leftSkillsArtworkTex
                      : rightSkillsArtworkTex
                    : isExperienceRoom
                      ? isLeftWall
                        ? leftExperienceArtworkTex
                        : rightExperienceArtworkTex
                      : isContactRoom
                        ? isLeftWall
                          ? leftContactArtworkTex
                          : rightContactArtworkTex
                        : null;

                // Give Home Left (landscape), Home Right (portrait), Skills Left & Right (landscape),
                // Experience Left & Right (portrait), and Contact Left & Right (landscape)
                // independent frame geometries derived from each artwork's native aspect ratio.
                let outerFrameWidth = 2.1;
                let outerFrameHeight = 2.7;
                let innerMatWidth = 1.82;
                let innerMatHeight = 2.42;
                let displayX = wx;
                let displayY = 0.15;

                if (isHomeRoom) {
                  displayY = 0.32;
                }

                if (isLeftHomeLandscape) {
                  outerFrameWidth = Number((artworkDims.width + 0.36).toFixed(4));
                  outerFrameHeight = Number((artworkDims.height + 0.36).toFixed(4));
                  innerMatWidth = Number((artworkDims.width + 0.16).toFixed(4));
                  innerMatHeight = Number((artworkDims.height + 0.16).toFixed(4));
                } else if (isLeftSkillsLandscape) {
                  outerFrameWidth = Number((artworkDims.width + 0.34).toFixed(4));
                  outerFrameHeight = Number((artworkDims.height + 0.34).toFixed(4));
                  innerMatWidth = Number((artworkDims.width + 0.15).toFixed(4));
                  innerMatHeight = Number((artworkDims.height + 0.15).toFixed(4));
                  displayX = -6.1;
                  displayY = 0.9;
                } else if (isRightSkillsLandscape) {
                  outerFrameWidth = Number((artworkDims.width + 0.34).toFixed(4));
                  outerFrameHeight = Number((artworkDims.height + 0.34).toFixed(4));
                  innerMatWidth = Number((artworkDims.width + 0.15).toFixed(4));
                  innerMatHeight = Number((artworkDims.height + 0.15).toFixed(4));
                  displayX = 6.1;
                  displayY = 0.9;
                } else if (isExperienceRoom) {
                  displayX = isLeftWall ? -5.85 : 5.85;
                  displayY = 0.85;
                } else if (isLeftContactLandscape) {
                  outerFrameWidth = Number((artworkDims.width + 0.34).toFixed(4));
                  outerFrameHeight = Number((artworkDims.height + 0.34).toFixed(4));
                  innerMatWidth = Number((artworkDims.width + 0.15).toFixed(4));
                  innerMatHeight = Number((artworkDims.height + 0.15).toFixed(4));
                  displayX = -5.85;
                  displayY = 1.56;
                } else if (isRightContactLandscape) {
                  outerFrameWidth = Number((artworkDims.width + 0.34).toFixed(4));
                  outerFrameHeight = Number((artworkDims.height + 0.34).toFixed(4));
                  innerMatWidth = Number((artworkDims.width + 0.15).toFixed(4));
                  innerMatHeight = Number((artworkDims.height + 0.15).toFixed(4));
                  displayX = 6.04;
                  displayY = 1.56;
                }

                return (
                  <group key={idx} position={[displayX, displayY, 0.2]}>
                    {/* Outer Frame */}
                    <mesh>
                      <boxGeometry
                        args={[outerFrameWidth, outerFrameHeight, 0.08]}
                      />
                      <meshStandardMaterial
                        color="#1D1E20"
                        roughness={0.48}
                        metalness={0.22}
                      />
                    </mesh>
                    {/* Inner Mat Board */}
                    <mesh position={[0, 0, 0.045]}>
                      <boxGeometry args={[innerMatWidth, innerMatHeight, 0.02]} />
                      <meshStandardMaterial
                        color="#151618"
                        roughness={0.82}
                        metalness={0.05}
                      />
                    </mesh>

                    {hasCustomArtwork ? (
                      <>
                        {/* Restrained Champagne Inner Bevel Fillet Around Aspect-Preserved Artwork */}
                        <mesh position={[0, 0, 0.056]}>
                          <boxGeometry
                            args={[
                              artworkDims.width + 0.05,
                              artworkDims.height + 0.05,
                              0.012,
                            ]}
                          />
                          <meshStandardMaterial
                            color="#B9A078"
                            roughness={0.34}
                            metalness={0.76}
                          />
                        </mesh>

                        {/* Dark Charcoal Conservation Recess Mount */}
                        <mesh position={[0, 0, 0.06]}>
                          <boxGeometry
                            args={[
                              artworkDims.width + 0.018,
                              artworkDims.height + 0.018,
                              0.012,
                            ]}
                          />
                          <meshStandardMaterial
                            color="#111214"
                            roughness={0.86}
                            metalness={0.04}
                          />
                        </mesh>

                        {/* Authentic Artwork Surface (Fit/Contain — Never Stretched or Cropped) */}
                        <mesh position={[0, 0, 0.068]}>
                          <planeGeometry
                            args={[artworkDims.width, artworkDims.height]}
                          />
                          {artworkTexture ? (
                            <meshBasicMaterial
                              map={artworkTexture}
                              color="#EFECE4"
                              toneMapped={false}
                            />
                          ) : (
                            <meshStandardMaterial
                              color="#17181A"
                              roughness={0.78}
                              metalness={0.04}
                            />
                          )}
                        </mesh>
                      </>
                    ) : isAboutRightPhilosophyCard ? (
                      <mesh position={[0, 0, 0.058]}>
                        <planeGeometry args={[innerMatWidth, innerMatHeight]} />
                        <meshBasicMaterial map={aboutPhilosophyCardTex} />
                      </mesh>
                    ) : (
                      <>
                        {/* Subtle Champagne Geometric Relief Motif */}
                        <mesh position={[0, 0.1, 0.065]}>
                          <ringGeometry args={[0.38, 0.41, 32]} />
                          <meshStandardMaterial
                            color="#B9A078"
                            roughness={0.34}
                            metalness={0.76}
                            side={THREE.DoubleSide}
                          />
                        </mesh>
                        <mesh position={[0, -0.78, 0.065]}>
                          <planeGeometry args={[0.9, 0.03]} />
                          <meshBasicMaterial
                            color={dest.hex}
                            transparent
                            opacity={0.55}
                          />
                        </mesh>
                      </>
                    )}
                  </group>
                );
              })}
            </group>

            {/* 4. Flanking Architectural Gallery Columns / Pilasters */}
            {[-8.2, 8.2].map((colX, cIdx) => (
              <group key={cIdx} position={[colX, 1.35, -2.2]}>
                {/* Column Shaft */}
                <mesh>
                  <boxGeometry args={[0.68, 7.2, 0.85]} />
                  <meshStandardMaterial color="#171819" roughness={0.78} metalness={0.08} />
                </mesh>
                {/* Column Stone Plinth Base */}
                <mesh position={[0, -3.35, 0]}>
                  <boxGeometry args={[0.88, 0.5, 1.05]} />
                  <meshStandardMaterial color="#101112" roughness={0.52} metalness={0.18} />
                </mesh>
                {/* Brushed Champagne Vertical Reveal Inlay */}
                <mesh position={[colX < 0 ? 0.35 : -0.35, 0, 0]}>
                  <boxGeometry args={[0.025, 6.4, 0.12]} />
                  <meshStandardMaterial color="#B9A078" roughness={0.34} metalness={0.78} />
                </mesh>
              </group>
            ))}

            {/* 5. Coffered Museum Ceiling & Recessed Linear Lighting */}
            <group position={[0, 5.05, -0.8]}>
              {/* Main Ceiling Canopy Frame */}
              <mesh>
                <boxGeometry args={[16.2, 0.24, 11.4]} />
                <meshStandardMaterial color="#101112" roughness={0.86} metalness={0.06} />
              </mesh>
              {/* Recessed Warm Light Cove Strips */}
              <mesh position={[-4.2, -0.13, 0]}>
                <boxGeometry args={[0.12, 0.02, 8.6]} />
                <meshBasicMaterial color="#F1EEE7" />
              </mesh>
              <mesh position={[4.2, -0.13, 0]}>
                <boxGeometry args={[0.12, 0.02, 8.6]} />
                <meshBasicMaterial color="#F1EEE7" />
              </mesh>
              {/* Museum Track-Light Cans */}
              {[-2.2, 0, 2.2].map((lx, lIdx) => (
                <group key={lIdx} position={[lx, -0.24, 1.8]}>
                  <mesh>
                    <cylinderGeometry args={[0.08, 0.1, 0.26, 16]} />
                    <meshStandardMaterial color="#1D1E20" roughness={0.4} metalness={0.68} />
                  </mesh>
                  <mesh position={[0, -0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.075, 16]} />
                    <meshBasicMaterial color="#F1EEE7" />
                  </mesh>
                </group>
              ))}
            </group>

            {/* 6. Clickable Museum Wayfinding Stele (Sculpted Stone & Champagne Brass Pedestal) */}
            <group
              position={[4.85, -1.5, 2.1]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectDestination(dest.id);
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
              {/* Stepped Stone Plinth Foot */}
              <mesh position={[0, -0.68, 0]}>
                <boxGeometry args={[0.64, 0.12, 0.64]} />
                <meshStandardMaterial color="#101112" roughness={0.48} metalness={0.18} />
              </mesh>
              {/* Honed Basalt Pedestal Column */}
              <mesh position={[0, -0.2, 0]}>
                <boxGeometry args={[0.44, 0.85, 0.44]} />
                <meshStandardMaterial color="#171819" roughness={0.64} metalness={0.16} />
              </mesh>
              {/* Brushed Champagne Collar Cap */}
              <mesh position={[0, 0.25, 0]}>
                <boxGeometry args={[0.48, 0.04, 0.48]} />
                <meshStandardMaterial color="#B9A078" roughness={0.32} metalness={0.78} />
              </mesh>
              {/* Faceted Pigment Sculpture Finial */}
              <mesh position={[0, 0.52, 0]} rotation={[0, Math.PI / 4, 0]}>
                <octahedronGeometry args={[0.17, 0]} />
                <meshStandardMaterial
                  color={dest.hex}
                  emissive={dest.hex}
                  emissiveIntensity={isCurrent ? 0.24 : 0.06}
                  roughness={0.24}
                  metalness={0.22}
                />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* Subtle Warm Gallery Dust Motes */}
      <instancedMesh ref={dustRef} args={[undefined, undefined, maxParticleCount]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshBasicMaterial color="#F1EEE7" transparent opacity={0.32} />
      </instancedMesh>
    </group>
  );
};
