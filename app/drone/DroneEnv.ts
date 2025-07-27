import { directions, DroneObstacle, DroneSettings } from "./Drone.model";
import { Vector3 } from "three";

export class DroneEnv {
  droneSize: number;
  max_steps_per_episode: number;

  settings: DroneSettings;

  constructor(
    droneSize: number,
    max_steps_per_episode: number,
    settings: DroneSettings
  ) {
    this.droneSize = droneSize;
    this.max_steps_per_episode = max_steps_per_episode;
    this.settings = settings;
  }

  obstacles: DroneObstacle[] = [];
  goal: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  drone: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  drone_sensor_left: number = 0;
  drone_sensor_right: number = 0;
  drone_sensor_front: number = 0;
  drone_sensor_back: number = 0;
  drone_sensor_below: number = 0;
  drone_sensor_above: number = 0;

  container_size: number = 30;

  episode_start_time: number = 0;
  speed: number = 1;

  last_drone_position: { x: number; y: number; z: number } = {
    x: 0,
    y: 0,
    z: 0,
  };
  last_drone_sensor_left: number = 0;
  last_drone_sensor_right: number = 0;
  last_drone_sensor_front: number = 0;
  last_drone_sensor_back: number = 0;
  last_drone_sensor_below: number = 0;
  last_drone_sensor_above: number = 0;

  isFirstStep: boolean = true;
  step_counter: number = 0;

  start_distance_to_goal: number = 0;

  getDronePosition() {
    return this.drone;
  }
  getGoalPosition() {
    return this.goal;
  }

