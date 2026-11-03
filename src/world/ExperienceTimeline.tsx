import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  EXPERIENCE_CATEGORY_COLORS,
  SPATIAL_DESTINATIONS,
  TIMELINE_ENTRIES,
  TimelineEntry,
} from '../data/portfolioData';

interface ExperienceTimelineProps {
  selectedEntryId: string;
  onSelectEntry: (entryId: string) => void;
  activeFilter?: 'all' | TimelineEntry['type'];
  hudExpanded?: boolean;
}

export const ExperienceTimeline: React.FC<ExperienceTimelineProps> = ({
  selectedEntryId,
  onSelectEntry,
  activeFilter = 'all',
  hudExpanded = true,
}) => {
  const { size } = useThree();
  const isMobile = size.width < 768;
  const expCenter = SPATIAL_DESTINATIONS[4].roomCenter;
  const stageGroupRef = useRef<THREE.Group | null>(null);
  const milestoneRefs = useRef<Record<string, THREE.Group | null>>({});
  const centerpieceRefs = useRef<Record<string, THREE.Mesh | null>>({});

  const {
    spineTubeGeo,
    spineInlayGeo,
    stanchions,
    milestones,
  } = useMemo(() => {
    // One continuous, controlled architectural spine recessed slightly in -Z behind the milestones
    const spinePoints = [
      new THREE.Vector3(-3.85, 0.22, -0.14),
      new THREE.Vector3(-2.3, 0.58, -0.18),
      new THREE.Vector3(-0.75, 0.18, -0.12),
      new THREE.Vector3(0.8, 0.6, -0.18),
      new THREE.Vector3(2.35, 0.36, -0.12),
      new THREE.Vector3(3.85, 0.64, -0.16),
    ];

    const spineCurve = new THREE.CatmullRomCurve3(spinePoints);
    const inlayCurve = new THREE.CatmullRomCurve3(
      spinePoints.map((p) => new THREE.Vector3(p.x, p.y + 0.025, p.z + 0.012)),
    );

    const spineTube = new THREE.TubeGeometry(spineCurve, 108, 0.026, 16, false);
    const spineInlay = new THREE.TubeGeometry(inlayCurve, 108, 0.008, 10, false);

    // 4 quiet structural stanchions grounding the spine to the plinth without crossing milestones
    const plinthTopY = -2.0;
    const stanchionFractions = [0.1, 0.36, 0.64, 0.9];
    const stanchionList = stanchionFractions.map((t, idx) => {
      const pt = spineCurve.getPointAt(t);
      const height = Math.max(0.4, pt.y - plinthTopY);
      return {
        id: `stanchion-${idx}`,
        x: pt.x,
        z: pt.z - 0.02,
        centerY: plinthTopY + height / 2,
        topY: pt.y,
        plinthTopY,
        height,
      };
    });

    // 12 well-spaced milestone exhibition displays staggered above and below the spine
    const nodes = TIMELINE_ENTRIES.map((entry, idx) => {
      const t = (idx + 0.5) / TIMELINE_ENTRIES.length;
      const spinePt = spineCurve.getPointAt(t);
      const isUpper = idx % 2 === 0;
      const yOffset = isUpper ? 0.45 : -0.42;
      const nodePos = new THREE.Vector3(
        spinePt.x,
        spinePt.y + yOffset,
        spinePt.z + 0.16,
      );

      // Rear mounting arm connecting the spine cleanly to the back socket of the milestone housing
      const armStart = new THREE.Vector3(spinePt.x, spinePt.y, spinePt.z);
      const armMid = new THREE.Vector3(
        spinePt.x,
        spinePt.y + yOffset * 0.55,
        spinePt.z + 0.04,
      );
      const armEnd = new THREE.Vector3(
        nodePos.x,
        nodePos.y,
        nodePos.z - 0.075,
      );
      const armCurve = new THREE.CatmullRomCurve3([armStart, armMid, armEnd]);
      const armGeo = new THREE.TubeGeometry(armCurve, 18, 0.011, 8, false);

      const categoryColor =
        EXPERIENCE_CATEGORY_COLORS[entry.type] || entry.pigmentColor;

      return {
        entry,
        index: idx,
        categoryColor,
        pos: [nodePos.x, nodePos.y, nodePos.z] as [number, number, number],
        spineAnchor: [spinePt.x, spinePt.y, spinePt.z] as [
          number,
          number,
          number,
        ],
        armGeo,
      };
    });

    return {
      spineTubeGeo: spineTube,
      spineInlayGeo: spineInlay,
      stanchions: stanchionList,
      milestones: nodes,
    };
  }, []);

  useFrame(({ clock }, delta) => {
    const elapsed = clock.getElapsedTime();

    if (stageGroupRef.current) {
      const targetStageX = !isMobile && hudExpanded ? 0.68 : 0;
      stageGroupRef.current.position.x = THREE.MathUtils.damp(
        stageGroupRef.current.position.x,
        targetStageX,
        6.5,
        delta,
      );
    }

    for (let i = 0; i < milestones.length; i++) {
      const item = milestones[i];
      const id = item.entry.id;
      const isSelected = id === selectedEntryId;
      const matchesFilter =
        activeFilter === 'all' || item.entry.type === activeFilter;

      const grp = milestoneRefs.current[id];
      if (grp) {
        const targetScale = isSelected ? 1.14 : matchesFilter ? 1.0 : 0.92;
        const nextScale = THREE.MathUtils.damp(
          grp.scale.x,
          targetScale,
          7,
          delta,
        );
        grp.scale.setScalar(nextScale);
      }

      const gem = centerpieceRefs.current[id];
      if (gem) {
        gem.rotation.y =
          i * 0.45 + elapsed * (isSelected ? 0.24 : 0.06);
      }
    }
  });

  return (
    <group position={expCenter} name="experience-creative-timeline">
      {/* Foreground Exhibition Group Separated from Rear Gallery Architecture */}
      <group ref={stageGroupRef} position={[0, 0, 0.52]}>
        {/* 1. Quiet Architectural Stone Plinth & Grounding Stanchions */}
        <group position={[0, -2.08, -0.14]}>
          <mesh>
            <boxGeometry args={[8.4, 0.16, 1.2]} />
            <meshStandardMaterial
              color="#141518"
              roughness={0.64}
              metalness={0.16}
            />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <boxGeometry args={[8.0, 0.02, 0.94]} />
            <meshStandardMaterial
              color="#1C1D21"
              roughness={0.54}
              metalness={0.22}
            />
          </mesh>
          {/* Single Restrained Champagne Hairline Trim */}
          <mesh position={[0, 0.102, 0.44]}>
            <boxGeometry args={[7.8, 0.008, 0.018]} />
            <meshStandardMaterial
              color="#B9A078"
              roughness={0.32}
              metalness={0.82}
            />
          </mesh>
        </group>

        {/* 4 Quiet Structural Stanchions Supporting the Timeline Spine */}
        {stanchions.map((st) => (
          <group key={st.id}>
            {/* Dark Matte Plinth Socket Collar */}
            <mesh position={[st.x, st.plinthTopY + 0.03, st.z]}>
              <cylinderGeometry args={[0.046, 0.058, 0.06, 16]} />
              <meshStandardMaterial
                color="#1B1C20"
                roughness={0.62}
                metalness={0.28}
              />
            </mesh>
            {/* Slender Dark Graphite Support Rod */}
            <mesh position={[st.x, st.centerY, st.z]}>
              <cylinderGeometry args={[0.013, 0.017, st.height, 12]} />
              <meshStandardMaterial
                color="#2A2B30"
                roughness={0.48}
                metalness={0.52}
              />
            </mesh>
            {/* Champagne Spine Coupling Collar */}
            <mesh position={[st.x, st.topY, st.z]}>
              <sphereGeometry args={[0.034, 14, 14]} />
              <meshStandardMaterial
                color="#B9A078"
                roughness={0.28}
                metalness={0.85}
              />
            </mesh>
          </group>
        ))}

        {/* 2. One Elegant, Continuous Timeline Spine */}
        <group name="experience-timeline-spine">
          <mesh geometry={spineTubeGeo}>
            <meshStandardMaterial
              color="#B9A078"
              roughness={0.28}
              metalness={0.84}
            />
          </mesh>
          <mesh geometry={spineInlayGeo}>
            <meshStandardMaterial
              color="#F1EEE7"
              transparent
              opacity={0.5}
              roughness={0.22}
              metalness={0.15}
            />
          </mesh>
        </group>

        {/* 3. Twelve Distinct Clickable Milestone Exhibition Displays */}
        {milestones.map(
          ({ entry, index, categoryColor, pos, spineAnchor, armGeo }) => {
            const isSelected = entry.id === selectedEntryId;
            const matchesFilter =
              activeFilter === 'all' || entry.type === activeFilter;

            // Distinct geometric housing silhouette per category type
            const housingSides =
              entry.type === 'internship'
                ? 8
                : entry.type === 'education'
                  ? 4
                  : entry.type === 'forage'
                    ? 6
                    : 12;
            const housingRotZ =
              housingSides === 8
                ? Math.PI / 8
                : housingSides === 4
                  ? Math.PI / 4
                  : housingSides === 6
                    ? Math.PI / 6
                    : 0;

            return (
              <group key={entry.id}>
                {/* Subtle Spine Node Coupling Ring */}
                <mesh position={spineAnchor}>
                  <sphereGeometry args={[0.04, 14, 14]} />
                  <meshStandardMaterial
                    color={isSelected ? categoryColor : '#B9A078'}
                    emissive={isSelected ? categoryColor : '#000000'}
                    emissiveIntensity={isSelected ? 0.35 : 0}
                    roughness={0.26}
                    metalness={0.84}
                  />
                </mesh>

                {/* Rear Mounting Arm Connecting Spine to Milestone Backing */}
                <mesh geometry={armGeo}>
                  <meshStandardMaterial
                    color={isSelected ? categoryColor : '#6E6B64'}
                    emissive={isSelected ? categoryColor : '#000000'}
                    emissiveIntensity={isSelected ? 0.25 : 0}
                    roughness={0.34}
                    metalness={0.62}
                  />
                </mesh>

                {/* Clickable Miniature Exhibition Milestone Object */}
                <group
                  position={pos}
                  rotation={[0.03, -pos[0] * 0.035, 0]}
                  ref={(el) => {
                    milestoneRefs.current[entry.id] = el;
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEntry(entry.id);
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
                  {/* Rear Dark Matte Mounting Socket */}
                  <mesh
                    position={[0, 0, -0.068]}
                    rotation={[Math.PI / 2, 0, 0]}
                  >
                    <cylinderGeometry args={[0.085, 0.115, 0.05, 16]} />
                    <meshStandardMaterial
                      color="#17181C"
                      roughness={0.76}
                      metalness={0.2}
                    />
                  </mesh>

                  {/* Dark Matte Architectural Backing (High Silhouette Contrast Against Gallery Wall) */}
                  <mesh
                    position={[0, 0, -0.032]}
                    rotation={[Math.PI / 2, housingRotZ, 0]}
                  >
                    <cylinderGeometry
                      args={[0.295, 0.315, 0.055, housingSides]}
                    />
                    <meshStandardMaterial
                      color={isSelected ? '#23262E' : '#121316'}
                      emissive={isSelected ? categoryColor : '#000000'}
                      emissiveIntensity={isSelected ? 0.14 : 0}
                      roughness={0.76}
                      metalness={0.18}
                    />
                  </mesh>

                  {/* Inner Chamfered Matte Bezel Step */}
                  <mesh
                    position={[0, 0, -0.004]}
                    rotation={[Math.PI / 2, housingRotZ, 0]}
                  >
                    <cylinderGeometry
                      args={[0.252, 0.275, 0.038, housingSides]}
                    />
                    <meshStandardMaterial
                      color={isSelected ? '#2C303A' : '#181A1E'}
                      roughness={0.66}
                      metalness={0.24}
                    />
                  </mesh>

                  {/* Deep Obsidian Recessed Inner Well */}
                  <mesh position={[0, 0, 0.017]}>
                    <circleGeometry args={[0.215, 32]} />
                    <meshStandardMaterial
                      color="#08090B"
                      roughness={0.92}
                      metalness={0.05}
                    />
                  </mesh>

                  {/* Single Refined Metallic Frame with Rim Separation */}
                  <mesh position={[0, 0, 0.021]}>
                    <ringGeometry
                      args={[0.208, isSelected ? 0.248 : 0.236, 48]}
                    />
                    <meshStandardMaterial
                      color={isSelected ? categoryColor : '#B9A078'}
                      emissive={categoryColor}
                      emissiveIntensity={
                        isSelected ? 0.54 : matchesFilter ? 0.1 : 0.03
                      }
                      roughness={isSelected ? 0.16 : 0.3}
                      metalness={0.78}
                      side={THREE.DoubleSide}
                    />
                  </mesh>

                  {/* Category-Coloured Faceted Centrepiece */}
                  <mesh
                    position={[0, 0, 0.068]}
                    rotation={[0.32 + index * 0.2, index * 0.45, 0]}
                    ref={(el) => {
                      centerpieceRefs.current[entry.id] = el;
                    }}
                  >
                    {entry.type === 'internship' ? (
                      <octahedronGeometry args={[0.132, 0]} />
                    ) : entry.type === 'education' ? (
                      <dodecahedronGeometry args={[0.138, 0]} />
                    ) : entry.type === 'forage' ? (
                      <icosahedronGeometry args={[0.132, 0]} />
                    ) : (
                      <octahedronGeometry args={[0.128, 0]} />
                    )}
                    <meshStandardMaterial
                      color={categoryColor}
                      emissive={categoryColor}
                      emissiveIntensity={
                        isSelected ? 0.54 : matchesFilter ? 0.16 : 0.05
                      }
                      roughness={isSelected ? 0.14 : 0.24}
                      metalness={0.26}
                      flatShading
                    />
                  </mesh>
                </group>
              </group>
            );
          },
        )}
      </group>
    </group>
  );
};

