export interface TooltipTip {
  id: string;
  title: string;
  content: string;
}

export const tooltipTips: Record<string, TooltipTip> = {
  // Metrics graph selections (top left)
  "metrics-total-reward": {
    id: "metrics-total-reward",
    title: "Reward per Episode",
    content:
      "This shows the total reward received by the drone in each episode during training. A higher value indicates better performance.",
  },
  "metrics-total-loss": {
    id: "metrics-total-loss",
    title: "Total Loss",
    content:
      "This is the total loss calculated during training. It is the sum of the policy-loss, value-loss, and entropy-loss. Note that in Actor-Critic methdos, the total loss is not expected to strictly decrease over time.",
  },
  "metrics-policy-loss": {
    id: "metrics-policy-loss",
    title: "Policy Loss",
    content:
      "This represents the loss. Depending on the algorithm, it is the negative log probability of the action taken, or the advantage-weighted regression loss. It measures how well the policy is performing in achieving rewards",
  },
  "metrics-value-loss": {
    id: "metrics-value-loss",
    title: "Value Loss",
    content:
      "This represents the 'Critic's' loss. It measures how well the value network is predicting future rewards.",
  },
  "metrics-entropy-loss": {
    id: "metrics-entropy-loss",
    title: "Entropy Loss",
    content:
      "This represents the entropy loss. It encourages exploration by preventing the policy from becoming too deterministic.",
  },

  // Reward graph
  "reward-graph": {
    id: "reward-graph",
    title: "Reward Graph",
    content: "Live graph of reward during the episode.",
  },

  // Distance sensor graph
  "distance-sensor-graph": {
    id: "distance-sensor-graph",
    title: "Distance Sensor Data",
    content:
      "Values of distance sensors around the drone. The valeus are normalized so that 1 is closest, and 0 is furthest.",
  },

  // Algorithm selector
  "algorithm-selector": {
    id: "algorithm-selector",
    title: "Algorithm Selection",
    content:
      "Select an RL algorithm: REINFORCE, A2C, or PPO. A2C and PPO are actor-critic methods that use both a policy and a value network. REINFORCE is a simpler policy gradient method.",
  },

  // Drone settings - Model section
  "setting-algorithm": {
    id: "setting-algorithm",
    title: "Algorithm",
    content:
      "REINFORCE, A2C, or PPO. A2C and PPO are actor-critic methods that use both a policy and a value network. REINFORCE is a simpler policy gradient method.",
  },
  "setting-actor-network-size": {
    id: "setting-actor-network-size",
    title: "Actor Network Size",
    content:
      "How large the actor (policy) neural network should be. The number of hidden units in the policy neural network. Note that it is 2-layered",
  },
  "setting-value-network-size": {
    id: "setting-value-network-size",
    title: "Value Network Size",
    content:
      "How large the value neural network should be. The number of hidden units in the value neural network.",
  },

  // Drone settings - Training section
  "setting-episodes-per-update": {
    id: "setting-episodes-per-update",
    title: "Episodes Per Update",
    content: "Number of episodes to record before updating weights",
  },
  "setting-batch-size": {
    id: "setting-batch-size",
    title: "Batch Size",
    content: "Batch size for each weight update",
  },
  "setting-num-batches-per-update": {
    id: "setting-num-batches-per-update",
    title: "Number of Batches Per Update",
    content: "Number of batch updates to do per roll-out of episodes.",
  },
  "setting-learning-rate": {
    id: "setting-learning-rate",
    title: "Learning Rate",
    content: "Learning rate for the optimizer.",
  },
  "setting-reward-discount-gamma": {
    id: "setting-reward-discount-gamma",
    title: "Reward Discount (Gamma)",
    content:
      " How much to value future rewards versus immediate rewards (0-1).",
  },
  "setting-policy-coefficient": {
    id: "setting-policy-coefficient",
    title: "Policy Coefficient",
    content: "How much to value policy performance",
  },
  "setting-value-coefficient": {
    id: "setting-value-coefficient",
    title: "Value Coefficient",
    content: "How much to value the critic's performance.",
  },
  "setting-entropy-coefficient": {
    id: "setting-entropy-coefficient",
    title: "Entropy Coefficient",
    content: "How much to value exploration versus exploitation.",
  },

  // Drone settings - Environment section
  "setting-number-of-blocks": {
    id: "setting-number-of-blocks",
    title: "Number of Blocks",
    content: "How many obstacle blocks to place in the environment.",
  },
  "setting-max-sensor-distance": {
    id: "setting-max-sensor-distance",
    title: "Max Sensor Distance",
    content: "The maximum distance the drone's sensors can detect obstacles.",
  },
  "setting-goal-threshold-distance": {
    id: "setting-goal-threshold-distance",
    title: "Goal Threshold Distance",
    content:
      "How close the drone needs to get to the goal to be considered successful.",
  },
  "setting-goal-reward": {
    id: "setting-goal-reward",
    title: "Goal Reward",
    content: "The positive reward given when the drone reaches the goal.",
  },
  "setting-hit-obstacle-penalty": {
    id: "setting-hit-obstacle-penalty",
    title: "Hit Obstacle Penalty",
    content:
      "The negative reward (penalty) when the drone collides with an obstacle.",
  },
  "setting-distance-penalty": {
    id: "setting-distance-penalty",
    title: "Distance Penalty",
    content: "A penalty based on how far the drone is from the goal.",
  },
  "setting-direction-reward": {
    id: "setting-direction-reward",
    title: "Direction Reward",
    content: "A reward for moving in the correct direction toward the goal.",
  },
  "setting-proximity-sensor-penalty": {
    id: "setting-proximity-sensor-penalty",
    title: "Proximity Sensor Penalty",
    content: "A penalty when the drone gets too close to obstacles.",
  },
  "setting-skip-highlights": {
    id: "setting-skip-highlights",
    title: "Skip Highlights",
    content:
      "Whether to skip visual highlights during training for better performance.",
  },
};