  step(action: number[], delta_time: number, position_scale: number) {
    this.step_counter++;
    this.episode_start_time += delta_time;

    //action is [x,y,z]
    this.drone.x += action[0] * delta_time * this.speed;
    this.drone.y += action[1] * delta_time * this.speed;
    this.drone.z += action[2] * delta_time * this.speed;

    this.update_drone_sensor_readings();

    const dronePositionVector = new Vector3(
      this.drone.x,
      this.drone.y,
      this.drone.z
    );
    const goalPositionVector = new Vector3(
      this.goal.x,
      this.goal.y,
      this.goal.z
    );
    const droneToGoalVector = goalPositionVector
      .clone()
      .sub(dronePositionVector)
      .normalize();

    const newState = [
      droneToGoalVector.x,
      droneToGoalVector.y,
      droneToGoalVector.z,
      this.drone_sensor_left,
      this.drone_sensor_right,
      this.drone_sensor_front,
      this.drone_sensor_back,
      this.drone_sensor_below,
      this.drone_sensor_above,
    ];

    if (this.isFirstStep) {
      this.isFirstStep = false;
      this.last_drone_position = {
        x: this.drone.x,
        y: this.drone.y,
        z: this.drone.z,
      };
      this.last_drone_sensor_left = this.drone_sensor_left;
      this.last_drone_sensor_right = this.drone_sensor_right;
      this.last_drone_sensor_front = this.drone_sensor_front;
      this.last_drone_sensor_back = this.drone_sensor_back;
      this.last_drone_sensor_below = this.drone_sensor_below;
      this.last_drone_sensor_above = this.drone_sensor_above;
    }

    //calculate if the drone got closer to the goal
    const distance_to_goal = Math.sqrt(
      (this.drone.x - this.goal.x) ** 2 +
        (this.drone.y - this.goal.y) ** 2 +
        (this.drone.z - this.goal.z) ** 2
    );
    const last_distance_to_goal = Math.sqrt(
      (this.last_drone_position.x - this.goal.x) ** 2 +
        (this.last_drone_position.y - this.goal.y) ** 2 +
        (this.last_drone_position.z - this.goal.z) ** 2
    );

    const step_size = this.speed * delta_time;

    const getting_closer_to_goal =
      (last_distance_to_goal - distance_to_goal) / step_size;

    const sensor_increase_right_raw =
      this.drone_sensor_right - this.last_drone_sensor_right;
    const sensor_increase_left_raw =
      this.drone_sensor_left - this.last_drone_sensor_left;
    const sensor_increase_front_raw =
      this.drone_sensor_front - this.last_drone_sensor_front;
    const sensor_increase_back_raw =
      this.drone_sensor_back - this.last_drone_sensor_back;
    const sensor_increase_below_raw =
      this.drone_sensor_below - this.last_drone_sensor_below;
    const sensor_increase_above_raw =
      this.drone_sensor_above - this.last_drone_sensor_above;

    const max_possible_sensor_increase =
      step_size / this.settings.maxSensorDistance;

    const sensor_increase_right =
      sensor_increase_right_raw / max_possible_sensor_increase;
    const sensor_increase_left =
      sensor_increase_left_raw / max_possible_sensor_increase;
    const sensor_increase_front =
      sensor_increase_front_raw / max_possible_sensor_increase;
    const sensor_increase_back =
      sensor_increase_back_raw / max_possible_sensor_increase;
    const sensor_increase_below =
      sensor_increase_below_raw / max_possible_sensor_increase;
    const sensor_increase_above =
      sensor_increase_above_raw / max_possible_sensor_increase;

    const sensor_increase =
      sensor_increase_right +
      sensor_increase_left +
      sensor_increase_front +
      sensor_increase_back +
      sensor_increase_below +
      sensor_increase_above;
    const sensor_increase_clipped =
      Math.max(0, sensor_increase_right) +
      Math.max(0, sensor_increase_left) +
      Math.max(0, sensor_increase_front) +
      Math.max(0, sensor_increase_back) +
      Math.max(0, sensor_increase_below) +
      Math.max(0, sensor_increase_above);

    const max_sensor_value = Math.max(
      this.drone_sensor_left,
      this.drone_sensor_right,
      this.drone_sensor_front,
      this.drone_sensor_back,
      this.drone_sensor_below,
      this.drone_sensor_above
    );

    //assign previous values
    this.last_drone_position = {
      x: this.drone.x,
      y: this.drone.y,
      z: this.drone.z,
    };
    this.last_drone_sensor_left = this.drone_sensor_left;
    this.last_drone_sensor_right = this.drone_sensor_right;
    this.last_drone_sensor_front = this.drone_sensor_front;
    this.last_drone_sensor_back = this.drone_sensor_back;
    this.last_drone_sensor_below = this.drone_sensor_below;
    this.last_drone_sensor_above = this.drone_sensor_above;

    //explode is true if any sensor readings is greater than 0.99
    const explode = this.didCrash(this.drone.x, this.drone.y, this.drone.z);
    // const explode = this.drone_sensor_left > 0.99 || this.drone_sensor_right > 0.99 || this.drone_sensor_front > 0.99 || this.drone_sensor_back > 0.99 || this.drone_sensor_below > 0.99 || this.drone_sensor_above > 0.99;

    const thresh = 0.99;
    const hitTopWall = this.drone.y > (this.container_size / 2) * thresh;
    const hitBottomWall = this.drone.y < (-this.container_size / 2) * thresh;
    const hitLeftWall = this.drone.x < (-this.container_size / 2) * thresh;
    const hitRightWall = this.drone.x > (this.container_size / 2) * thresh;
    const hitFrontWall = this.drone.z < (-this.container_size / 2) * thresh;
    const hitBackWall = this.drone.z > (this.container_size / 2) * thresh;

    const explode_because_of_edge_walls =
      explode &&
      (hitTopWall ||
        hitBottomWall ||
        hitLeftWall ||
        hitRightWall ||
        hitFrontWall ||
        hitBackWall);

    const reached_goal =
      Math.sqrt(
        (this.drone.x - this.goal.x) ** 2 +
          (this.drone.y - this.goal.y) ** 2 +
          (this.drone.z - this.goal.z) ** 2
      ) < this.settings.goalThresholdDistance;

    if (reached_goal) {
      return {
        state: newState,
        reward: this.settings.goalReward,
        done: true,
        color: "green",
      };
    }

    if (explode && !explode_because_of_edge_walls) {
      return {
        state: newState,
        reward: this.settings.hitObstaclePenalty,
        done: true,
        color: "red",
      };
    }

    const step_x = action[0];
    const step_y = action[1];
    const step_z = action[2];

    const step_vector_length = Math.sqrt(
      step_x ** 2 + step_y ** 2 + step_z ** 2
    );

    let dot = 0;
    if (step_vector_length > 0) {
      const step_vector_normalized = {
        x: step_x / step_vector_length,
        y: step_y / step_vector_length,
        z: step_z / step_vector_length,
      };
      const lastDronePositionToGoal = {
        x: this.goal.x - this.last_drone_position.x,
        y: this.goal.y - this.last_drone_position.y,
        z: this.goal.z - this.last_drone_position.z,
      };
      const lastDronePositionToGoalLength = Math.sqrt(
        lastDronePositionToGoal.x ** 2 +
          lastDronePositionToGoal.y ** 2 +
          lastDronePositionToGoal.z ** 2
      );
      dot =
        (step_vector_normalized.x * lastDronePositionToGoal.x) /
          lastDronePositionToGoalLength +
        (step_vector_normalized.y * lastDronePositionToGoal.y) /
          lastDronePositionToGoalLength +
        (step_vector_normalized.z * lastDronePositionToGoal.z) /
          lastDronePositionToGoalLength;
    }

    const max_distance = this.start_distance_to_goal;

    const sensor_total =
      this.drone_sensor_left +
      this.drone_sensor_right +
      this.drone_sensor_front +
      this.drone_sensor_back +
      this.drone_sensor_below +
      this.drone_sensor_above;

    const reward =
      (this.settings.distancePenalty * distance_to_goal) / max_distance +
      this.settings.directionReward * getting_closer_to_goal +
      this.settings.proximitySensorPenalty * sensor_increase;

    let color = "#ddddff";
    if (explode && explode_because_of_edge_walls) {
      color = "yellow";
    }
    if (explode && !explode_because_of_edge_walls) {
      color = "red";
    }
    if (reached_goal) {
      color = "green";
    }

    const hitWall = explode && explode_because_of_edge_walls;

    return {
      state: newState,
      reward: hitWall ? this.settings.hitObstaclePenalty : reward,
      done: this.step_counter >= this.max_steps_per_episode || hitWall,
      color: color,
    };
  }

