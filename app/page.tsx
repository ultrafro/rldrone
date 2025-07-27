import { Metadata } from "next";
import DronePageClient from "./DronePageClient";

// SEO metadata
export const metadata: Metadata = {
  title: "RL Drone - Reinforcement Learning Drone Training Simulation",
  description:
    "Interactive 3D reinforcement learning environment for training autonomous drones. Watch AI agents learn to navigate obstacles in real-time using deep reinforcement learning algorithms.",
  keywords: [
    "reinforcement learning",
    "drone simulation",
    "AI training",
    "machine learning",
    "autonomous navigation",
    "3D visualization",
    "neural networks",
    "obstacle avoidance",
    "policy gradients",
  ],
  authors: [{ name: "Hisham Bedri" }],
  openGraph: {
    title: "RL Drone - AI Drone Training Simulation",
    description:
      "Interactive 3D reinforcement learning environment for training autonomous drones with real-time visualization.",
    type: "website",
    siteName: "RL Drone",
    images: [
      {
        url: "/icon.png",
        width: 1200,
        height: 630,
        alt: "RL Drone - AI Training Simulation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RL Drone - AI Drone Training Simulation",
    description:
      "Interactive 3D reinforcement learning environment for training autonomous drones with real-time visualization.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function Home() {
  return <DronePageClient />;
}
