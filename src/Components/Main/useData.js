import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, Object3D } from "three";
import Octree from "./Octree/Octree";
import Sphere from "./Octree/Sphere";
import Walker from "./Walker";
const scratchObject3D = new Object3D();
const scratchColor = new Color();

export const useData = ({ length }) => {
  const meshRef = useRef();
  const colorRef = useRef();
  const colorArray = useMemo(() => new Float32Array(length * 3), [length]);
  const index = useRef(1);
  const w = useRef(new Walker({ start: false, boundingDist: 2 }));
  const boundingDist = useRef(2);
  const tree = useRef(new Octree());
  const range = useRef(new Sphere());

  useEffect(() => {
    for (let i = 0; i < length; i++) {
      scratchObject3D.position.set(0, 0, 0);
      scratchObject3D.scale.set(1, 1, 1);
      scratchObject3D.updateMatrix();
      meshRef.current.setMatrixAt(i, scratchObject3D.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < length; i++) {
      scratchColor.set("green");
      scratchColor.toArray(colorArray, i * 3);
    }
    colorRef.current.needsUpdate = true;

    tree.current.insert(new Walker({ start: true }));
  }, [colorArray, length]);

  useFrame(() => {
    range.current.set(w.current);

    while (!w.current.stuck) {
      w.current.walk();
      if (tree.current.query(range.current)) break;
    }
    const wBoundingDist = w.current.pos.length();
    if (wBoundingDist > boundingDist.current) {
      boundingDist.current = wBoundingDist + 2;
    }
    const { x, y, z } = w.current.pos;
    scratchObject3D.position.set(x, y, z);
    scratchObject3D.scale.set(1, 1, 1);
    scratchObject3D.updateMatrix();
    meshRef.current.setMatrixAt(index.current, scratchObject3D.matrix);

    tree.current.insert(w.current.clone());
    w.current = new Walker({
      start: false,
      boundingDist: boundingDist.current,
    });
    index.current++;

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return [meshRef, colorRef, colorArray];
};
