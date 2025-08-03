import { DroneEnv } from "./DroneEnv";
import { sampleFromProbs } from "./rl.utils";
import {
  computeDiscountedReturns,
  getEntropyOfPolicyTFBatch,
} from "./rl.utils";
import { Gizmo } from "./useGizmos";
import { DroneObstacle, DroneSettings } from "./Drone.model";
import { RLPolicyTF } from "./RLPolicyTF";
import { ValuePolicyTF } from "./ValuePolicyTF";
import * as tf from "@tensorflow/tfjs";

export class DroneTrainer {
  env: DroneEnv;
  policy: any;
  value_network: any;
  optimizer: any;

  policyTF: RLPolicyTF;
  valuePolicyTF: ValuePolicyTF;
  optimizerTF: tf.Optimizer;

  usTFGPUTraining: boolean = true;

  droneSize: number;
  setObstacles: (obstacles: DroneObstacle[]) => void = () => {};
  setDronePosition: (position: { x: number; y: number; z: number }) => void =
    () => {};
  setLossDataUpdate: (lossData: {
    x?: number;
    y: Record<string, number>;
  }) => void = () => {};
  setGoalPosition: (goalPosition: { x: number; y: number; z: number }) => void =
    () => {};
  setDroneSensorValues: (sensorValues: {
    left: number;
    right: number;
    front: number;
    back: number;
    below: number;
    above: number;
  }) => void = () => {};
  setRewardGraphUpdate: (
    rewardGraph: { x?: number; y: Record<string, number> } | null
  ) => void = () => {};
  setUpdatingDisplay: (updating: boolean) => void = () => {};

  algorithm: "REINFORCE" | "A2C" | "PPO" = "A2C";

  gizmos: Record<string, Gizmo> | null = null;

  scale_down_position_features: boolean = false;

  episodes_per_update: number = 3;
  num_epochs: number = 1;
  num_batches: number = 4;
  batch_size: number = 512;
  max_steps_per_episode: number = 5000;
  lr: number = 5e-4;

  gamma: number = 0.8;

  policy_coefficient: number = 1;
  value_coefficient: number = 1;
  entropy_coefficient: number = 0.01;

  show_reward_updates: boolean = true;
  show_loss_updates: boolean = true;

  num_states: number = 9;
  num_actions: number = 7;

  normalize_returns: boolean = true;
  sequential_batching: boolean = false;
  backup_logprobs: boolean = true;

  episode_state: number[][] = [];
  episode_action_indices: number[] = [];
  episode_rewards: number[] = [];
  episode_action_probabilities: number[][] = [];
  episode_count: number = 0;
  episode_returns: number[] = [];
  episode_step_counter: number = 0;

  all_episodes_state: number[][] = [];
  all_episodes_action_indices: number[] = [];
  all_episodes_rewards: number[] = [];
  all_episodes_action_probabilities: number[][] = [];
  all_episodes_returns: number[] = [];
  all_episodes_count: number = 0;
  all_episodes_step_counter: number = 0;

  episode_action_log_probs: any[] = [];
  all_episodes_action_log_probs: any[] = [];

  settings: DroneSettings;

  forceDone: boolean = false;

