import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, Object3D } from "three";
import Octree from "./Octree/Octree";
import Sphere from "./Octree/Sphere";
import Walker from "./Walker";
const scratchObject3D = new Object3D();
const scratchColor = new Color();
const color1 = new Color("red");
const color2 = new Color("green");
const color3 = new Color("blue");

export const useData = ({ length }) => {
  const meshRef = useRef();
  const colorRef = useRef();
  const colorArray = useMemo(() => new Float32Array(length * 3), [length]);
  const index = useRef(1);
  const w = useRef(new Walker({ start: false, boundingDist: 4 }));
  const boundingDist = useRef(4);
  const tree = useRef(new Octree());
  const range = useRef(new Sphere());

  useEffect(() => {
    scratchObject3D.position.set(0, 0, 0);
    scratchObject3D.scale.set(1, 1, 1);
    scratchObject3D.updateMatrix();
    meshRef.current.setMatrixAt(0, scratchObject3D.matrix);
    meshRef.current.instanceMatrix.needsUpdate = true;

    scratchColor.set("red");
    scratchColor.toArray(colorArray, 0);
    colorRef.current.needsUpdate = true;

    tree.current.insert(new Walker({ start: true }));
  }, [colorArray, length]);

  useFrame(() => {
    if (index.current === length || boundingDist.current > 100) return;
    while (!w.current.stuck) {
      w.current.walk();
      range.current.set(w.current);
      if (tree.current.query(range.current)) break;
    }
    const wDistFromOrigin = w.current.pos.length();
    if (wDistFromOrigin > boundingDist.current) {
      boundingDist.current = wDistFromOrigin + 4;
    }
    const { x, y, z } = w.current.pos;
    scratchObject3D.position.set(x, y, z);
    scratchObject3D.scale.set(1, 1, 1);
    scratchObject3D.updateMatrix();
    meshRef.current.setMatrixAt(index.current, scratchObject3D.matrix);

    if (wDistFromOrigin < 50) {
      scratchColor.lerpColors(color1, color2, wDistFromOrigin / 50);
    } else {
      scratchColor.lerpColors(color2, color3, (wDistFromOrigin - 50) / 50);
    }
    scratchColor.toArray(colorArray, index.current * 3);

    tree.current.insert(w.current.clone());
    w.current.reset(boundingDist.current);
    index.current++;

    colorRef.current.needsUpdate = true;
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.count = index.current;
  });

  return [meshRef, colorRef, colorArray];
};
