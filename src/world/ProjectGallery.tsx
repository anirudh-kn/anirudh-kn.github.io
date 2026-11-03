import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  PROJECT_INSTALLATIONS,
  ProjectInstallation,
  SPATIAL_DESTINATIONS,
} from '../data/portfolioData';
import { computeAspectPreservedDimensions } from '../utils/atelierLogic';
import { SeismosGlobe } from './SeismosGlobe';

interface ProjectGalleryProps {
  projectFilter: 'all' | 'ml' | 'bi';
  focusedProjectId: ProjectInstallation['id'] | null;
  activeScreenshotIndex: number;
  onSelectProject: (project: ProjectInstallation) => void;
  onOpenFullscreenScreenshot?: (
    project: ProjectInstallation,
    screenshotIndex: number,
  ) => void;
}

interface FramedScreenshotDisplayProps {
  screenshotUrl: string;
  aspectRatio: number;
  maxWidth: number;
  maxHeight: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  accentColor: string;
  isFocused: boolean;
  onClick: () => void;
}

const FramedScreenshotDisplay: React.FC<FramedScreenshotDisplayProps> = ({
  screenshotUrl,
  aspectRatio,
  maxWidth,
  maxHeight,
  position,
  rotation = [0, 0, 0],
  accentColor,
  isFocused,
  onClick,
}) => {
  const { invalidate } = useThree();
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const frameRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(
      screenshotUrl,
      (tex) => {
        if (cancelled) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
        setTexture(tex);
        invalidate();
      },
      undefined,
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, [screenshotUrl, invalidate]);

  const dims = useMemo(
    () => computeAspectPreservedDimensions(aspectRatio, maxWidth, maxHeight),
    [aspectRatio, maxWidth, maxHeight],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (frameRef.current) {
      const targetScale = isFocused ? 1.06 : 0.96;
      const nextScale = THREE.MathUtils.damp(
        frameRef.current.scale.x,
        targetScale,
        7,
        dt,
      );
      frameRef.current.scale.setScalar(nextScale);
    }
  });

  return (
    <group
      ref={frameRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
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
      {/* Brushed Brass Architectural Frame Border */}
      <mesh position={[0, 0, -0.035]}>
        <boxGeometry args={[dims.width + 0.16, dims.height + 0.16, 0.045]} />
        <meshStandardMaterial
          color={isFocused ? '#DFC086' : '#B9A078'}
          roughness={0.24}
          metalness={0.9}
        />
      </mesh>

      {/* Subtle Pigment Accent Hairline Fillet */}
      <mesh position={[0, 0, -0.015]}>
        <boxGeometry args={[dims.width + 0.09, dims.height + 0.09, 0.03]} />
        <meshStandardMaterial
          color={accentColor}
          roughness={0.35}
          metalness={0.5}
        />
      </mesh>

      {/* Dark Museum Conservation Mat */}
      <mesh position={[0, 0, -0.005]}>
        <boxGeometry args={[dims.width + 0.05, dims.height + 0.05, 0.02]} />
        <meshStandardMaterial color="#0D0C10" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Authentic High-Resolution Dashboard Screenshot (Aspect Ratio Preserved) */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[dims.width, dims.height]} />
        {texture ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#18171D" roughness={0.5} />
        )}
      </mesh>
    </group>
  );
};

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({
  projectFilter,
  focusedProjectId,
  activeScreenshotIndex,
  onSelectProject,
  onOpenFullscreenScreenshot,
}) => {
  const projectsCenter = SPATIAL_DESTINATIONS[3].roomCenter;
  const salesBarsRef = useRef<THREE.Group | null>(null);
  const salesParticlesRef = useRef<THREE.Group | null>(null);
  const churnRingsRef = useRef<THREE.Group | null>(null);
  const churnNodesRef = useRef<THREE.Group | null>(null);
  const funnelTiersRef = useRef<THREE.Group | null>(null);
  const funnelParticlesRef = useRef<THREE.Group | null>(null);

  const seismosProject = useMemo(
    () => PROJECT_INSTALLATIONS.find((p) => p.id === 'seismos')!,
    [],
  );
  const salesProject = useMemo(
    () => PROJECT_INSTALLATIONS.find((p) => p.id === 'sales-dashboard')!,
    [],
  );
  const churnProject = useMemo(
    () => PROJECT_INSTALLATIONS.find((p) => p.id === 'churn-analysis')!,
    [],
  );
  const funnelProject = useMemo(
    () => PROJECT_INSTALLATIONS.find((p) => p.id === 'marketing-funnel')!,
    [],
  );

  // Interconnected customer cohort nodes for the Churn sculpture (Retained vs Churned pathways)
  const churnNetworkNodes = useMemo(
    () => [
      { pos: [-0.52, 0.36, 0.22] as [number, number, number], retained: true },
      { pos: [-0.28, 0.62, -0.18] as [number, number, number], retained: true },
      { pos: [0.15, 0.68, 0.24] as [number, number, number], retained: true },
      { pos: [-0.45, -0.12, -0.25] as [number, number, number], retained: true },
      { pos: [0.08, -0.28, 0.3] as [number, number, number], retained: true },
      { pos: [0.54, 0.42, -0.16] as [number, number, number], retained: false },
      { pos: [0.62, -0.08, 0.22] as [number, number, number], retained: false },
      { pos: [0.36, -0.42, -0.2] as [number, number, number], retained: false },
    ],
    [],
  );

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (salesBarsRef.current) {
      salesBarsRef.current.children.forEach((bar, i) => {
        bar.position.y =
          bar.userData.baseY + Math.sin(elapsed * 1.4 + i * 0.6) * 0.035;
      });
    }

    if (salesParticlesRef.current) {
      salesParticlesRef.current.rotation.y = elapsed * 0.18;
    }

    if (churnRingsRef.current) {
      churnRingsRef.current.rotation.y = elapsed * 0.25;
      churnRingsRef.current.rotation.z = Math.sin(elapsed * 0.4) * 0.1;
    }

    if (churnNodesRef.current) {
      churnNodesRef.current.rotation.y = -elapsed * 0.16;
    }

    if (funnelTiersRef.current) {
      funnelTiersRef.current.rotation.y = -elapsed * 0.2;
    }

    if (funnelParticlesRef.current) {
      funnelParticlesRef.current.children.forEach((p, idx) => {
        const cycle = (elapsed * 0.45 + idx * 0.18) % 1;
        p.position.y = 0.78 - cycle * 1.45;
        const radius = (1 - cycle * 0.78) * 0.42;
        p.position.x = Math.cos(elapsed * 1.5 + idx) * radius;
        p.position.z = Math.sin(elapsed * 1.5 + idx) * radius;
      });
    }
  });

  const isCategoryVisible = (cat: 'ml' | 'bi') =>
    projectFilter === 'all' || projectFilter === cat;

  return (
    <group position={projectsCenter} name="projects-digital-exhibition">
      {/* 1. Centerpiece Flagship Installation: Seismos 3D Tectonic Globe + Framed Screenshot Display */}
      <group
        position={seismosProject.localPosition}
        scale={isCategoryVisible('ml') ? 1 : 0.55}
      >
        <SeismosGlobe
          isFocused={focusedProjectId === 'seismos'}
          screenshots={seismosProject.screenshots}
          activeScreenshotIndex={
            focusedProjectId === 'seismos' ? activeScreenshotIndex : 0
          }
          onFocusGlobe={() => onSelectProject(seismosProject)}
          onOpenFullscreenScreenshot={(idx) =>
            onOpenFullscreenScreenshot?.(seismosProject, idx)
          }
        />
      </group>

      {/* 2. Left Wing Installation: Sales Performance Dashboard ($2.30M / 38K Orders / $286.40K Profit) */}
      <group
        position={salesProject.localPosition}
        scale={isCategoryVisible('bi') ? 1 : 0.55}
        onClick={(e) => {
          e.stopPropagation();
          onSelectProject(salesProject);
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
        <pointLight
          position={[0, 2.8, 1.6]}
          intensity={focusedProjectId === 'sales-dashboard' ? 2.3 : 1.15}
          distance={8}
          color="#6B84C4"
        />

        {/* Stepped Honed Stone Museum Pedestal */}
        <mesh position={[0, -1.62, 0]}>
          <boxGeometry args={[2.05, 0.16, 2.05]} />
          <meshStandardMaterial color="#100F13" roughness={0.48} metalness={0.2} />
        </mesh>
        <mesh position={[0, -1.22, 0]}>
          <boxGeometry args={[1.72, 0.65, 1.72]} />
          <meshStandardMaterial color="#18171C" roughness={0.58} metalness={0.18} />
        </mesh>
        {/* Brushed Brass Plinth Collar */}
        <mesh position={[0, -0.87, 0]}>
          <boxGeometry args={[1.78, 0.05, 1.78]} />
          <meshStandardMaterial color="#B9A078" roughness={0.24} metalness={0.9} />
        </mesh>
        {focusedProjectId === 'sales-dashboard' && (
          <mesh position={[0, -1.69, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.38, 1.46, 64]} />
            <meshBasicMaterial color="#B9A078" side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Architectural Ascending Revenue Columns (Technology $0.84M, Furniture $0.74M, Office Supplies $0.72M) */}
        <group ref={salesBarsRef}>
          {[
            { x: -0.56, z: 0.16, h: 0.82, color: '#27262C', metal: 0.35 },
            { x: -0.19, z: -0.16, h: 1.22, color: '#3B5BDB', metal: 0.45 },
            { x: 0.19, z: 0.16, h: 1.48, color: '#6B84C4', metal: 0.5 },
            { x: 0.56, z: -0.16, h: 1.84, color: '#B9A078', metal: 0.88 },
          ].map((bar, i) => {
            const baseY = -0.84 + bar.h / 2;
            return (
              <group key={i} position={[bar.x, baseY, bar.z]} userData={{ baseY }}>
                <mesh>
                  <boxGeometry args={[0.26, bar.h, 0.26]} />
                  <meshStandardMaterial
                    color={bar.color}
                    roughness={0.24}
                    metalness={bar.metal}
                  />
                </mesh>
                {/* Brushed Gold Crown Finial on Each Column */}
                <mesh position={[0, bar.h / 2 + 0.02, 0]}>
                  <boxGeometry args={[0.28, 0.03, 0.28]} />
                  <meshStandardMaterial color="#F1EEE7" roughness={0.2} metalness={0.8} />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* Subtle Orbiting Revenue KPI Nodes */}
        <group ref={salesParticlesRef} position={[0, 0.28, 0]}>
          {[
            [-0.74, 0.45, 0.45, '#B9A078'],
            [0.78, 0.75, 0.38, '#6B84C4'],
            [-0.42, 0.88, -0.48, '#F1EEE7'],
          ].map(([px, py, pz, col], idx) => (
            <mesh key={idx} position={[px as number, py as number, pz as number]}>
              <sphereGeometry args={[0.042, 16, 16]} />
              <meshStandardMaterial
                color={col as string}
                emissive={col as string}
                emissiveIntensity={0.35}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          ))}
        </group>

        {/* Museum Glass Vitrine Frame Outline Around the Sculpture */}
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[1.64, 2.15, 1.64]} />
          <meshPhysicalMaterial
            color="#F1EEE7"
            transparent
            opacity={focusedProjectId === 'sales-dashboard' ? 0.11 : 0.04}
            roughness={0.1}
            metalness={0.1}
            clearcoat={1}
          />
        </mesh>

        {/* Framed Power BI Sales Performance Dashboard Screenshot */}
        <FramedScreenshotDisplay
          screenshotUrl={salesProject.screenshots[0].url}
          aspectRatio={salesProject.screenshots[0].aspectRatio}
          maxWidth={2.75}
          maxHeight={1.52}
          position={[0, 2.38, -0.55]}
          rotation={[0, 0.12, 0]}
          accentColor={salesProject.pigmentColor}
          isFocused={focusedProjectId === 'sales-dashboard'}
          onClick={() => {
            if (
              focusedProjectId === 'sales-dashboard' &&
              onOpenFullscreenScreenshot
            ) {
              onOpenFullscreenScreenshot(salesProject, 0);
            } else {
              onSelectProject(salesProject);
            }
          }}
        />
      </group>

      {/* 3. Center-Right Pavilion Installation: Customer Retention & Churn Analysis (26.54% Churn Rate) */}
      <group
        position={churnProject.localPosition}
        scale={isCategoryVisible('bi') ? 1 : 0.55}
        onClick={(e) => {
          e.stopPropagation();
          onSelectProject(churnProject);
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
        <pointLight
          position={[0, 2.8, 1.6]}
          intensity={focusedProjectId === 'churn-analysis' ? 2.3 : 1.15}
          distance={8}
          color="#B9A078"
        />

        {/* Stepped Honed Stone Museum Pedestal */}
        <mesh position={[0, -1.62, 0]}>
          <boxGeometry args={[2.05, 0.16, 2.05]} />
          <meshStandardMaterial color="#100F13" roughness={0.48} metalness={0.2} />
        </mesh>
        <mesh position={[0, -1.22, 0]}>
          <boxGeometry args={[1.72, 0.65, 1.72]} />
          <meshStandardMaterial color="#18171C" roughness={0.58} metalness={0.18} />
        </mesh>
        <mesh position={[0, -0.87, 0]}>
          <boxGeometry args={[1.78, 0.05, 1.78]} />
          <meshStandardMaterial color="#B9A078" roughness={0.24} metalness={0.9} />
        </mesh>
        {focusedProjectId === 'churn-analysis' && (
          <mesh position={[0, -1.69, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.38, 1.46, 64]} />
            <meshBasicMaterial color="#B9A078" side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Brass Mounting Spindle */}
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.04, 0.07, 1.15, 16]} />
          <meshStandardMaterial color="#B9A078" roughness={0.25} metalness={0.88} />
        </mesh>

        {/* Kinetic Nested Brass & Vermilion Cohort Rings + Interconnected Customer Network Nodes */}
        <group ref={churnRingsRef} position={[0, 0.32, 0]}>
          <mesh rotation={[0.45, 0.2, 0]}>
            <torusGeometry args={[0.88, 0.048, 24, 72]} />
            <meshStandardMaterial color="#B9A078" roughness={0.22} metalness={0.9} />
          </mesh>
          <mesh rotation={[-0.55, 0.4, 0.25]}>
            <torusGeometry args={[0.64, 0.04, 24, 64]} />
            <meshStandardMaterial
              color="#C7745C"
              roughness={0.28}
              metalness={0.45}
            />
          </mesh>
          <mesh rotation={[0.2, -0.6, 0.4]}>
            <torusGeometry args={[0.4, 0.032, 20, 48]} />
            <meshStandardMaterial color="#6B84C4" roughness={0.25} metalness={0.5} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.15, 24, 24]} />
            <meshStandardMaterial color="#F1EEE7" roughness={0.2} metalness={0.3} />
          </mesh>
        </group>

        {/* Interconnected Customer Cohort Nodes (73.46% Retained Blue/Teal vs 26.54% Churned Vermilion) */}
        <group ref={churnNodesRef} position={[0, 0.32, 0]}>
          {churnNetworkNodes.map((node, i) => (
            <mesh key={i} position={node.pos}>
              <sphereGeometry args={[0.06, 18, 18]} />
              <meshPhysicalMaterial
                color={node.retained ? '#6B84C4' : '#C7745C'}
                emissive={node.retained ? '#6B84C4' : '#C7745C'}
                emissiveIntensity={0.35}
                roughness={0.18}
                metalness={0.3}
                clearcoat={1}
              />
            </mesh>
          ))}
        </group>

        {/* Framed Power BI Customer Churn Analysis Screenshot */}
        <FramedScreenshotDisplay
          screenshotUrl={churnProject.screenshots[0].url}
          aspectRatio={churnProject.screenshots[0].aspectRatio}
          maxWidth={2.75}
          maxHeight={1.52}
          position={[0, 2.38, -0.55]}
          rotation={[0, -0.05, 0]}
          accentColor={churnProject.pigmentColor}
          isFocused={focusedProjectId === 'churn-analysis'}
          onClick={() => {
            if (
              focusedProjectId === 'churn-analysis' &&
              onOpenFullscreenScreenshot
            ) {
              onOpenFullscreenScreenshot(churnProject, 0);
            } else {
              onSelectProject(churnProject);
            }
          }}
        />
      </group>

      {/* 4. Right Wing Installation: Marketing Funnel & Conversion Analysis (36K Visitors -> 2K Customers / 5.42%) */}
      <group
        position={funnelProject.localPosition}
        scale={isCategoryVisible('bi') ? 1 : 0.55}
        onClick={(e) => {
          e.stopPropagation();
          onSelectProject(funnelProject);
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
        <pointLight
          position={[0, 2.8, 1.6]}
          intensity={focusedProjectId === 'marketing-funnel' ? 2.3 : 1.15}
          distance={8}
          color="#659B93"
        />

        {/* Stepped Honed Stone Museum Pedestal (Matching Gallery Floor Horizon) */}
        <mesh position={[0, -1.62, 0]}>
          <boxGeometry args={[2.05, 0.16, 2.05]} />
          <meshStandardMaterial color="#100F13" roughness={0.48} metalness={0.2} />
        </mesh>
        <mesh position={[0, -1.22, 0]}>
          <boxGeometry args={[1.72, 0.65, 1.72]} />
          <meshStandardMaterial color="#18171C" roughness={0.58} metalness={0.18} />
        </mesh>
        <mesh position={[0, -0.87, 0]}>
          <boxGeometry args={[1.78, 0.05, 1.78]} />
          <meshStandardMaterial color="#B9A078" roughness={0.24} metalness={0.9} />
        </mesh>
        {focusedProjectId === 'marketing-funnel' && (
          <mesh position={[0, -1.69, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.38, 1.46, 64]} />
            <meshBasicMaterial color="#B9A078" side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* 4-Stage Acquisition Funnel Sculpture (36K Visitors -> 15K Leads -> 6K Prospects -> 2K Customers) */}
        <group ref={funnelTiersRef} position={[0, 0.28, 0]}>
          {[
            { y: 0.65, rTop: 0.88, rBot: 0.68, color: '#6B84C4' },
            { y: 0.22, rTop: 0.64, rBot: 0.44, color: '#659B93' },
            { y: -0.18, rTop: 0.4, rBot: 0.25, color: '#B9A078' },
            { y: -0.55, rTop: 0.22, rBot: 0.11, color: '#C7745C' },
          ].map((tier, idx) => (
            <group key={idx} position={[0, tier.y, 0]}>
              <mesh>
                <cylinderGeometry args={[tier.rTop, tier.rBot, 0.28, 36]} />
                <meshPhysicalMaterial
                  color={tier.color}
                  roughness={0.2}
                  metalness={0.35}
                  clearcoat={0.8}
                  transparent
                  opacity={0.9}
                />
              </mesh>
              <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[tier.rTop, 0.015, 12, 48]} />
                <meshStandardMaterial color="#B9A078" roughness={0.22} metalness={0.9} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Flowing Lead-to-Customer Conversion Particles */}
        <group ref={funnelParticlesRef} position={[0, 0.28, 0]}>
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <mesh key={idx} position={[0, 0.6 - idx * 0.2, 0]}>
              <sphereGeometry args={[0.042, 12, 12]} />
              <meshStandardMaterial
                color={idx % 2 === 0 ? '#F1EEE7' : '#B9A078'}
                emissive="#B9A078"
                emissiveIntensity={0.45}
              />
            </mesh>
          ))}
        </group>

        {/* Framed Power BI Customer Conversion Funnel Screenshot */}
        <FramedScreenshotDisplay
          screenshotUrl={funnelProject.screenshots[0].url}
          aspectRatio={funnelProject.screenshots[0].aspectRatio}
          maxWidth={2.75}
          maxHeight={1.52}
          position={[0, 2.38, -0.55]}
          rotation={[0, -0.12, 0]}
          accentColor={funnelProject.pigmentColor}
          isFocused={focusedProjectId === 'marketing-funnel'}
          onClick={() => {
            if (
              focusedProjectId === 'marketing-funnel' &&
              onOpenFullscreenScreenshot
            ) {
              onOpenFullscreenScreenshot(funnelProject, 0);
            } else {
              onSelectProject(funnelProject);
            }
          }}
        />
      </group>
    </group>
  );
};
