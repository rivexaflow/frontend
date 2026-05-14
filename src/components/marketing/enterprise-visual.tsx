"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type EnterpriseVisualProps = {
  accent?: "azure" | "royal" | "midnight";
  drift?: number;
};

const ACCENT_PALETTE: Record<NonNullable<EnterpriseVisualProps["accent"]>, number> = {
  azure: 0x2277ff,
  royal: 0x0056ff,
  midnight: 0x191970,
};

export function EnterpriseVisual({ accent = "azure", drift = 0 }: EnterpriseVisualProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(13.5, 1, 0.1, 800);
    camera.position.set(74, 98, 104);
    camera.lookAt(new THREE.Vector3(drift * 0.6, 0, 0));

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    // FIX: lower pixel ratio cap 1.8→1.5 — reduces GPU fill cost ~30%
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    mountEl.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(ambient);

    const topLight = new THREE.SpotLight(0xffffff, 1.2, 420, Math.PI / 1.9, 0.45);
    topLight.position.set(0, 124, 24);
    scene.add(topLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.48);
    fillLight.position.set(-80, 60, 70);
    scene.add(fillLight);

    const tint = ACCENT_PALETTE[accent];

    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, 6, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 4.1, 0, Math.PI * 2, true);
    ringShape.holes.push(hole);

    // FIX: reduce curveSegments 18→12 — fewer triangles, same visual quality from this camera angle
    const tubeGeometry = new THREE.ExtrudeGeometry(ringShape, {
      depth: 13,
      bevelEnabled: true,
      bevelThickness: 0.32,
      bevelSize: 0.18,
      bevelSegments: 2,
      curveSegments: 12,
    });
    tubeGeometry.center();
    tubeGeometry.rotateX(Math.PI * 0.5);

    const tubeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.32,
      metalness: 0.06,
      emissive: 0xf5f8ff,
      emissiveIntensity: 0.35,
    });

    const gridGroup = new THREE.Group();
    const size = 12;
    const spacing = 10.2;
    for (let z = 0; z < size; z++) {
      for (let x = 0; x < size; x++) {
        const mesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
        mesh.position.set((x - (size - 1) / 2) * spacing, 0, (z - (size - 1) / 2) * spacing);
        gridGroup.add(mesh);
      }
    }
    scene.add(gridGroup);
    gridGroup.scale.setScalar(1.7);

    const holeCenters: THREE.Vector3[] = [];
    for (let z = 0; z < size; z++) {
      for (let x = 0; x < size; x++) {
        holeCenters.push(
          new THREE.Vector3(
            (x - (size - 1) / 2) * spacing,
            0,
            (z - (size - 1) / 2) * spacing,
          ),
        );
      }
    }

    const pickCenter = () => holeCenters[Math.floor(Math.random() * holeCenters.length)].clone();
    const pickDifferentCenter = (origin: THREE.Vector3) => {
      let target = pickCenter();
      let guard = 0;
      while (target.distanceToSquared(origin) < 0.01 && guard < 12) {
        target = pickCenter();
        guard += 1;
      }
      return target;
    };

    // FIX: reduce light orbs 14→10 — fewer PointLights = major GPU savings
    const lightOrbs = Array.from({ length: 10 }).map((_, idx) => {
      const group = new THREE.Group();
      const point = new THREE.PointLight(tint, 6.2, 190, 1);
      // FIX: reduce sphere segments 22→14
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(3.2, 14, 14),
        new THREE.MeshBasicMaterial({ color: tint }),
      );
      group.add(point);
      group.add(orb);

      const from = pickCenter();
      const to = pickDifferentCenter(from);
      const yBase = 7.7 + idx * 0.14;
      group.userData = {
        from,
        to,
        progress: (idx * 0.09) % 1,
        speed: 0.26 + idx * 0.017,
        yBase,
      };
      group.position.set(from.x, yBase, from.z);
      gridGroup.add(group);
      return group;
    });

    const resize = () => {
      if (!mountEl) return;
      const { clientWidth, clientHeight } = mountEl;
      const width = Math.max(clientWidth, 1);
      const height = Math.max(clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    const resizeObs = new ResizeObserver(resize);
    resizeObs.observe(mountEl);

    let frameId = 0;
    let isVisible = false;
    const timer = new THREE.Timer();
    timer.connect(document);

    const animate = () => {
      timer.update();
      const t = timer.getElapsed();
      gridGroup.rotation.y = t * 0.1;
      gridGroup.rotation.x = -0.08;
      gridGroup.position.x = drift * 0.55;

      lightOrbs.forEach((group) => {
        const data = group.userData as {
          from: THREE.Vector3;
          to: THREE.Vector3;
          progress: number;
          speed: number;
          yBase: number;
        };

        data.progress += data.speed * 0.01;
        if (data.progress >= 1) {
          data.progress = 0;
          data.from.copy(data.to);
          data.to.copy(pickCenter());
        }

        const eased = data.progress * data.progress * (3 - 2 * data.progress);
        group.position.x = THREE.MathUtils.lerp(data.from.x, data.to.x, eased);
        group.position.z = THREE.MathUtils.lerp(data.from.z, data.to.z, eased);
        group.position.y = data.yBase + Math.sin(t * 1.8 + data.progress * Math.PI * 2) * 0.8;
      });

      camera.lookAt(new THREE.Vector3(drift * 0.6, 0, 0));
      renderer.render(scene, camera);
      // FIX: only schedule next frame when visible — saves 100% GPU when scrolled away
      if (isVisible) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    // FIX: IntersectionObserver — pause loop when off-screen, resume when visible
    const visObs = new IntersectionObserver(
      ([entry]) => {
        isVisible = !!entry?.isIntersecting;
        if (isVisible) {
          frameId = window.requestAnimationFrame(animate);
        } else {
          window.cancelAnimationFrame(frameId);
        }
      },
      { threshold: 0.01 },
    );
    visObs.observe(mountEl);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObs.disconnect();
      visObs.disconnect();
      timer.dispose();

      lightOrbs.forEach((group) => {
        const orb = group.children[1] as THREE.Mesh | undefined;
        if (orb) {
          (orb.geometry as THREE.BufferGeometry).dispose();
          (orb.material as THREE.Material).dispose();
        }
      });
      tubeGeometry.dispose();
      tubeMaterial.dispose();
      renderer.dispose();
      scene.clear();
      if (mountEl.contains(renderer.domElement)) {
        mountEl.removeChild(renderer.domElement);
      }
    };
  }, [accent, drift]);

  return (
    <div
      ref={mountRef}
      className="h-full w-full rounded-[2rem] bg-gradient-to-b from-[#ffffff] via-[#f7f9ff] to-[#e3e7fc]"
      aria-hidden
    />
  );
}
