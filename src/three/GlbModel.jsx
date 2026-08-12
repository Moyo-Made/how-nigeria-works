import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

// The plinth's usable envelope. Models arrive from the image->3D pipeline at
// arbitrary scale, so they are fitted to this rather than trusted.
const MAX_SPAN = 2.6;
const MAX_HEIGHT = 1.9;

export default function GlbModel({ url }) {
  // Self-hosted decoder — a classroom on a slow link should not depend on a CDN.
  const { scene } = useGLTF(url, `${import.meta.env.BASE_URL}draco/`);

  const fitted = useMemo(() => {
    const object = scene.clone(true);
    object.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const scale = Math.min(MAX_SPAN / Math.max(size.x, size.z), MAX_HEIGHT / size.y);

    // Centre on the plinth axis and stand the model on its own base, whatever
    // origin the exporter used.
    const wrapper = new THREE.Group();
    object.position.set(-center.x, -box.min.y, -center.z);
    wrapper.add(object);
    wrapper.scale.setScalar(scale);
    return wrapper;
  }, [scene]);

  return <primitive object={fitted} />;
}
