import { useState } from "react";
import { type DroneSettings } from "../Drone.model";
import { TooltipOverlay } from "./TooltipOverlay";

export default function DroneSettings({
  droneSettings,
  setDroneSettings,
}: {
  droneSettings: DroneSettings;
  setDroneSettings: (settings: DroneSettings) => void;
}) {
  const [localSettings, setLocalSettings] =
    useState<DroneSettings>(droneSettings);
  const [openSection, setOpenSection] = useState<
    "model" | "training" | "environment" | null
  >("model");
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: keyof DroneSettings, value: any) => {
    const newSettings = { ...localSettings };

    if (typeof value === "number" && isNaN(value)) return;

    if (key === "algorithm") {
      newSettings[key] = value as "REINFORCE" | "A2C" | "PPO";
    } else if (key === "skipHighlights") {
      newSettings[key] = value as boolean;
    } else {
      newSettings[key] = Number(value);
    }

    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const handleConfirm = () => {
    setDroneSettings(localSettings);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setLocalSettings(droneSettings);
    setHasChanges(false);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow max-h-[80vh] overflow-y-auto">
      <div className="space-y-4">
        <button
          type="button"
          onClick={() =>
            setOpenSection(openSection === "model" ? null : "model")
          }
          className={`w-full text-left py-2 px-4 ${openSection === "model" ? "bg-blue-100" : "bg-gray-200"} hover:bg-blue-200 rounded-lg mb-2 flex justify-between items-center`}
        >
          <span className="text-lg font-semibold text-gray-800">Model</span>
          <span className="text-lg font-semibold text-gray-800 pl-2">
            {openSection === "model" ? "▼" : "▶"}
          </span>
        </button>
        {openSection === "model" && (
          <div className="space-y-4 p-4 max-h-[30vh] overflow-y-auto">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">Algorithm</label>
                <TooltipOverlay tipId="setting-algorithm" />
              </div>
              <select
                value={localSettings.algorithm}
                onChange={(e) => handleChange("algorithm", e.target.value)}
                className="p-2 border rounded text-gray-800"
              >
                <option value="REINFORCE">REINFORCE</option>
                <option value="A2C">A2C</option>
                <option value="PPO">PPO</option>
              </select>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">
                  Actor Network Size
                </label>
                <TooltipOverlay tipId="setting-actor-network-size" />
              </div>
              <input
                type="number"
                value={localSettings.actorNetworkSize}
                onChange={(e) =>
                  handleChange("actorNetworkSize", e.target.valueAsNumber)
                }
                min={1}
                className="p-2 border rounded text-gray-800"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">
                  Value Network Size
                </label>
                <TooltipOverlay tipId="setting-value-network-size" />
              </div>
              <input
                type="number"
                value={localSettings.valueNetworkSize}
                onChange={(e) =>
                  handleChange("valueNetworkSize", e.target.valueAsNumber)
                }
                min={1}
                className="p-2 border rounded text-gray-800"
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setOpenSection(openSection === "training" ? null : "training")
          }
          className={`w-full text-left py-2 px-4 ${openSection === "training" ? "bg-blue-100" : "bg-gray-200"} hover:bg-blue-200 rounded-lg mb-2 flex justify-between items-center`}
        >
          <span className="text-lg font-semibold text-gray-800">Training</span>
          <span className="text-lg font-semibold text-gray-800 pl-2">
            {openSection === "training" ? "▼" : "▶"}
          </span>
        </button>
        {openSection === "training" && (
          <div className="space-y-4 p-4 max-h-[30vh] overflow-y-auto">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">
                  Episodes Per Update
                </label>
                <TooltipOverlay tipId="setting-episodes-per-update" />
              </div>
              <input
                type="number"
                value={localSettings.episodesPerUpdate}
                onChange={(e) =>
                  handleChange("episodesPerUpdate", e.target.valueAsNumber)
                }
                min={1}
                className="p-2 border rounded text-gray-800"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">Batch Size</label>
                <TooltipOverlay tipId="setting-batch-size" />
              </div>
              <input
                type="number"
                value={localSettings.batchSize}
                onChange={(e) =>
                  handleChange("batchSize", e.target.valueAsNumber)
                }
                min={1}
                className="p-2 border rounded text-gray-800"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">
                  Number of Batches Per Update
                </label>
                <TooltipOverlay tipId="setting-num-batches-per-update" />
              </div>
              <input
                type="number"
                value={localSettings.numBatchesPerUpdate}
                onChange={(e) =>
                  handleChange("numBatchesPerUpdate", e.target.valueAsNumber)
                }
                min={1}
                className="p-2 border rounded text-gray-800"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">
                  Learning Rate
                </label>
                <TooltipOverlay tipId="setting-learning-rate" />
              </div>
              <input
                type="number"
                value={localSettings.learningRate}
                onChange={(e) =>
                  handleChange("learningRate", e.target.valueAsNumber)
                }
                min={0.0001}
                step={0.0001}
                className="p-2 border rounded text-gray-800"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">
                  Reward Discount (Gamma)
                </label>
                <TooltipOverlay tipId="setting-reward-discount-gamma" />
              </div>
              <input
                type="number"
                value={localSettings.rewardDiscountGamma}
                onChange={(e) =>
                  handleChange("rewardDiscountGamma", e.target.valueAsNumber)
                }
                min={0}
                max={1}
                step={0.01}
                className="p-2 border rounded text-gray-800"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">
                  Policy Coefficient
                </label>
                <TooltipOverlay tipId="setting-policy-coefficient" />
              </div>
              <input
                type="number"
                value={localSettings.policyCoefficient}
                onChange={(e) =>
                  handleChange("policyCoefficient", e.target.valueAsNumber)
                }
                min={0}
                step={0.01}
                className="p-2 border rounded text-gray-800"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">
                  Value Coefficient
                </label>
                <TooltipOverlay tipId="setting-value-coefficient" />
              </div>
              <input
                type="number"
                value={localSettings.valueCoefficient}
                onChange={(e) =>
                  handleChange("valueCoefficient", e.target.valueAsNumber)
                }
                min={0}
                step={0.01}
                className="p-2 border rounded text-gray-800"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">
                  Entropy Coefficient
                </label>
                <TooltipOverlay tipId="setting-entropy-coefficient" />
              </div>
              <input
                type="number"
                value={localSettings.entropyCoefficient}
                onChange={(e) =>
                  handleChange("entropyCoefficient", e.target.valueAsNumber)
                }
                min={0}
                step={0.01}
                className="p-2 border rounded text-gray-800"
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setOpenSection(openSection === "environment" ? null : "environment")
          }
          className={`w-full text-left py-2 px-4 ${openSection === "environment" ? "bg-blue-100" : "bg-gray-200"} hover:bg-blue-200 rounded-lg mb-2 flex justify-between items-center`}
        >
          <span className="text-lg font-semibold text-gray-800">
            Environment
          </span>
          <span className="text-lg font-semibold text-gray-800 pl-2">
            {openSection === "environment" ? "▼" : "▶"}
          </span>
        </button>
        {openSection === "environment" && (
          <div className="space-y-4 p-4 max-h-[30vh] overflow-y-auto">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">
                  Number of Blocks
                </label>
                <TooltipOverlay tipId="setting-number-of-blocks" />
              </div>
              <input
                type="number"
                value={localSettings.numberOfBlocks}
                onChange={(e) =>
                  handleChange("numberOfBlocks", e.target.valueAsNumber)
                }
                min={0}
                className="p-2 border rounded text-gray-800"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">
                  Max Sensor Distance
                </label>
                <TooltipOverlay tipId="setting-max-sensor-distance" />
              </div>
              <input
                type="number"
                value={localSettings.maxSensorDistance}
                onChange={(e) =>
                  handleChange("maxSensorDistance", e.target.valueAsNumber)
                }
                min={0}
                step={0.1}
                className="p-2 border rounded text-gray-800"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">
                  Goal Threshold Distance
                </label>
                <TooltipOverlay tipId="setting-goal-threshold-distance" />
              </div>
              <input
                type="number"
                value={localSettings.goalThresholdDistance}
                onChange={(e) =>
                  handleChange("goalThresholdDistance", e.target.valueAsNumber)
                }
                min={0.01}
                step={0.01}
                className="p-2 border rounded text-gray-800"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">Goal Reward</label>
                <TooltipOverlay tipId="setting-goal-reward" />
              </div>
              <input
                type="number"
                value={localSettings.goalReward}
                onChange={(e) =>
                  handleChange("goalReward", e.target.valueAsNumber)
                }
                step={1}
                className="p-2 border rounded text-gray-800"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">
                  Hit Obstacle Penalty
                </label>
                <TooltipOverlay tipId="setting-hit-obstacle-penalty" />
              </div>
              <input
                type="number"
                value={localSettings.hitObstaclePenalty}
                onChange={(e) =>
                  handleChange("hitObstaclePenalty", e.target.valueAsNumber)
                }
                step={1}
                className="p-2 border rounded text-gray-800"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">
                  Distance Penalty
                </label>
                <TooltipOverlay tipId="setting-distance-penalty" />
              </div>
              <input
                type="number"
                value={localSettings.distancePenalty}
                onChange={(e) =>
                  handleChange("distancePenalty", e.target.valueAsNumber)
                }
                step={0.1}
                className="p-2 border rounded text-gray-800"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">
                  Direction Reward
                </label>
                <TooltipOverlay tipId="setting-direction-reward" />
              </div>
              <input
                type="number"
                value={localSettings.directionReward}
                onChange={(e) =>
                  handleChange("directionReward", e.target.valueAsNumber)
                }
                step={0.1}
                className="p-2 border rounded text-gray-800"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-medium text-gray-700">
                  Proximity Sensor Penalty
                </label>
                <TooltipOverlay tipId="setting-proximity-sensor-penalty" />
              </div>
              <input
                type="number"
                value={localSettings.proximitySensorPenalty}
                onChange={(e) =>
                  handleChange("proximitySensorPenalty", e.target.valueAsNumber)
                }
                step={0.1}
                className="p-2 border rounded text-gray-800"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={localSettings.skipHighlights}
                onChange={(e) =>
                  handleChange("skipHighlights", e.target.checked)
                }
                className="mr-2"
              />
              <label className="font-medium text-gray-700">
                Skip Highlights
              </label>
              <TooltipOverlay
                tipId="setting-skip-highlights"
                className="ml-2"
              />
            </div>
          </div>
        )}
      </div>

      {hasChanges && (
        <div className="sticky bottom-0 bg-white p-4 border-t mt-4 flex justify-end space-x-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Apply Changes
          </button>
        </div>
      )}
    </div>
  );
}