  constructor(
    settings: DroneSettings,
    droneSize: number,
    setDronePositionCB: (position: { x: number; y: number; z: number }) => void,
    setGoalPositionCB: (goalPosition: {
      x: number;
      y: number;
      z: number;
    }) => void,
    setObstaclesCB: (obstacles: DroneObstacle[]) => void,
    onLossDataUpdateCB: (lossData: {
      x?: number;
      y: Record<string, number>;
    }) => void,
    setDroneSensorValuesCB: (sensorValues: {
      left: number;
      right: number;
      front: number;
      back: number;
      below: number;
      above: number;
    }) => void,
    setRewardGraphUpdateCB: (
      rewardGraph: { x?: number; y: Record<string, number> } | null
    ) => void,
    setUpdatingDisplayCB: (updating: boolean) => void,
    initialPolicyWeights: any[] | null = null,
    initialValueWeights: any[] | null = null
  ) {
    this.settings = settings;

    //assign settings values
    this.algorithm = settings.algorithm;
    this.episodes_per_update = settings.episodesPerUpdate;
    this.num_batches = settings.numBatchesPerUpdate;
    this.batch_size = settings.batchSize;
    this.lr = settings.learningRate;
    this.gamma = settings.rewardDiscountGamma;

    this.policy_coefficient = settings.policyCoefficient;
    this.value_coefficient = settings.valueCoefficient;
    this.entropy_coefficient = settings.entropyCoefficient;

    (window as any).document.addEventListener("keyup", (e: KeyboardEvent) => {
      if (e.key === "f") {
        this.forceDone = true;
      }
    });

    this.droneSize = droneSize;
    this.env = new DroneEnv(droneSize, this.max_steps_per_episode, settings);

    this.policyTF = new RLPolicyTF(
      this.num_states,
      this.num_actions,
      settings.actorNetworkSize,
      initialPolicyWeights
    );
    this.valuePolicyTF = new ValuePolicyTF(
      this.num_states,
      settings.valueNetworkSize,
      initialValueWeights
    );

    //add a window listener for the "k" key
    //when it is pressed, download the model weights of both the value and policy networks
    //using something like: await model.save('downloads://my-model');

    window.addEventListener("keyup", (e: KeyboardEvent) => {
      if (e.key === "k") {
        this.policyTF.saveWeights();
        this.valuePolicyTF.saveWeights();
      }
    });

    // this.optimizer = new t.optim.Adam([...this.policy.parameters(), ...this.value_network.parameters()], this.lr, 0);

    this.optimizerTF = tf.train.adam(this.lr);

    this.setDronePosition = setDronePositionCB;
    this.setGoalPosition = setGoalPositionCB;
    this.setObstacles = setObstaclesCB;
    this.setLossDataUpdate = onLossDataUpdateCB;
    this.setDroneSensorValues = setDroneSensorValuesCB;
    this.setRewardGraphUpdate = setRewardGraphUpdateCB;
    this.setUpdatingDisplay = setUpdatingDisplayCB;

    this.current_state = this.env.reset();
    this.setDronePosition({
      x: this.current_state[0],
      y: this.current_state[1],
      z: this.current_state[2],
    });
    this.setGoalPosition({
      x: this.current_state[3],
      y: this.current_state[4],
      z: this.current_state[5],
    });
    this.setObstacles(this.env.obstacles);
    this.setDroneSensorValues({
      left: this.current_state[3],
      right: this.current_state[4],
      front: this.current_state[5],
      back: this.current_state[6],
      below: this.current_state[7],
      above: this.current_state[8],
    });

    this.setup_dummy_data_so_arrays_dont_change_size();

    this.switchToCPU().then(() => {
      this.tfReady = true;
    });
  }

  tfReady: boolean = false;

  clear_dummy_episode_so_arrays_dont_change_size() {
    this.episode_step_counter = 0;
    const dummy_state = new Array(this.num_states).fill(0);
    for (let i = 0; i < this.max_steps_per_episode; i++) {
      for (let j = 0; j < this.num_states; j++) {
        this.episode_state[i][j] = dummy_state[j];
      }
      this.episode_action_indices[i] = 0;
      this.episode_rewards[i] = 0;
      this.episode_returns[i] = 0;
      for (let j = 0; j < this.num_actions; j++) {
        this.episode_action_probabilities[i][j] = 0;
      }
    }

    if (this.backup_logprobs) {
      this.episode_action_log_probs = [];
    }
  }

  clear_dummy_update_data_so_arrays_dont_change_size() {
    this.all_episodes_step_counter = 0;
    const dummy_state = new Array(this.num_states).fill(0);
    const max_steps = this.max_steps_per_episode * this.episodes_per_update;
    for (let i = 0; i < max_steps; i++) {
      for (let j = 0; j < this.num_states; j++) {
        this.all_episodes_state[i][j] = dummy_state[j];
      }
      for (let j = 0; j < this.num_actions; j++) {
        this.all_episodes_action_probabilities[i][j] = 0;
      }
      this.all_episodes_action_indices[i] = 0;
      this.all_episodes_rewards[i] = 0;
      this.all_episodes_returns[i] = 0;
    }

    if (this.backup_logprobs) {
      this.all_episodes_action_log_probs = [];
    }
  }

