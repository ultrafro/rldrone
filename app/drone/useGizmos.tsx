import { useFrame } from "@react-three/fiber";
import { useCallback, useRef } from "react";
import { Mesh, MeshBasicMaterial, Scene, SphereGeometry } from "three";


export type Gizmo = {
    name: string;
    type: "grow"|"trail";
    color: string;
    alpha: number;
    latestX: number;
    latestY: number;
    latestZ: number;
    timestamp: number;
}

export default function useGizmos(scene: Scene|null){
    const gizmos = useRef<Record<string, Gizmo>>({});

    const lastGizmo = useRef<Record<string, {mesh: Mesh, timestamp: number, startTime: number}>>({});

    function createGizmoMesh(){
        //return a red sphere, semi transparent
        const geometry = new SphereGeometry(1, 32, 32);
        const material = new MeshBasicMaterial({color: "red", transparent: true, opacity: 0.5});
        const mesh = new Mesh(geometry, material);
        return mesh;
    }

    const onGizmoLoop = useCallback(()=>{

        if(!scene){
            return;
        }

        for(const gizmoKey in gizmos.current){
            const gizmo = gizmos.current[gizmoKey];
            const lastTimestamp = lastGizmo.current[gizmoKey]?.timestamp ?? 0;
            const currentTimestamp = Math.floor(gizmo.timestamp);

            if(!lastGizmo.current[gizmoKey]){
                const startTime = performance.now();
                lastGizmo.current[gizmoKey] = {mesh: createGizmoMesh(), timestamp: 0, startTime};
                //add the mesh to the scene
                scene.add(lastGizmo.current[gizmoKey].mesh);
            }

            if(currentTimestamp != lastTimestamp){
                lastGizmo.current[gizmoKey].timestamp = currentTimestamp;
            }

            const elapsedTime = performance.now() - lastGizmo.current[gizmoKey].timestamp;



            //put the mesh at the latest position
            lastGizmo.current[gizmoKey].mesh.position.set(gizmo.latestX, gizmo.latestY, gizmo.latestZ);

            //grow the mesh based on the elapsed time
            const duration = 150;
            const scale = Math.min(elapsedTime / duration, 1);
            const overtime = elapsedTime > duration;

            lastGizmo.current[gizmoKey].mesh.scale.set(scale, scale, scale);

            (lastGizmo.current[gizmoKey].mesh.material as MeshBasicMaterial).opacity = gizmo.alpha;
            lastGizmo.current[gizmoKey].mesh.visible = !overtime;

            (lastGizmo.current[gizmoKey].mesh.material as MeshBasicMaterial).color.set(gizmo.color);
            
        }

    }, [scene]);


    return {gizmos, onGizmoLoop};
}