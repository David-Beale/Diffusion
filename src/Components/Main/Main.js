import { VertexColors } from "three";
import { useData } from "./useData";

const bufferSize = 520;
export default function Main({ length }) {
  const [meshes, bufferMeshRef, bufferColorRef, bufferColorArray] = useData({
    length,
  });

  return (
    <>
      {meshes.current.map(({ meshRef, colorRef, colorArray }, index) => (
        <instancedMesh
          ref={meshRef}
          args={[null, null, length / meshes.current.length]}
          frustumCulled={false}
          key={index}
        >
          <sphereBufferGeometry args={[1, 16, 16]}>
            <instancedBufferAttribute
              ref={colorRef}
              attachObject={["attributes", "color"]}
              args={[colorArray, 3]}
            />
          </sphereBufferGeometry>

          <meshStandardMaterial attach="material" vertexColors={VertexColors} />
        </instancedMesh>
      ))}
      <instancedMesh
        ref={bufferMeshRef}
        args={[null, null, bufferSize]}
        frustumCulled={false}
      >
        <sphereBufferGeometry args={[1, 16, 16]}>
          <instancedBufferAttribute
            ref={bufferColorRef}
            attachObject={["attributes", "color"]}
            args={[bufferColorArray, 3]}
          />
        </sphereBufferGeometry>

        <meshStandardMaterial attach="material" vertexColors={VertexColors} />
      </instancedMesh>
    </>
  );
}