  setup_dummy_data_so_arrays_dont_change_size() {
    //number of states per update
    const max_steps = this.max_steps_per_episode * this.episodes_per_update;

    const dummy_state = new Array(this.num_states).fill(0);
    const dummy_action_probabilities = new Array(this.num_actions).fill(0);
    const dummy_action_indices = new Array(this.num_actions).fill(0);

    for (let i = 0; i < this.max_steps_per_episode; i++) {
      this.episode_state.push([...dummy_state]);
      this.episode_action_probabilities.push([...dummy_action_probabilities]);
      this.episode_action_indices.push(0);
      this.episode_rewards.push(0);
      this.episode_returns.push(0);
    }

    for (let i = 0; i < max_steps; i++) {
      this.all_episodes_state.push([...dummy_state]);
      this.all_episodes_action_probabilities.push([
        ...dummy_action_probabilities,
      ]);
      this.all_episodes_action_indices.push(0);
      this.all_episodes_rewards.push(0);
      this.all_episodes_returns.push(0);
    }
  }

  last_update_time: number | null = null;
  speed_up: number = 1;

  //drone position, goal position, drone left sensor, drone right sensor, drone front sensor, drone back sensor, drone below sensor, drone above sensor
  current_state: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  currently_updating: boolean = false;
  update(ts: number, force?: boolean) {
    const now = Date.now();
    const step_size = 1 / 60;

    if (this.last_update_time == null) {
      this.last_update_time = now;
    }

    let delta_time = (now - this.last_update_time) / 1000;

    if (delta_time > step_size || force) {
      this.last_update_time = now;
    } else {
      return;
    }

    if (!this.tfReady) {
      return;
    }

    const num_steps = Math.floor(this.speed_up);

    for (let i = 0; i < num_steps; i++) {
      const updateTic = performance.now();
      this.updateInternal(step_size);
    }
  }

  explosion_start_time: number = 0;
  exploding: boolean = false;
  cancelingExplosion: boolean = false;

  updateInternal(delta_time: number) {
    const position_scale = this.scale_down_position_features
      ? 3 * this.env.container_size
      : 1;

    const now = performance.now();
    if (this.exploding) {
      if (now - this.explosion_start_time > 150 && !this.cancelingExplosion) {
        this.cancelingExplosion = true;

        this.completeEpisode().then(() => {
          this.exploding = false;
          this.cancelingExplosion = false;
          if (this.show_reward_updates) {
            this.setRewardGraphUpdate(null);
          }
        });
      } else {
        return;
      }
    }

    const { action, actionIndex, actionProbabilitiesArray } =
      this.getNextAction(this.current_state);
    const {
      state: newState,
      reward,
      done,
      color,
    } = this.env.step(action, delta_time, position_scale);

    this.episode_state[this.episode_step_counter] = [...this.current_state];
    this.episode_action_indices[this.episode_step_counter] = actionIndex;
    this.episode_rewards[this.episode_step_counter] = reward;
    this.episode_action_probabilities[this.episode_step_counter] =
      actionProbabilitiesArray;
    this.episode_step_counter++;

    if (this.show_reward_updates) {
      this.setRewardGraphUpdate({
        y: {
          reward: reward,
          left: newState[3],
          right: newState[4],
          front: newState[5],
          back: newState[6],
          below: newState[7],
          above: newState[8],
        },
      });
    }

    this.current_state = newState;

    const dronePosition = this.env.getDronePosition();
    const goalPosition = this.env.getGoalPosition();

    if (done || this.forceDone) {
      this.forceDone = false;
      this.exploding = true;
      this.explosion_start_time = performance.now();

      this.last_update_time = null;
      if (this.show_reward_updates) {
        //this.setRewardGraphUpdate(null);
      }

      if (this.gizmos) {
        if (!this.gizmos.explosion) {
          this.gizmos.explosion = {
            name: "explosion",
            type: "grow",
            color: "red",
            alpha: 1,
            latestX: dronePosition.x * position_scale,
            latestY: dronePosition.y * position_scale,
            latestZ: dronePosition.z * position_scale,
            timestamp: performance.now(),
          };
        }

        this.gizmos.explosion.color = color ?? "red";
        this.gizmos.explosion.latestX = dronePosition.x * position_scale;
        this.gizmos.explosion.latestY = dronePosition.y * position_scale;
        this.gizmos.explosion.latestZ = dronePosition.z * position_scale;
        this.gizmos.explosion.timestamp = performance.now();
      }
    }

    //set the droen position to the first 3 numbers of the new state
    this.setDronePosition({
      x: dronePosition.x,
      y: dronePosition.y,
      z: dronePosition.z,
    });
    //set the goal position to the last 3 numbers of the new state
    this.setGoalPosition({
      x: goalPosition.x,
      y: goalPosition.y,
      z: goalPosition.z,
    });

    this.setDroneSensorValues({
      left: newState[3],
      right: newState[4],
      front: newState[5],
      back: newState[6],
      below: newState[7],
      above: newState[8],
    });
  }