  convertSensorDistanceToSensorValue(distance: number) {
    if (distance == Infinity) {
      return 0;
    }

    const maxSensorDistance = this.settings.maxSensorDistance;

    const sensorValue =
      1 - Math.min(distance, maxSensorDistance) / maxSensorDistance;

    return sensorValue;
  }

  centeredRandom(max?: number) {
    return (Math.random() - 0.5) * (max ?? 1);
  }

  reset() {
    this.episode_start_time = 0;
    this.isFirstStep = true;
    this.step_counter = 0;

    const drone_x = 0;
    const drone_y = 0;
    const drone_z = 0;

    this.drone = { x: drone_x, y: drone_y, z: drone_z };

    //goal is set to be at a point randomly spread out from [0,0,this.container_size*0.7]

    const random_x = this.centeredRandom(this.container_size * 0.5);
    const random_y = this.centeredRandom(this.container_size * 0.5);
    const random_z = this.centeredRandom(this.container_size * 0.5);

    const len = Math.sqrt(random_x ** 2 + random_y ** 2 + random_z ** 2);
    const n_random_x = random_x / len;
    const n_random_y = random_y / len;
    const n_random_z = random_z / len;

    const goal_x = this.drone.x + n_random_x * this.container_size * 0.5;
    const goal_y = this.drone.y + n_random_y * this.container_size * 0.5;
    //const goal_y = 0;
    const goal_z = this.drone.z + n_random_z * this.container_size * 0.5;

    this.goal = { x: goal_x, y: goal_y, z: goal_z };

    this.start_distance_to_goal = Math.sqrt(
      (this.drone.x - this.goal.x) ** 2 +
        (this.drone.y - this.goal.y) ** 2 +
        (this.drone.z - this.goal.z) ** 2
    );

    this.obstacles = [];
    this.drone_sensor_left = 0;
    this.drone_sensor_right = 0;
    this.drone_sensor_front = 0;
    this.drone_sensor_back = 0;
    this.drone_sensor_below = 0;
    this.drone_sensor_above = 0;

    const wallThickness = 0.02;
    // const wallThickness = 2;

    //add a wide flat obstacle on the floor:
    this.obstacles.push({
      x: 0,
      y: -this.container_size / 2,
      z: 0,
      width: this.container_size,
      height: wallThickness,
      depth: this.container_size,
      isWall: true,
    });

    //add a wide flat obstacle for the ceiling
    this.obstacles.push({
      x: 0,
      y: this.container_size / 2,
      z: 0,
      width: this.container_size,
      height: wallThickness,
      depth: this.container_size,
      isWall: true,
    });

    //add a left wall
    this.obstacles.push({
      x: -this.container_size / 2,
      y: 0,
      z: 0,
      width: wallThickness,
      height: this.container_size,
      depth: this.container_size,
      isWall: true,
    });

    //add a right wall
    this.obstacles.push({
      x: this.container_size / 2,
      y: 0,
      z: 0,
      width: wallThickness,
      height: this.container_size,
      depth: this.container_size,
      isWall: true,
    });

    //add a front wall
    this.obstacles.push({
      x: 0,
      y: 0,
      z: -this.container_size / 2,
      width: this.container_size,
      height: this.container_size,
      depth: wallThickness,
      isWall: true,
    });

    //add a back wall
    this.obstacles.push({
      x: 0,
      y: 0,
      z: this.container_size / 2,
      width: this.container_size,
      height: this.container_size,
      depth: wallThickness,
      isWall: true,
    });

    //fill the obstacles with 4 random obstacles, but make sure they never enclose
    //the drone position or the goal position

    let go = true;
    const num_obstacles = this.settings.numberOfBlocks;
    //const num_obstacles = 0;
    let iterations = 0;
    while (go) {
      iterations++;
      if (iterations > 2000) {
        console.warn(
          "failed to find a spot to place an obstacle after 2000 iterations"
        );
        debugger;
        break;
      }
      const potential_obstacle = {
        x: this.centeredRandom(this.container_size / 2),
        y: this.centeredRandom(this.container_size / 2),
        z: this.centeredRandom(this.container_size / 2),
        width: Math.abs(this.centeredRandom(7)),
        height: Math.abs(this.centeredRandom(7)),
        depth: Math.abs(this.centeredRandom(7)),
        isWall: false,
      };

      let enclosesDrone = true;
      let enclosesGoal = true;

      //distance to the drone
      const distance_to_drone = Math.sqrt(
        (potential_obstacle.x - this.drone.x) ** 2 +
          (potential_obstacle.y - this.drone.y) ** 2 +
          (potential_obstacle.z - this.drone.z) ** 2
      );

      const distance_to_goal = Math.sqrt(
        (potential_obstacle.x - this.goal.x) ** 2 +
          (potential_obstacle.y - this.goal.y) ** 2 +
          (potential_obstacle.z - this.goal.z) ** 2
      );

      const obstacle_radius =
        2 *
        Math.max(
          potential_obstacle.width / 2,
          potential_obstacle.height / 2,
          potential_obstacle.depth / 2
        );

      if (distance_to_drone > Math.max(this.droneSize, obstacle_radius)) {
        enclosesDrone = false;
      }

      if (distance_to_goal > Math.max(this.droneSize, obstacle_radius)) {
        enclosesGoal = false;
      }

      if (!enclosesDrone && !enclosesGoal) {
        this.obstacles.push(potential_obstacle);
        if (this.obstacles.length >= num_obstacles) {
          go = false;
        }
      }
    }

    const droneToGoalVector = new Vector3(
      this.goal.x - this.drone.x,
      this.goal.y - this.drone.y,
      this.goal.z - this.drone.z
    ).normalize();

    return [
      droneToGoalVector.x,
      droneToGoalVector.y,
      droneToGoalVector.z,
      this.drone_sensor_left,
      this.drone_sensor_right,
      this.drone_sensor_front,
      this.drone_sensor_back,
      this.drone_sensor_below,
      this.drone_sensor_above,
    ];
  }

