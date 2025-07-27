"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import DronePage to prevent SSR issues with Three.js
const DronePage = dynamic(() => import("./DronePage"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      Loading 3D Scene...
    </div>
  ),
});

export default function RLPageWrapper() {
  return (
    <div>
      <DronePage />
    </div>
  );
}
