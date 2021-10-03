import { useEffect, useMemo, useRef } from "react";
import { Color, Object3D } from "three";

const scratchObject3D = new Object3D();
const scratchColor = new Color();

export const useData = ({ length }) => {
  const meshRef = useRef();
  const colorRef = useRef();
  const colorArray = useMemo(() => new Float32Array(length * 3), [length]);

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
  }, [colorArray, length]);

  return [meshRef, colorRef, colorArray];
};
