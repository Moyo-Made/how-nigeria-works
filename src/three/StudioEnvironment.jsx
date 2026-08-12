import { useEffect, useMemo, useState } from "react";
import { createPortal, useThree } from "@react-three/fiber";
import * as THREE from "three";

// drei's <Environment> statically imports the EXR, RGBE and gainmap loaders —
// roughly 200 kB of source — so that it can read an HDR file from disk. This
// scene never loads one: its reflections come entirely from the light panels
// below. Baking them into a cube target by hand keeps the look and drops the
// loaders, fflate included, off the specimen chunk.
function bake(gl, scene, camera, target) {
  const tone = gl.toneMapping;
  gl.toneMapping = THREE.NoToneMapping;
  camera.update(gl, scene);
  gl.toneMapping = tone;
  return target.texture;
}

export default function StudioEnvironment({ resolution = 128, children }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const [virtualScene] = useState(() => new THREE.Scene());

  const [target, camera] = useMemo(() => {
    const t = new THREE.WebGLCubeRenderTarget(resolution, { type: THREE.HalfFloatType });
    t.texture.mapping = THREE.CubeReflectionMapping;
    return [t, new THREE.CubeCamera(0.1, 1000, t)];
  }, [resolution]);

  useEffect(() => {
    // The panels are static, so one bake is enough — but it has to happen after
    // the portal has mounted them, which is why this runs in an effect rather
    // than during render.
    const previous = scene.environment;
    scene.environment = bake(gl, virtualScene, camera, target);
    return () => {
      scene.environment = previous;
    };
  }, [gl, scene, virtualScene, camera, target, children]);

  useEffect(() => () => target.dispose(), [target]);

  return createPortal(children, virtualScene);
}