  async completeEpisode() {
    const episode_length = this.episode_step_counter;

    let new_episode_returns = computeDiscountedReturns(
      this.episode_rewards.slice(0, this.episode_step_counter),
      this.gamma
    );

    //copy into episode returns
    for (let i = 0; i < new_episode_returns.length; i++) {
      this.episode_returns[i] = new_episode_returns[i];
    }

    // if(this.normalize_returns){
    //     const mean = new_episode_returns.reduce((a, b) => a + b, 0) / new_episode_returns.length;
    //     const std = Math.sqrt(new_episode_returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / new_episode_returns.length) + 1e-8;
    //     new_episode_returns = new_episode_returns.map(r => (r - mean) / std);
    // }

    for (let i = 0; i < episode_length; i++) {
      this.all_episodes_state[this.all_episodes_step_counter + i] = [
        ...this.episode_state[i],
      ];
      this.all_episodes_action_indices[this.all_episodes_step_counter + i] =
        this.episode_action_indices[i];
      this.all_episodes_rewards[this.all_episodes_step_counter + i] =
        this.episode_rewards[i];
      this.all_episodes_returns[this.all_episodes_step_counter + i] =
        new_episode_returns[i];
      this.all_episodes_action_probabilities[
        this.all_episodes_step_counter + i
      ] = [...this.episode_action_probabilities[i]];

      this.all_episodes_action_log_probs.push(this.episode_action_log_probs[i]);
    }

    this.all_episodes_step_counter += episode_length;

    this.clear_dummy_episode_so_arrays_dont_change_size();

    this.episode_step_counter = 0;

    this.episode_count++;

    if (this.episode_count % this.episodes_per_update == 0) {
      this.setUpdatingDisplay(true);
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (this.usTFGPUTraining) {
        await this.switchToGPU();
      }

      const tic = performance.now();
      await this.updatePolicyTF();

      if (this.usTFGPUTraining) {
        const switchToCPUTic = performance.now();
        await this.switchToCPU();
      }

      this.all_episodes_step_counter = 0;
      this.clear_dummy_update_data_so_arrays_dont_change_size();

      this.setUpdatingDisplay(false);
    }

    this.current_state = this.env.reset();

    //set the obstacle positions based on the environment
    this.setObstacles(this.env.obstacles);
  }

  async switchToGPU() {
    await tf.setBackend("webgl");
    await tf.ready();
    // console.log('switched to GPU');
  }
  async switchToCPU() {
    await tf.setBackend("cpu");
    await tf.ready();
    // console.log('switched to CPU');
  }

  getBatchIndices(
    batch_size: number,
    data_length: number,
    sequential_batching?: boolean
  ) {
    if (sequential_batching) {
      const indices = [];
      for (let i = 0; i < batch_size; i++) {
        indices.push(i);
      }
      return indices;
    } else {
      const indices = [];
      for (let i = 0; i < batch_size; i++) {
        indices.push(Math.floor(Math.random() * data_length));
      }
      return indices;
    }
  }

  sample_tensor: any = null;

