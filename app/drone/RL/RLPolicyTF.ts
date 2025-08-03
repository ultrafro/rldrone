import * as tf from "@tensorflow/tfjs";

export class RLPolicyTF {
  model: tf.Sequential;

  constructor(
    num_states: number,
    num_actions: number,
    network_size: number,
    initialWeights?: any[] | null
  ) {
    this.model = tf.sequential();

    this.model.add(
      tf.layers.dense({
        units: network_size,
        inputShape: [num_states],
        activation: "relu",
      })
    );
    this.model.add(
      tf.layers.dense({ units: network_size / 2, activation: "relu" })
    );
    this.model.add(
      tf.layers.dense({ units: num_actions, activation: "softmax" })
    );

    // Load weights if provided, otherwise try to load from file
    if (initialWeights) {
      this.loadWeightsFromData(initialWeights);
    }
  }

  saveWeights(): void {
    try {
      const weights = this.model.getWeights();
      const weightsData = weights.map((tensor) => ({
        shape: tensor.shape,
        data: Array.from(tensor.dataSync()),
      }));

      const weightsJson = JSON.stringify(weightsData, null, 2);
      const blob = new Blob([weightsJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "rl-policy-weights.json";
      link.click();
      URL.revokeObjectURL(url);

      console.log("RL Policy weights saved to downloads");
    } catch (error) {
      console.error("Failed to save RL Policy weights:", error);
    }
  }

  loadWeightsFromData(weightsData: any[]): void {
    try {
      const tensors = weightsData.map((weightInfo: any) =>
        tf.tensor(weightInfo.data, weightInfo.shape)
      );
      this.model.setWeights(tensors);
      console.log("RL Policy weights loaded from provided data");
    } catch (error) {
      console.error("Failed to load RL Policy weights from data:", error);
      console.log("Using random initialization");
    }
  }

  async loadWeights(): Promise<void> {
    try {
      const response = await fetch("/drone/rl-policy-weights.json");
      if (!response.ok) {
        console.log(
          "No saved RL Policy weights found, using random initialization"
        );
        return;
      }

      const weightsData = await response.json();
      this.loadWeightsFromData(weightsData);
    } catch (error) {
      console.error("Failed to load RL Policy weights:", error);
      console.log("Using random initialization");
    }
  }

  forwardForInference(x: number[]): number[] {
    const tic = performance.now();
    //define a tensor from the input - add batch dimension
    const x_tensor = tf.tensor2d([x], [1, x.length]);
    //console.log('x tensor generation time: ', performance.now() - tic);

    //run the model
    const output = this.model.predict(x_tensor) as tf.Tensor<tf.Rank>;
    //console.log('model prediction time: ', performance.now() - tic);
    const result = output.dataSync() as unknown as number[];
    //console.log('dataSync time: ', performance.now() - tic);

    x_tensor.dispose();
    output.dispose();

    return result;
  }

  forwardForTraining(x: number[]) {
    // Add batch dimension to match expected input shape
    const x_tensor = tf.tensor2d([x], [1, x.length]);
    const output = this.model.predict(x_tensor) as tf.Tensor<tf.Rank>;
    return output;
  }

  forwardForTrainingBatch(x: number[][]) {
    const x_tensor = tf.tensor2d(x);
    const output = this.model.predict(x_tensor) as tf.Tensor<tf.Rank>;
    return output;
  }
}