  boxOverlap(
    box1: {
      x: number;
      y: number;
      z: number;
      width: number;
      height: number;
      depth: number;
    },
    box2: {
      x: number;
      y: number;
      z: number;
      width: number;
      height: number;
      depth: number;
    }
  ) {
    const obstacle_left = box2.x - box2.width / 2;
    const obstacle_right = box2.x + box2.width / 2;
    const obstacle_front = box2.z - box2.depth / 2;
    const obstacle_back = box2.z + box2.depth / 2;
    const obstacle_bottom = box2.y - box2.height / 2;
    const obstacle_top = box2.y + box2.height / 2;

    const drone_left = box1.x - box1.width / 2;
    const drone_right = box1.x + box1.width / 2;
    const drone_front = box1.z - box1.depth / 2;
    const drone_back = box1.z + box1.depth / 2;
    const drone_bottom = box1.y - box1.height / 2;
    const drone_top = box1.y + box1.height / 2;

    const drone_far_left = Math.min(drone_left, drone_right);
    const drone_far_right = Math.max(drone_left, drone_right);
    const drone_far_front = Math.min(drone_front, drone_back);
    const drone_far_back = Math.max(drone_front, drone_back);
    const drone_far_bottom = Math.min(drone_bottom, drone_top);
    const drone_far_top = Math.max(drone_bottom, drone_top);

    const obstacle_far_left = Math.min(obstacle_left, obstacle_right);
    const obstacle_far_right = Math.max(obstacle_left, obstacle_right);
    const obstacle_far_front = Math.min(obstacle_front, obstacle_back);
    const obstacle_far_back = Math.max(obstacle_front, obstacle_back);
    const obstacle_far_bottom = Math.min(obstacle_bottom, obstacle_top);
    const obstacle_far_top = Math.max(obstacle_bottom, obstacle_top);

    let crashed = true;
    if (drone_far_left > obstacle_far_right) {
      crashed = false;
    }
    if (drone_far_right < obstacle_far_left) {
      crashed = false;
    }
    if (drone_far_front > obstacle_far_back) {
      crashed = false;
    }
    if (drone_far_back < obstacle_far_front) {
      crashed = false;
    }
    if (drone_far_bottom > obstacle_far_top) {
      crashed = false;
    }
    if (drone_far_top < obstacle_far_bottom) {
      crashed = false;
    }

    if (crashed) {
      return true;
    }
  }

