import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Color, Object3D } from "three";
const worker = new Worker("./worker/worker.js");

const scratchObject3D = new Object3D();
const scratchColor = new Color();
const color1 = new Color("red");
const color2 = new Color("green");
const color3 = new Color("blue");

const maxRange = 110;

export const useData = ({ length }) => {
  const meshRef = useRef();
  const bufferMeshRef = useRef();
  const colorRef = useRef();
  const bufferColorRef = useRef();
  const colorArray = useMemo(() => new Float32Array(length * 3), [length]);
  const bufferColorArray = useMemo(() => new Float32Array(360), []);
  const index = useRef(1);
  const bufferIndex = useRef(0);
  const boundingDist = useRef(0);

  useEffect(() => {
    scratchObject3D.position.set(0, 0, 0);
    scratchObject3D.scale.set(1, 1, 1);
    scratchObject3D.updateMatrix();
    meshRef.current.setMatrixAt(0, scratchObject3D.matrix);
    meshRef.current.instanceMatrix.needsUpdate = true;

    scratchColor.set("red");
    scratchColor.toArray(colorArray, 0);
    colorRef.current.needsUpdate = true;

    worker.postMessage({ message: "start", maxRange });
  }, [colorArray, length]);

  const updateBufferMesh = useCallback(
    (pos, dist) => {
      const { x, y, z } = pos;
      scratchObject3D.position.set(x, y, z);
      scratchObject3D.scale.set(1, 1, 1);
      scratchObject3D.updateMatrix();
      bufferMeshRef.current.setMatrixAt(
        bufferIndex.current,
        scratchObject3D.matrix
      );

      if (dist < 50) {
        scratchColor.lerpColors(color1, color2, dist / 50);
      } else {
        scratchColor.lerpColors(color2, color3, (dist - 50) / 50);
      }
      scratchColor.toArray(bufferColorArray, bufferIndex.current * 3);
      bufferIndex.current++;
    },
    [bufferColorArray]
  );

  useEffect(() => {
    worker.onmessage = (e) => {
      const results = e.data;
      results.forEach((result) => {
        const { pos, dist, maxDist } = result;
        boundingDist.current = maxDist;
        updateBufferMesh(pos, dist);
      });
      bufferColorRef.current.needsUpdate = true;
      bufferMeshRef.current.instanceMatrix.needsUpdate = true;
      bufferMeshRef.current.count = bufferIndex.current;
    };
    return () => {
      worker.postMessage({ message: "finished" });
    };
  }, [updateBufferMesh]);

  const transferBufferData = useCallback(() => {
    let start = index.current * 16;
    let end = start + bufferIndex.current * 16;
    for (let i = start; i < end; i++) {
      meshRef.current.instanceMatrix.array[i] =
        bufferMeshRef.current.instanceMatrix.array[i - start];
    }

    start = index.current * 3;
    end = start + bufferIndex.current * 3;
    for (let i = start; i < end; i++) {
      colorArray[i] = bufferColorArray[i - start];
    }
    colorRef.current.needsUpdate = true;
    meshRef.current.instanceMatrix.needsUpdate = true;
    index.current += bufferIndex.current;
    meshRef.current.count = index.current;
    bufferIndex.current = 0;
  }, [bufferColorArray, colorArray]);

  useFrame(() => {
    if (index.current >= length || boundingDist.current > maxRange) return;
    if (bufferIndex.current >= 100) transferBufferData();
    worker.postMessage({ message: "ping" });
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