  async updatePolicyTF() {
    let print_policy_loss = 0;
    let print_value_loss = 0;
    let print_entropy_loss = 0;
    let print_lossTensor = 0;

    const total_reward =
      this.all_episodes_rewards
        .slice(0, this.all_episodes_step_counter)
        .reduce((a, b) => a + b, 0) / this.episodes_per_update;

    for (let batch_n = 0; batch_n < this.num_batches; batch_n++) {
      const {
        state_batch,
        action_indices_batch,
        returns_batch_normalized,
        action_probabilities_batch: rollout_action_probabilities_batch,
      } = this.getBatch(this.batch_size, this.sequential_batching);

      this.optimizerTF.minimize(() => {
        return tf.tidy(() => {
          //declare policy_loss, value_loss, entropy_loss, total_loss as tensors with value 0
          let policy_loss = tf.scalar(0);
          let value_loss = tf.scalar(0);
          let entropy_loss = tf.scalar(0);
          let total_loss = tf.scalar(0);

          let policy_loss_batch = tf.scalar(0);
          let value_loss_batch = tf.scalar(0);
          let entropy_loss_batch = tf.scalar(0);
          let total_loss_batch = tf.scalar(0);

          const action_probabilities_batch =
            this.policyTF.forwardForTrainingBatch(state_batch);
          //get the action probabilities at the action indices
          const action_indices_batch_tensor = tf.tensor1d(
            action_indices_batch,
            "int32"
          );

          // Create one-hot vectors for action indices
          const one_hot = tf.oneHot(
            action_indices_batch_tensor,
            this.num_actions
          ); // shape [512, 7]

          // Element-wise multiply and sum along axis 1 to get selected probabilities
          const probabilities_of_actions_batch = tf.sum(
            tf.mul(action_probabilities_batch, one_hot),
            1
          );

          const last_probabilities_of_actions_batch = tf.sum(
            tf.mul(rollout_action_probabilities_batch, one_hot),
            1
          );

          const entropy_batch = getEntropyOfPolicyTFBatch(
            action_probabilities_batch
          );

          entropy_loss_batch = tf.sum(entropy_batch).squeeze();
          //entropy_loss = entropy_loss.add(entropy_loss_batch);

          const critic_estimated_return_batch =
            this.valuePolicyTF.forwardForTrainingBatch(state_batch);
          const actual_returns_batch_tensor = tf.tensor1d(
            returns_batch_normalized,
            "float32"
          );

          const advantage_batch = actual_returns_batch_tensor.sub(
            critic_estimated_return_batch.squeeze()
          );
          value_loss_batch = tf.sum(tf.pow(advantage_batch, 2)).squeeze();

          if (this.algorithm == "A2C") {
            //get the log probabilities
            const log_prob_batch = tf.log(probabilities_of_actions_batch);
            const frozen_advantage_batch = tf.tidy(() => {
              return advantage_batch.clone();
            });

            policy_loss_batch = policy_loss_batch.add(
              tf
                .sum(tf.mul(log_prob_batch, frozen_advantage_batch).mul(-1))
                .squeeze()
            );
          }

          if (this.algorithm == "REINFORCE") {
            const log_prob_batch = tf.log(probabilities_of_actions_batch);
            policy_loss_batch = policy_loss_batch.add(
              tf
                .sum(
                  tf.mul(log_prob_batch, actual_returns_batch_tensor).mul(-1)
                )
                .squeeze()
            );
          }

          if (this.algorithm == "PPO") {
            const ratio_of_actions_to_last_actions = tf.div(
              probabilities_of_actions_batch,
              last_probabilities_of_actions_batch
            );

            const clipped_ratio_of_actions_to_last_actions = tf.clipByValue(
              ratio_of_actions_to_last_actions,
              1 - this.settings.ppoEpsilon,
              1 + this.settings.ppoEpsilon
            );

            const frozen_advantage_batch = tf.tidy(() => {
              return advantage_batch.clone();
            });

            const ratio_times_advantage = tf.mul(
              ratio_of_actions_to_last_actions,
              frozen_advantage_batch
            );

            const clipped_ratio_times_advantage = tf.mul(
              clipped_ratio_of_actions_to_last_actions,
              frozen_advantage_batch
            );

            const min_ratio_times_advantage = tf.minimum(
              ratio_times_advantage,
              clipped_ratio_times_advantage
            );

            policy_loss_batch = policy_loss_batch.add(
              tf.sum(min_ratio_times_advantage).mul(-1).squeeze()
            );
          }

          if (this.algorithm == "A2C") {
            total_loss_batch = total_loss_batch
              .add(policy_loss_batch.mul(this.policy_coefficient))
              .add(value_loss_batch.mul(this.value_coefficient))
              .add(entropy_loss_batch.mul(this.entropy_coefficient));
          }
          if (this.algorithm == "REINFORCE" || this.algorithm == "PPO") {
            total_loss_batch = total_loss_batch
              .add(policy_loss_batch.mul(this.policy_coefficient))
              .add(entropy_loss_batch.mul(this.entropy_coefficient))
              .add(value_loss_batch.mul(this.value_coefficient));
          }

          print_policy_loss = policy_loss_batch.dataSync()[0];
          print_value_loss = value_loss_batch.dataSync()[0];
          print_entropy_loss = entropy_loss_batch.dataSync()[0];
          print_lossTensor = total_loss_batch.dataSync()[0];

          return total_loss_batch;
        });
      });
    }

    if (this.show_loss_updates) {
      this.setLossDataUpdate({
        y: {
          loss: print_lossTensor,
          policy_loss: print_policy_loss,
          value_loss: print_value_loss,
          entropy_loss: print_entropy_loss,
          total_reward: total_reward,
        },
      });
    }
  }