  didCrash(x: number, y: number, z: number) {
    const drone_width = this.droneSize;
    const drone_height = this.droneSize;
    const drone_depth = this.droneSize;

    //calculate any overlap between the drone and the obstacles
    for (let i = 0; i < this.obstacles.length; i++) {
      const obstacle = this.obstacles[i];

      const obstacle_left = obstacle.x - obstacle.width / 2;
      const obstacle_right = obstacle.x + obstacle.width / 2;
      const obstacle_front = obstacle.z - obstacle.depth / 2;
      const obstacle_back = obstacle.z + obstacle.depth / 2;
      const obstacle_bottom = obstacle.y - obstacle.height / 2;
      const obstacle_top = obstacle.y + obstacle.height / 2;

      const drone_left = x - drone_width / 2;
      const drone_right = x + drone_width / 2;
      const drone_front = z - drone_depth / 2;
      const drone_back = z + drone_depth / 2;
      const drone_bottom = y - 0.1 * drone_height;
      const drone_top = y + 0.1 * drone_height;

      const drone_far_left = Math.min(drone_left, drone_right);
      const drone_far_right = Math.max(drone_left, drone_right);
      const drone_far_front = Math.min(drone_front, drone_back);
      const drone_far_back = Math.max(drone_front, drone_back);
      const drone_far_bottom = Math.min(drone_bottom, drone_top);
      const drone_far_top = Math.max(drone_bottom, drone_top);

      const obstacle_far_left = Math.min(obstacle_left, obstacle_right);
      const obstacle_far_right = Math.max(obstacle_left, obstacle_right);
      const obstacle_far_front = Math.min(obstacle_front, obstacle_back);
      const obstacle_far_back = Math.max(obstacle_front, obstacle_back);
      const obstacle_far_bottom = Math.min(obstacle_bottom, obstacle_top);
      const obstacle_far_top = Math.max(obstacle_bottom, obstacle_top);

      let crashed = true;
      if (drone_far_left > obstacle_far_right) {
        crashed = false;
      }
      if (drone_far_right < obstacle_far_left) {
        crashed = false;
      }
      if (drone_far_front > obstacle_far_back) {
        crashed = false;
      }
      if (drone_far_back < obstacle_far_front) {
        crashed = false;
      }
      if (drone_far_bottom > obstacle_far_top) {
        crashed = false;
      }
      if (drone_far_top < obstacle_far_bottom) {
        crashed = false;
      }

      if (crashed) {
        return true;
      }
    }

    return false;
  }

  get_sensor_reading_box(
    position: Vector3,
    direction: directions,
    sensor_width: number,
    sensor_height: number,
    obstacle: DroneObstacle
  ) {
    const overhang = 1.3;

    let direction_vector = new Vector3(0, 0, 0);
    switch (direction) {
      case "front":
        direction_vector = new Vector3(0, 0, 1);
        break;
      case "back":
        direction_vector = new Vector3(0, 0, -1);
        break;
      case "left":
        direction_vector = new Vector3(-1, 0, 0);
        break;
      case "right":
        direction_vector = new Vector3(1, 0, 0);
        break;
      case "top":
        direction_vector = new Vector3(0, 1, 0);
        break;
      case "bottom":
        direction_vector = new Vector3(0, -1, 0);
        break;
    }

    //find closest corner
    const corners = [
      new Vector3(
        obstacle.x + obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.z + obstacle.depth / 2
      ),
      new Vector3(
        obstacle.x - obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.z + obstacle.depth / 2
      ),
      new Vector3(
        obstacle.x + obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.z + obstacle.depth / 2
      ),
      new Vector3(
        obstacle.x - obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.z + obstacle.depth / 2
      ),
      new Vector3(
        obstacle.x + obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.z - obstacle.depth / 2
      ),
    ];

    let closest_corner = -1;
    let closest_distance = Infinity;

    for (let i = 0; i < corners.length; i++) {
      const corner = corners[i];
      const distance = position.distanceTo(corner);
      if (distance < closest_distance) {
        closest_distance = distance;
        closest_corner = i;
      }
    }

    const closest_corner_vector = corners[closest_corner];

    const point_to_corner = closest_corner_vector.clone().sub(position);

    const point_to_plane_dot = point_to_corner
      .clone()
      .dot(direction_vector.clone().normalize());

    //create a collider box:
    const collider_box = {
      x: position.x,
      y: position.y,
      z: position.z,
      width: 0,
      height: 0,
      depth: 0,
    };

    const extrusion_size = 1000;

    switch (direction) {
      case "front":
        collider_box.width = sensor_width * overhang;
        collider_box.height = sensor_height * overhang;
        collider_box.depth = extrusion_size;
        break;
      case "back":
        collider_box.width = sensor_width * overhang;
        collider_box.height = sensor_height * overhang;
        collider_box.depth = extrusion_size;
        break;
      case "left":
        collider_box.width = extrusion_size;
        collider_box.height = sensor_height * overhang;
        collider_box.depth = sensor_width * overhang;
        break;
      case "right":
        collider_box.width = extrusion_size;
        collider_box.height = sensor_height * overhang;
        collider_box.depth = sensor_width * overhang;
        break;
      case "top":
        collider_box.width = sensor_width * overhang;
        collider_box.height = extrusion_size;
        collider_box.depth = sensor_height * overhang;
        break;
      case "bottom":
        collider_box.width = sensor_width * overhang;
        collider_box.height = extrusion_size;
        collider_box.depth = sensor_height * overhang;
        break;
    }

    const isValid = this.boxOverlap(collider_box, obstacle);

    if (isValid) {
      if (point_to_plane_dot > 0) {
        return point_to_plane_dot;
      } else {
        return Infinity;
      }
    } else {
      return Infinity;
    }
  }

