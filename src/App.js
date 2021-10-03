import "./App.css";
import { Canvas } from "@react-three/fiber";
import { Stats, OrbitControls } from "@react-three/drei";
import Main from "./Components/Main/Main";
import { useState } from "react";

export default function App() {
  const [length, setLength] = useState(1000);
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
        <directionalLight intensity={0.5} position={[0, 20, 20]} />
        {/* <directionalLight intensity={0.5} position={[20, 20, 0]} /> */}
        <Main length={length} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
