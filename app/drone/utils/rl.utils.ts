import * as tf from "@tensorflow/tfjs";

export function sampleFromProbs(probs: number[]) {
  const total = probs.reduce((a, b) => a + b, 0);
  const random = Math.random();
  let cumulative = 0;
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i];
    if (random < cumulative) {
      return i;
    }
  }
  return probs.length - 1;
}

export function computeDiscountedReturns(rewards: number[], gamma?: number) {
  const returns = [];
  let R = 0;
  for (let i = rewards.length - 1; i >= 0; i--) {
    R = rewards[i] + (gamma ?? 0.99) * R;
    returns.unshift(R);
  }
  return returns;
}

export function getMeanAndStd(values: number[]) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(
    values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
  );
  return { mean, std };
}

export function getEntropyOfPolicyTFBatch(actionProbabilitiesTensor: any) {
  return tf.tidy(() => {
    const safe_action_probabilities_tensor = actionProbabilitiesTensor.add(
      tf.scalar(1e-8)
    );
    const entropy = tf
      .mul(
        safe_action_probabilities_tensor,
        tf.log(safe_action_probabilities_tensor)
      )
      .sum(1)
      .mul(tf.scalar(-1));
    return entropy;
  });
}

export function getEntropyOfPolicyTF(actionProbabilitiesTensor: any) {
  return tf.tidy(() => {
    // Ensure we are working with 1D tensor
    const probs = actionProbabilitiesTensor.squeeze(); // shape: [num_actions]

    // Avoid log(0) by adding a small epsilon
    const epsilon = tf.scalar(1e-8);
    const safeProbs = probs.add(epsilon);

    const logProbs = tf.log(safeProbs);
    const entropy = tf.mul(probs, logProbs).sum().mul(tf.scalar(-1));

    return entropy;
  });
}

export function getMeanAndStdOf2DArray(values: number[][]): {
  mean: number;
  std: number;
} {
  const values_vector: number[] = [];
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[i].length; j++) {
      values_vector.push(values[i][j]);
    }
  }

  let mean = 0;
  for (let i = 0; i < values_vector.length; i++) {
    mean += values_vector[i];
  }
  mean /= values_vector.length;

  let std = 0;
  for (let i = 0; i < values_vector.length; i++) {
    std += (values_vector[i] - mean) ** 2;
  }
  std = Math.sqrt(std / values_vector.length);

  return { mean, std };
}