  get_sensor_reading4(
    pos_x: number,
    pos_y: number,
    pos_z: number,
    direction_x: number,
    direction_y: number,
    direction_z: number,
    obstacle: {
      x: number;
      y: number;
      z: number;
      width: number;
      height: number;
      depth: number;
    }
  ) {
    const point = new Vector3(pos_x, pos_y, pos_z);

    const front_face = {
      tl: new Vector3(
        obstacle.x + obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.z + obstacle.depth / 2
      ),
      tr: new Vector3(
        obstacle.x - obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.z + obstacle.depth / 2
      ),
      bl: new Vector3(
        obstacle.x + obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.z + obstacle.depth / 2
      ),
      br: new Vector3(
        obstacle.x - obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.z + obstacle.depth / 2
      ),
    };

    const back_face = {
      tl: new Vector3(
        obstacle.x - obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.z - obstacle.depth / 2
      ),
      tr: new Vector3(
        obstacle.x + obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.z - obstacle.depth / 2
      ),
      bl: new Vector3(
        obstacle.x - obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.z - obstacle.depth / 2
      ),
      br: new Vector3(
        obstacle.x + obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.z - obstacle.depth / 2
      ),
    };

    const right_face = {
      tl: new Vector3(
        obstacle.x + obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.z - obstacle.depth / 2
      ),
      tr: new Vector3(
        obstacle.x + obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.z + obstacle.depth / 2
      ),
      bl: new Vector3(
        obstacle.x + obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.z - obstacle.depth / 2
      ),
      br: new Vector3(
        obstacle.x + obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.z + obstacle.depth / 2
      ),
    };

    const left_face = {
      tl: new Vector3(
        obstacle.x - obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.z + obstacle.depth / 2
      ),
      tr: new Vector3(
        obstacle.x - obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.z - obstacle.depth / 2
      ),
      bl: new Vector3(
        obstacle.x - obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.z + obstacle.depth / 2
      ),
      br: new Vector3(
        obstacle.x - obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.z - obstacle.depth / 2
      ),
    };

    const top_face = {
      tl: new Vector3(
        obstacle.x + obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.z - obstacle.depth / 2
      ),
      tr: new Vector3(
        obstacle.x - obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.z - obstacle.depth / 2
      ),
      bl: new Vector3(
        obstacle.x - obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.z + obstacle.depth / 2
      ),
      br: new Vector3(
        obstacle.x + obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        obstacle.z + obstacle.depth / 2
      ),
    };

    const bottom_face = {
      tl: new Vector3(
        obstacle.x - obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.z - obstacle.depth / 2
      ),
      tr: new Vector3(
        obstacle.x + obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.z - obstacle.depth / 2
      ),
      bl: new Vector3(
        obstacle.x - obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.z + obstacle.depth / 2
      ),
      br: new Vector3(
        obstacle.x + obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.z + obstacle.depth / 2
      ),
    };

    const closest_point_front = this.get_closest_point_between_point_and_face(
      point,
      front_face
    );
    const closest_point_back = this.get_closest_point_between_point_and_face(
      point,
      back_face
    );
    const closest_point_right = this.get_closest_point_between_point_and_face(
      point,
      right_face
    );
    const closest_point_left = this.get_closest_point_between_point_and_face(
      point,
      left_face
    );
    const closest_point_top = this.get_closest_point_between_point_and_face(
      point,
      top_face
    );
    const closest_point_bottom = this.get_closest_point_between_point_and_face(
      point,
      bottom_face
    );

    const direction_vector = new Vector3(direction_x, direction_y, direction_z);
    const pointToClosestFront = closest_point_front.clone().sub(point);
    const pointToClosestBack = closest_point_back.clone().sub(point);
    const pointToClosestRight = closest_point_right.clone().sub(point);
    const pointToClosestLeft = closest_point_left.clone().sub(point);
    const pointToClosestTop = closest_point_top.clone().sub(point);
    const pointToClosestBottom = closest_point_bottom.clone().sub(point);

    const angle_front = this.get_angle_between_vectors(
      direction_vector,
      pointToClosestFront
    );
    const angle_back = this.get_angle_between_vectors(
      direction_vector,
      pointToClosestBack
    );
    const angle_right = this.get_angle_between_vectors(
      direction_vector,
      pointToClosestRight
    );
    const angle_left = this.get_angle_between_vectors(
      direction_vector,
      pointToClosestLeft
    );
    const angle_top = this.get_angle_between_vectors(
      direction_vector,
      pointToClosestTop
    );
    const angle_bottom = this.get_angle_between_vectors(
      direction_vector,
      pointToClosestBottom
    );

    const max_angle_cutoff = (60 * Math.PI) / 180;
    const distances: number[] = [];
    if (angle_front < max_angle_cutoff) {
      distances.push(closest_point_front.distanceTo(point));
    }
    if (angle_back < max_angle_cutoff) {
      distances.push(closest_point_back.distanceTo(point));
    }
    if (angle_right < max_angle_cutoff) {
      distances.push(closest_point_right.distanceTo(point));
    }
    if (angle_left < max_angle_cutoff) {
      distances.push(closest_point_left.distanceTo(point));
    }
    if (angle_top < max_angle_cutoff) {
      distances.push(closest_point_top.distanceTo(point));
    }
    if (angle_bottom < max_angle_cutoff) {
      distances.push(closest_point_bottom.distanceTo(point));
    }

    if (distances.length == 0) {
      return Infinity;
    } else {
      const min_distance = Math.min(...distances);
      return Math.max(0, min_distance);
    }
  }

