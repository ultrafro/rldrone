import * as tf from "@tensorflow/tfjs";

export class ValuePolicyTF {
  model: tf.Sequential;

  constructor(
    num_states: number,
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
    this.model.add(tf.layers.dense({ units: 1, activation: "linear" }));

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
      link.download = "value-policy-weights.json";
      link.click();
      URL.revokeObjectURL(url);

      console.log("Value Policy weights saved to downloads");
    } catch (error) {
      console.error("Failed to save Value Policy weights:", error);
    }
  }

  loadWeightsFromData(weightsData: any[]): void {
    try {
      const tensors = weightsData.map((weightInfo: any) =>
        tf.tensor(weightInfo.data, weightInfo.shape)
      );
      this.model.setWeights(tensors);
      console.log("Value Policy weights loaded from provided data");
    } catch (error) {
      console.error("Failed to load Value Policy weights from data:", error);
      console.log("Using random initialization");
    }
  }

  async loadWeights(): Promise<void> {
    try {
      const response = await fetch("/drone/value-policy-weights.json");
      if (!response.ok) {
        console.log(
          "No saved Value Policy weights found, using random initialization"
        );
        return;
      }

      const weightsData = await response.json();
      this.loadWeightsFromData(weightsData);
    } catch (error) {
      console.error("Failed to load Value Policy weights:", error);
      console.log("Using random initialization");
    }
  }

  async forwardForInference(x: number[]): Promise<number[]> {
    //define a tensor from the input
    const x_tensor = tf.tensor([x]); // Wrap x in array to create shape [1, num_features]

    //run the model
    const output = this.model.predict(x_tensor) as tf.Tensor<tf.Rank>;

    const result = await output.data();

    return result as unknown as number[];
  }

  forwardForTraining(x: number[]) {
    const x_tensor = tf.tensor([x]); // Wrap x in array to create shape [1, num_features]
    const output = this.model.predict(x_tensor) as tf.Tensor<tf.Rank>;
    return output;
  }

  forwardForTrainingBatch(x: number[][]) {
    const x_tensor = tf.tensor2d(x);
    const output = this.model.predict(x_tensor) as tf.Tensor<tf.Rank>;
    return output;
  }
}
