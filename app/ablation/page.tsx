import { Metadata } from "next";
import AblationPageClient from "./AblationPageClient";

export const metadata: Metadata = {
  title: "Ablation Study - RL Drone Parameter Testing",
  description: "Headless ablation testing of drone reinforcement learning parameters",
};

export default function AblationPage() {
  return <AblationPageClient />;
}