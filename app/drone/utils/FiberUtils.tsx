import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Scene } from "three";
import { useThree } from "@react-three/fiber";
import { RenderCallback } from "@react-three/fiber";

export function Looper({onLoop}: {onLoop: RenderCallback}) {
    useFrame(onLoop);
    return null;
  }
  
  
  export function SceneSetter({setScene}: {setScene: (scene: Scene) => void}) {
    const {scene} = useThree();
  
    useEffect(() => {
      setScene(scene);
    }, [scene, setScene]);
    return <></>;  
  }