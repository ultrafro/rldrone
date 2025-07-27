import { DroneSettings as DroneSettingsType } from "./Drone.model";
import DroneSettings from "./DroneSettings";
import SimpleBarChart from "./SimpleBarChart";
import SimpleChart from "./SimpleChart";
import { TooltipOverlay } from "./TooltipOverlay";
import { useState, useEffect } from "react";

export default function DroneTrainerControlPanel({
  stepsPerUpdate,
  handleStepsChange,
  selectedMetric,
  setSelectedMetric,
  displayData,
  rewardGraph,
  droneSettings,
  setDroneSettings,
  beginTraining,
  trainingHappening,
}: {
  stepsPerUpdate: number;
  handleStepsChange: (steps: number) => void;
  selectedMetric: string;
  setSelectedMetric: (metric: string) => void;
  displayData: { x?: number; y: Record<string, number> }[];
  rewardGraph: { x?: number; y: Record<string, number> }[] | null;
  droneSettings: DroneSettingsType;
  setDroneSettings: (settings: DroneSettingsType) => void;
  beginTraining: () => void;
  trainingHappening: boolean;
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedGraph, setSelectedGraph] = useState("metrics");

  const algorithms = ["REINFORCE", "A2C", "PPO"];

  // Map metric values to tooltip IDs
  const getMetricTooltipId = (metric: string) => {
    const mapping: Record<string, string> = {
      total_reward: "metrics-total-reward",
      loss: "metrics-total-loss",
      policy_loss: "metrics-policy-loss",
      value_loss: "metrics-value-loss",
      entropy_loss: "metrics-entropy-loss",
    };
    return mapping[metric] || `metrics-${metric.replace("_", "-")}`;
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  let sensorData: Record<string, number> | null = null;
  if (rewardGraph) {
    const lastPoint = rewardGraph[rewardGraph.length - 1];
    if (lastPoint) {
      sensorData = {
        left: lastPoint.y.left,
        right: lastPoint.y.right,
        front: lastPoint.y.front,
        back: lastPoint.y.back,
        below: lastPoint.y.below,
        above: lastPoint.y.above,
      };
    }
  }

  if (isMobile) {
    return (
      <>
        {/* Mobile Graph Display - Full Width and Height */}
        <div className="absolute top-4 left-4 right-4 h-60 bg-black bg-opacity-70 text-white p-2 rounded backdrop-blur-md border border-gray-700 flex flex-col">
          {/* Top Bar with Graph Selector and Settings */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-1 overflow-x-auto">
              <button
                onClick={() => setSelectedGraph("metrics")}
                className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors border ${
                  selectedGraph === "metrics"
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-gray-800/50 hover:bg-gray-700/50 border-gray-600 text-gray-300"
                }`}
              >
                Metrics
              </button>
              <button
                onClick={() => setSelectedGraph("reward")}
                className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors border ${
                  selectedGraph === "reward"
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-gray-800/50 hover:bg-gray-700/50 border-gray-600 text-gray-300"
                }`}
              >
                Reward
              </button>
              <button
                onClick={() => setSelectedGraph("sensors")}
                className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors border ${
                  selectedGraph === "sensors"
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-gray-800/50 hover:bg-gray-700/50 border-gray-600 text-gray-300"
                }`}
              >
                Sensors
              </button>
            </div>

            {/* Settings Gear Icon - Inside Graph Box */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-gray-800/50 hover:bg-gray-700/50 text-white p-1.5 rounded border border-gray-600 text-sm"
              >
                ⚙️
              </button>
              {showSettings && (
                <div className="absolute top-8 right-0 bg-black bg-opacity-95 text-white p-3 rounded-lg backdrop-blur-md border border-gray-700 w-64 z-50">
                  <DroneSettings
                    droneSettings={droneSettings}
                    setDroneSettings={setDroneSettings}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Graph Content - Takes Up Remaining Space */}
          <div className="flex-1 flex flex-col">
            {selectedGraph === "metrics" && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="flex-1 bg-gray-800 text-white px-2 py-1 rounded text-xs"
                  >
                    <option value="total_reward">Total Reward</option>
                    <option value="loss">Total Loss</option>
                    <option value="policy_loss">Policy Loss</option>
                    <option value="value_loss">Value Loss</option>
                    <option value="entropy_loss">Entropy Loss</option>
                  </select>
                  <TooltipOverlay tipId={getMetricTooltipId(selectedMetric)} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <SimpleChart
                    data={displayData}
                    whichData={selectedMetric}
                    initialChartMode="average"
                  />
                </div>
              </>
            )}

            {selectedGraph === "reward" && rewardGraph && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xs">Reward Graph</div>
                  <TooltipOverlay tipId="reward-graph" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <SimpleChart
                    data={rewardGraph}
                    whichData="reward"
                    plotType="scatter"
                    initialChartMode="tail"
                  />
                </div>
              </>
            )}

            {selectedGraph === "sensors" && sensorData && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xs">Distance Sensor Data</div>
                  <TooltipOverlay tipId="distance-sensor-graph" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <SimpleBarChart data={sensorData} maxValue={1} title="" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Bottom Controls */}
        <div className="absolute bottom-12 left-4 right-4 space-y-2">
          {/* Speed Scale Slider - One Line */}
          <div className="bg-black bg-opacity-70 text-white p-2 rounded-lg backdrop-blur-md border border-gray-700">
            <div className="flex items-center gap-2">
              <span className="font-medium text-xs whitespace-nowrap">
                Speed:
              </span>
              <input
                type="range"
                min="1"
                max="300"
                step=".001"
                value={stepsPerUpdate}
                onChange={(e) => handleStepsChange(Number(e.target.value))}
                className="flex-1 accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="font-mono bg-gray-800 px-1 py-0.5 rounded text-xs whitespace-nowrap">
                {stepsPerUpdate}
              </span>
            </div>
          </div>

          {/* Algorithm Selection - One Line */}
          <div className="bg-black bg-opacity-70 text-white p-2 rounded-lg backdrop-blur-md border border-gray-700">
            <div className="flex items-center gap-2">
              <span className="font-medium text-xs whitespace-nowrap">
                Algo:
              </span>
              <div className="flex gap-1 flex-1">
                {algorithms.map((algorithm) => (
                  <button
                    key={algorithm}
                    onClick={() => {
                      setDroneSettings({
                        ...droneSettings,
                        algorithm: algorithm as "REINFORCE" | "A2C" | "PPO",
                      });
                    }}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors border ${
                      droneSettings.algorithm === algorithm
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-800/50 hover:bg-gray-700/50 border-gray-600 text-gray-300"
                    }`}
                  >
                    {algorithm}
                  </button>
                ))}
              </div>
              <TooltipOverlay tipId="algorithm-selector" />
            </div>
          </div>

          {/* Big Start Training Button */}
          {!trainingHappening && (
            <button
              onClick={() => {
                handleStepsChange(200);
                beginTraining();
              }}
              className={`w-full px-4 py-3 rounded-lg text-base font-bold transition-colors border-2 ${
                // stepsPerUpdate === 1
                "bg-green-600 hover:bg-green-700 border-green-500 text-white"
                // : "bg-blue-600 hover:bg-blue-700 border-blue-500 text-white"
              }`}
            >
              {"Train from scratch"}
            </button>
          )}
        </div>
      </>
    );
  }

  // Desktop Layout - Vertical graphs on left, controls column on right
  return (
    <>
      {/* Left Column - Three Graphs Vertically Stacked */}
      <div className="absolute top-4 left-4 bottom-4 w-[400px] flex flex-col gap-4">
        {/* Metrics Graph */}
        <div className="flex-1 bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-md border border-gray-700 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-bold text-lg">Metrics</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="flex-1 bg-gray-800 text-white px-3 py-2 rounded text-sm"
            >
              <option value="total_reward">Total Reward</option>
              <option value="loss">Total Loss</option>
              <option value="policy_loss">Policy Loss</option>
              <option value="value_loss">Value Loss</option>
              <option value="entropy_loss">Entropy Loss</option>
            </select>
            <TooltipOverlay tipId={getMetricTooltipId(selectedMetric)} />
          </div>
          <div className="flex-1 overflow-hidden">
            <SimpleChart
              data={displayData}
              whichData={selectedMetric}
              initialChartMode="average"
            />
          </div>
        </div>

        {/* Reward Graph */}
        <div className="flex-1 bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-md border border-gray-700 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-bold text-lg">Reward</h3>
            <TooltipOverlay tipId="reward-graph" />
          </div>
          <div className="flex-1 overflow-hidden">
            {rewardGraph ? (
              <SimpleChart
                data={rewardGraph}
                whichData="reward"
                plotType="scatter"
                initialChartMode="tail"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No reward data yet
              </div>
            )}
          </div>
        </div>

        {/* Sensors Graph */}
        <div className="flex-1 bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-md border border-gray-700 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-bold text-lg">Sensors</h3>
            <TooltipOverlay tipId="distance-sensor-graph" />
          </div>
          <div className="flex-1 overflow-hidden">
            {sensorData ? (
              <SimpleBarChart data={sensorData} maxValue={1} title="" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No sensor data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Controls */}
      <div className="absolute right-4 bottom-4 w-[300px] flex flex-col-reverse gap-4">
        {/* Start Training Button */}
        <div className="bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-md border border-gray-700">
          <h3 className="font-bold text-lg mb-3">Training</h3>
          {!trainingHappening ? (
            <button
              onClick={() => {
                handleStepsChange(200);
                beginTraining();
              }}
              className="w-full px-6 py-4 rounded-lg text-lg font-bold transition-colors border-2 bg-green-600 hover:bg-green-700 border-green-500 text-white"
            >
              Train From Scratch
            </button>
          ) : (
            <div className="w-full px-6 py-4 text-lg font-bold text-green-400 text-center">
              Training Active...
            </div>
          )}
        </div>

        {/* Drone Settings */}
        <div className="bg-black bg-opacity-70 text-white rounded-lg backdrop-blur-md border border-gray-700 relative z-[100]">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full p-4 text-left font-bold flex justify-between items-center text-lg"
          >
            <span>Settings</span>
            <span className="text-xl font-semibold">
              {showSettings ? "▼" : "⚙️"}
            </span>
          </button>
          {showSettings && (
            <div className="absolute bottom-full mb-2 left-0 bg-black bg-opacity-95 text-white p-4 rounded-lg backdrop-blur-md border border-gray-700 w-full z-[9999]">
              <DroneSettings
                droneSettings={droneSettings}
                setDroneSettings={(settings) => {
                  setDroneSettings(settings);
                  beginTraining();
                }}
              />
            </div>
          )}
        </div>

        {/* Time Scale */}
        <div className="bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-md border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-bold text-lg">Time Scale</h3>
            <span className="font-mono bg-gray-800 px-3 py-1 rounded text-lg">
              {stepsPerUpdate}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="300"
            step=".001"
            value={stepsPerUpdate}
            onChange={(e) => handleStepsChange(Number(e.target.value))}
            className="w-full accent-blue-500 h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Algorithm Selection */}
        <div className="bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-md border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-bold text-lg">Algorithm</h3>
            <TooltipOverlay tipId="algorithm-selector" />
          </div>
          <div className="flex flex-col gap-2">
            {algorithms.map((algorithm) => (
              <button
                key={algorithm}
                onClick={() => {
                  setDroneSettings({
                    ...droneSettings,
                    algorithm: algorithm as "REINFORCE" | "A2C" | "PPO",
                  });
                  beginTraining();
                }}
                className={`px-4 py-3 rounded text-sm font-medium transition-colors border ${
                  droneSettings.algorithm === algorithm
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-gray-800/50 hover:bg-gray-700/50 border-gray-600 text-gray-300"
                }`}
              >
                {algorithm}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
