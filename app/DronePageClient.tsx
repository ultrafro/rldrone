"use client";

import dynamic from "next/dynamic";

// Dynamic import with loading state
const DronePage = dynamic(() => import("./drone/DronePage"), {
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <div className="text-white text-xl">
        Loading Drone Training Simulation...
      </div>
    </div>
  ),
  ssr: false, // Disable SSR since this uses Three.js/WebGL
});

export default function DronePageClient() {
  return <DronePage />;
}