  get_angle_between_vectors(vector1: Vector3, vector2: Vector3) {
    const dot_product = vector1.dot(vector2);
    const angle = Math.acos(
      dot_product / (vector1.length() * vector2.length())
    );
    return angle;
  }

  get_sensor_reading2(
    pos_x: number,
    pos_y: number,
    pos_z: number,
    direction_x: number,
    direction_y: number,
    direction_z: number,
    obstacle: {
      x: number;
      y: number;
      z: number;
      width: number;
      height: number;
      depth: number;
    }
  ) {
    // Calculate obstacle bounds
    const obstacle_left = obstacle.x - obstacle.width / 2;
    const obstacle_right = obstacle.x + obstacle.width / 2;
    const obstacle_front = obstacle.z - obstacle.depth / 2;
    const obstacle_back = obstacle.z + obstacle.depth / 2;
    const obstacle_bottom = obstacle.y - obstacle.height / 2;
    const obstacle_top = obstacle.y + obstacle.height / 2;

    // Normalize direction vector
    const length = Math.sqrt(
      direction_x * direction_x +
        direction_y * direction_y +
        direction_z * direction_z
    );
    direction_x /= length;
    direction_y /= length;
    direction_z /= length;

    // Calculate intersection with each plane of the obstacle
    let tMin = -Infinity;
    let tMax = Infinity;

    // Check X planes
    if (Math.abs(direction_x) > 1e-8) {
      const tx1 = (obstacle_left - pos_x) / direction_x;
      const tx2 = (obstacle_right - pos_x) / direction_x;
      tMin = Math.max(tMin, Math.min(tx1, tx2));
      tMax = Math.min(tMax, Math.max(tx1, tx2));
    }

    // Check Y planes
    if (Math.abs(direction_y) > 1e-8) {
      const ty1 = (obstacle_bottom - pos_y) / direction_y;
      const ty2 = (obstacle_top - pos_y) / direction_y;
      tMin = Math.max(tMin, Math.min(ty1, ty2));
      tMax = Math.min(tMax, Math.max(ty1, ty2));
    }

    // Check Z planes
    if (Math.abs(direction_z) > 1e-8) {
      const tz1 = (obstacle_front - pos_z) / direction_z;
      const tz2 = (obstacle_back - pos_z) / direction_z;
      tMin = Math.max(tMin, Math.min(tz1, tz2));
      tMax = Math.min(tMax, Math.max(tz1, tz2));
    }

    // If tMax < tMin, ray misses the box
    if (tMax < tMin || tMax < 0) {
      return Infinity;
    }

    // Calculate intersection point at tMin to check if it's within bounds
    const intersect_x = pos_x + direction_x * tMin;
    const intersect_y = pos_y + direction_y * tMin;
    const intersect_z = pos_z + direction_z * tMin;

    // Check if intersection point is within the obstacle bounds
    if (
      intersect_x < obstacle_left ||
      intersect_x > obstacle_right ||
      intersect_y < obstacle_bottom ||
      intersect_y > obstacle_top ||
      intersect_z < obstacle_front ||
      intersect_z > obstacle_back
    ) {
      return Infinity;
    }

    // Return the closest intersection distance
    return Math.max(0, tMin);
  }

  get_closest_point_between_point_and_face(
    point: Vector3,
    face: { tl: Vector3; tr: Vector3; bl: Vector3; br: Vector3 }
  ) {
    const face_center = new Vector3(
      (face.tl.x + face.tr.x + face.bl.x + face.br.x) / 4,
      (face.tl.y + face.tr.y + face.bl.y + face.br.y) / 4,
      (face.tl.z + face.tr.z + face.bl.z + face.br.z) / 4
    );
    const face_right = new Vector3(
      face.br.x - face.bl.x,
      face.br.y - face.bl.y,
      face.br.z - face.bl.z
    );
    const face_up = new Vector3(
      face.tl.x - face.bl.x,
      face.tl.y - face.bl.y,
      face.tl.z - face.bl.z
    );

    const face_normal = face_right.cross(face_up);
    face_normal.normalize();

    // Calculate the vector from face center to the point
    const to_point = point.clone().sub(face_center);

    // Project the point onto the face plane
    const distance_to_plane = to_point.dot(face_normal);
    const projected_point = point
      .clone()
      .sub(face_normal.clone().multiplyScalar(distance_to_plane));

    // Convert to local face coordinates
    const face_right_normalized = face_right.clone().normalize();
    const face_up_normalized = face_up.clone().normalize();

    const local_x = projected_point
      .clone()
      .sub(face_center)
      .dot(face_right_normalized);
    const local_y = projected_point
      .clone()
      .sub(face_center)
      .dot(face_up_normalized);

    // Get face dimensions
    const face_width = face_right.length();
    const face_height = face_up.length();
    const half_width = face_width / 2;
    const half_height = face_height / 2;

    // Check if projected point is inside the face
    if (Math.abs(local_x) <= half_width && Math.abs(local_y) <= half_height) {
      // Point projects inside the face, return the projected point
      return projected_point;
    }

    // Point projects outside the face, find closest point on edges
    let closest_point = new Vector3();
    let min_distance = Infinity;

    // Define the four edges of the face
    const edges = [
      // Top edge (tl to tr)
      { start: face.tl, end: face.tr },
      // Right edge (tr to br)
      { start: face.tr, end: face.br },
      // Bottom edge (br to bl)
      { start: face.br, end: face.bl },
      // Left edge (bl to tl)
      { start: face.bl, end: face.tl },
    ];

    // Find closest point on each edge
    for (const edge of edges) {
      const edge_vector = edge.end.clone().sub(edge.start);
      const point_to_start = point.clone().sub(edge.start);

      // Project point onto edge line
      const edge_length = edge_vector.length();
      const edge_normalized = edge_vector.clone().normalize();
      const projection_length = point_to_start.dot(edge_normalized);

      // Clamp projection to edge bounds
      const clamped_projection = Math.max(
        0,
        Math.min(edge_length, projection_length)
      );

      // Calculate closest point on this edge
      const closest_on_edge = edge.start
        .clone()
        .add(edge_normalized.clone().multiplyScalar(clamped_projection));

      // Calculate distance to this point
      const distance = point.distanceTo(closest_on_edge);

      if (distance < min_distance) {
        min_distance = distance;
        closest_point = closest_on_edge;
      }
    }

    return closest_point;
  }

