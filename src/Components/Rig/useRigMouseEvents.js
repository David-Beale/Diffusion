import { useRef } from "react";

export const useRigMouseEvents = () => {
  const mouse = useRef([0, 0.5, 100]);

  const onMouseMove = (e) => {
    mouse.current[0] = e.clientX / window.innerWidth - 0.5;
    mouse.current[1] = e.clientY / window.innerHeight;
  };

  const onWheel = (e) => {
    if (e.deltaY < 0) {
      if (mouse.current[2] < 50) return;
      mouse.current[2] *= 0.8;
    } else {
      if (mouse.current[2] > 1000) return;
      mouse.current[2] *= 1.25;
    }
  };

  return [mouse, onMouseMove, onWheel];
};
