import { VertexColors } from "three";
import { useData } from "./useData";

export default function Main({ length }) {
  const [meshRef, colorRef, colorArray] = useData({
    length,
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, length]}
      frustumCulled={false}
    >
      <sphereBufferGeometry args={[0.9, 16, 16]}>
        <instancedBufferAttribute
          ref={colorRef}
          attachObject={["attributes", "color"]}
          args={[colorArray, 3]}
        />
      </sphereBufferGeometry>

      <meshStandardMaterial
        attach="material"
        vertexColors={VertexColors}
        transparent={true}
        opacity={0.5}
      />
    </instancedMesh>
  );
}
