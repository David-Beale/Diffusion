import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
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
  const bufferMeshRef = useRef();
  const colorRef = useRef();
  const bufferColorRef = useRef();
  const colorArray = useMemo(() => new Float32Array(length * 3), [length]);
  const bufferColorArray = useMemo(() => new Float32Array(300), []);
  const index = useRef(1);
  const bufferIndex = useRef(0);
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

  const transferBufferData = useCallback(() => {
    for (let i = index.current * 16; i < index.current * 16 + 1600; i++) {
      meshRef.current.instanceMatrix.array[i] =
        bufferMeshRef.current.instanceMatrix.array[i - index.current * 16];
    }
    for (let i = index.current * 3; i < index.current * 3 + 300; i++) {
      colorArray[i] = bufferColorArray[i - index.current * 3];
    }
    colorRef.current.needsUpdate = true;
    meshRef.current.instanceMatrix.needsUpdate = true;
    index.current += 100;
    meshRef.current.count = index.current;
    bufferIndex.current = 0;
  }, [bufferColorArray, colorArray]);

  const runWalker = useCallback(() => {
    while (!w.current.stuck) {
      w.current.walk();
      range.current.set(w.current);
      if (tree.current.query(range.current)) break;
    }
    const wDistFromOrigin = w.current.pos.length();
    if (wDistFromOrigin > boundingDist.current) {
      boundingDist.current = wDistFromOrigin + 4;
    }
    if (wDistFromOrigin < 50) {
      scratchColor.lerpColors(color1, color2, wDistFromOrigin / 50);
    } else {
      scratchColor.lerpColors(color2, color3, (wDistFromOrigin - 50) / 50);
    }
  }, []);

  const updateBufferMesh = useCallback(() => {
    const { x, y, z } = w.current.pos;
    scratchObject3D.position.set(x, y, z);
    scratchObject3D.scale.set(1, 1, 1);
    scratchObject3D.updateMatrix();
    bufferMeshRef.current.setMatrixAt(
      bufferIndex.current,
      scratchObject3D.matrix
    );

    scratchColor.toArray(bufferColorArray, bufferIndex.current * 3);
    bufferIndex.current++;

    bufferColorRef.current.needsUpdate = true;
    bufferMeshRef.current.instanceMatrix.needsUpdate = true;
    bufferMeshRef.current.count = bufferIndex.current;
  }, [bufferColorArray]);

  const updateOctree = useCallback(() => {
    tree.current.insert(w.current.clone());
    w.current.reset(boundingDist.current);
  }, []);

  useFrame(() => {
    if (index.current >= length || boundingDist.current > 100) return;
    if (bufferIndex.current === 100) transferBufferData();

    runWalker();
    updateBufferMesh();
    updateOctree();
  });

  return [
    meshRef,
    colorRef,
    colorArray,
    bufferMeshRef,
    bufferColorRef,
    bufferColorArray,
  ];
};
