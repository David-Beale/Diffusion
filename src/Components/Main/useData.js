import { useFrame } from "@react-three/fiber";
import { createRef, useCallback, useEffect, useMemo, useRef } from "react";
import { Color, Object3D } from "three";
const worker = new Worker("./worker/worker.js");

const scratchObject3D = new Object3D();
const scratchColor = new Color();
const color1 = new Color("red");
const color2 = new Color("aqua");
const color3 = new Color("green");

const maxRange = 110;

export const useData = ({ length }) => {
  const meshes = useRef(
    Array.from({ length: 5 }, () => {
      return {
        meshRef: createRef(),
        colorRef: createRef(),
        colorArray: new Float32Array((length / 5) * 3),
      };
    })
  );
  const currentMesh = useRef(0);
  const bufferMeshRef = useRef();
  const bufferColorRef = useRef();
  const bufferColorArray = useMemo(() => new Float32Array(1560), []);
  const index = useRef(1);
  const bufferIndex = useRef(0);
  const boundingDist = useRef(0);
  const finished = useRef(false);
  useEffect(() => {
    meshes.current.forEach((mesh, index) => {
      const { meshRef } = mesh;
      meshRef.current.count = index === 0 ? 1 : 0;
    });

    scratchObject3D.position.set(0, 0, 0);
    scratchObject3D.scale.set(1, 1, 1);
    scratchObject3D.updateMatrix();
    const { meshRef, colorRef, colorArray } =
      meshes.current[currentMesh.current];
    meshRef.current.setMatrixAt(0, scratchObject3D.matrix);
    meshRef.current.instanceMatrix.needsUpdate = true;

    scratchColor.set("red");
    scratchColor.toArray(colorArray, 0);
    colorRef.current.needsUpdate = true;

    worker.postMessage({ message: "start", maxRange });
  }, [length]);

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

      if (dist < 65) {
        scratchColor.lerpColors(color1, color2, dist / 65);
      } else {
        scratchColor.lerpColors(color2, color3, (dist - 65) / 35);
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
    let bufferMatrixIndex = 0;
    let matrixIndex = index.current * 16;
    let bufferColorIndex = 0;
    let colorIndex = index.current * 3;

    for (let i = 0; i < bufferIndex.current; i++) {
      const { meshRef, colorRef, colorArray } =
        meshes.current[currentMesh.current];
      for (let j = 0; j < 16; j++) {
        meshRef.current.instanceMatrix.array[matrixIndex] =
          bufferMeshRef.current.instanceMatrix.array[bufferMatrixIndex];
        bufferMatrixIndex++;
        matrixIndex++;
      }

      for (let i = 0; i < 3; i++) {
        colorArray[colorIndex] = bufferColorArray[bufferColorIndex];
        bufferColorIndex++;
        colorIndex++;
      }

      index.current++;

      if (index.current === 10000) {
        currentMesh.current++;
        colorRef.current.needsUpdate = true;
        meshRef.current.instanceMatrix.needsUpdate = true;
        meshRef.current.count = index.current;
        index.current = 0;
        matrixIndex = 0;
        colorIndex = 0;
        if (currentMesh.current === 5) {
          finished.current = true;
          worker.postMessage({ message: "finished" });
          return;
        }
      }
    }

    const { meshRef, colorRef } = meshes.current[currentMesh.current];

    colorRef.current.needsUpdate = true;
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.count = index.current;
    bufferIndex.current = 0;
  }, [bufferColorArray]);

  useFrame(() => {
    if (finished.current) return;
    if (bufferIndex.current >= 500) transferBufferData();
    worker.postMessage({ message: "ping" });
  });

  return [meshes, bufferMeshRef, bufferColorRef, bufferColorArray];
};
