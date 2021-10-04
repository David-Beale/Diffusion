import "./App.css";
import { Canvas } from "@react-three/fiber";
import { Stats, OrbitControls, Sky, Stars } from "@react-three/drei";
import Main from "./Components/Main/Main";
import { useState } from "react";

export default function App() {
  const [length, setLength] = useState(100000);
  return (
    <div className="container">
      <Canvas
        camera={{
          position: [0, 0, 100],
          fov: 40,
          far: 100000,
        }}
      >
        <Stats className="stats" />
        <ambientLight intensity={0.5} />
        <directionalLight intensity={0.5} position={[-20, 20, 0]} />
        <directionalLight intensity={0.5} position={[20, 20, 0]} />
        <Main length={length} />
        <OrbitControls />
        <Sky
          position={[0, 1, 0]}
          mieCoefficient={0.001}
          inclination={1}
          azimuth={0}
          rayleigh={0.01}
          distance={10000}
        />
        <Stars radius={10000} count={1000} factor={500} fade />
      </Canvas>
    </div>
  );
}