  update_drone_sensor_readings() {
    let min_distance_left = Infinity;
    let min_distance_right = Infinity;
    let min_distance_front = Infinity;
    let min_distance_back = Infinity;
    let min_distance_below = Infinity;
    let min_distance_above = Infinity;

    // const fake_top_obstacle = {
    //     x: 0,
    //     y: this.container_size/2,
    //     z: 0,
    //     width: this.container_size,
    //     height: 0.1,
    //     depth: this.container_size
    // }

    //calculate distance to the walls on the left, right, front, back, below, above
    for (let i = 0; i < this.obstacles.length; i++) {
      const obstacle = { ...this.obstacles[i] };

      const distance_left = this.get_sensor_reading_box(
        new Vector3(
          this.drone.x - this.droneSize / 2,
          this.drone.y,
          this.drone.z
        ),
        "left",
        this.droneSize,
        0.1 * this.droneSize,
        obstacle
      );

      const distance_right = this.get_sensor_reading_box(
        new Vector3(
          this.drone.x + this.droneSize / 2,
          this.drone.y,
          this.drone.z
        ),
        "right",
        this.droneSize,
        0.1 * this.droneSize,
        obstacle
      );

      const distance_front = this.get_sensor_reading_box(
        new Vector3(
          this.drone.x,
          this.drone.y,
          this.drone.z + this.droneSize / 2
        ),
        "front",
        this.droneSize,
        0.1 * this.droneSize,
        obstacle
      );

      const distance_back = this.get_sensor_reading_box(
        new Vector3(
          this.drone.x,
          this.drone.y,
          this.drone.z - this.droneSize / 2
        ),
        "back",
        this.droneSize,
        0.1 * this.droneSize,
        obstacle
      );

      const distance_below = this.get_sensor_reading_box(
        new Vector3(
          this.drone.x,
          this.drone.y - (0.1 * this.droneSize) / 2,
          this.drone.z
        ),
        "bottom",
        this.droneSize,
        this.droneSize,
        obstacle
      );

      const distance_above = this.get_sensor_reading_box(
        new Vector3(
          this.drone.x,
          this.drone.y + (0.1 * this.droneSize) / 2,
          this.drone.z
        ),
        "top",
        this.droneSize,
        this.droneSize,
        obstacle
      );

      if (distance_left < min_distance_left) {
        min_distance_left = distance_left;
      }
      if (distance_right < min_distance_right) {
        min_distance_right = distance_right;
      }
      if (distance_front < min_distance_front) {
        min_distance_front = distance_front;
      }
      if (distance_back < min_distance_back) {
        min_distance_back = distance_back;
      }
      if (distance_below < min_distance_below) {
        min_distance_below = distance_below;
      }
      if (distance_above < min_distance_above) {
        min_distance_above = distance_above;
      }
    }

    this.drone_sensor_left =
      this.convertSensorDistanceToSensorValue(min_distance_left);
    this.drone_sensor_right =
      this.convertSensorDistanceToSensorValue(min_distance_right);
    this.drone_sensor_front =
      this.convertSensorDistanceToSensorValue(min_distance_front);
    this.drone_sensor_back =
      this.convertSensorDistanceToSensorValue(min_distance_back);
    this.drone_sensor_below =
      this.convertSensorDistanceToSensorValue(min_distance_below);
    this.drone_sensor_above =
      this.convertSensorDistanceToSensorValue(min_distance_above);
  }
}