  getBatch(batch_size: number, sequential_batching: boolean) {
    const data_length = this.all_episodes_step_counter;
    const batch_indices = this.getBatchIndices(
      this.batch_size,
      data_length,
      this.sequential_batching
    );

    const rollout_returns = this.all_episodes_returns.slice(
      0,
      this.all_episodes_step_counter
    );

    const returns_batch: number[] = [];
    for (let bb = 0; bb < this.batch_size; bb++) {
      returns_batch.push(rollout_returns[batch_indices[bb]]);
    }

    //find mean and std
    const mean =
      returns_batch.reduce((a, b) => a + b, 0) / returns_batch.length;
    const std =
      Math.sqrt(
        returns_batch.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
          returns_batch.length
      ) + 1e-8;
    const returns_batch_normalized = returns_batch.map((r) => (r - mean) / std);

    const state_batch: number[][] = [];
    for (let bb = 0; bb < this.batch_size; bb++) {
      state_batch.push(this.all_episodes_state[batch_indices[bb]]);
    }

    const action_indices_batch: number[] = [];
    for (let bb = 0; bb < this.batch_size; bb++) {
      action_indices_batch.push(
        this.all_episodes_action_indices[batch_indices[bb]]
      );
    }

    const action_probabilities_batch: number[][] = [];
    for (let bb = 0; bb < this.batch_size; bb++) {
      action_probabilities_batch.push(
        this.all_episodes_action_probabilities[batch_indices[bb]]
      );
    }

    return {
      state_batch,
      action_indices_batch,
      returns_batch_normalized,
      action_probabilities_batch,
    };
  }

  sampleProbs(state: any) {
    const stateTensor = state;
    const actionProbabilitiesTensor: typeof stateTensor =
      this.policy.forward(stateTensor);
    return actionProbabilitiesTensor;
  }

  // reusable_state_tensor: any = null;
  getNextAction(state: number[]) {
    let actionProbabilitiesArray: number[] = [];
    actionProbabilitiesArray = this.policyTF.forwardForInference(state);

    const actionIndex = sampleFromProbs(actionProbabilitiesArray);

    let x = 0;
    let y = 0;
    let z = 0;
    //7 states: 6 directions + 1 stop
    switch (actionIndex) {
      case 0:
        x = 0;
        y = 0;
        z = 0;
        break;
      case 1:
        x = 1;
        y = 0;
        z = 0;
        break;
      case 2:
        x = -1;
        y = 0;
        z = 0;
        break;
      case 3:
        x = 0;
        y = 1;
        z = 0;
        break;
      case 4:
        x = 0;
        y = -1;
        z = 0;
        break;
      case 5:
        x = 0;
        y = 0;
        z = 1;
        break;
      case 6:
        x = 0;
        y = 0;
        z = -1;
        break;
    }

    return { action: [x, y, z], actionIndex, actionProbabilitiesArray };
  }
}
