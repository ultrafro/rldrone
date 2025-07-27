# RL Drone - Reinforcement Learning for Autonomous Navigation

A browser-based demonstration of reinforcement learning algorithms training a virtual drone to navigate indoor environments with obstacle avoidance. The entire training process happens live in your browser using TensorFlow.js.

![Drone RL Training Demo](https://img.shields.io/badge/Demo-Live%20Training-green) ![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-3.7.0-orange) ![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black)

## 🎯 Overview

This project showcases major reinforcement learning algorithms applied to autonomous drone navigation. A virtual drone equipped with 6 directional sensors learns to:

- **Navigate to goal positions** in complex 3D environments
- **Avoid obstacles** using proximity sensors
- **Optimize flight paths** through reinforcement learning
- **Adapt behavior** based on reward feedback

The entire training pipeline runs in real-time in your browser, making RL concepts accessible and visualizable without requiring specialized hardware or cloud computing.

## 🤖 Reinforcement Learning Algorithms

### Implemented Algorithms

1. **REINFORCE** - Basic policy gradient method
   - Direct policy optimization using Monte Carlo returns
   - Simple but effective for discrete action spaces

2. **A2C (Advantage Actor-Critic)** - Default algorithm
   - Combines policy gradients with value function estimation
   - Reduces variance using advantage estimation
   - Separate actor (policy) and critic (value) networks

3. **PPO (Proximal Policy Optimization)**
   - State-of-the-art policy gradient method
   - Prevents destructive policy updates with clipped objectives
   - More stable training than vanilla policy gradients

### Neural Network Architecture

- **Policy Network (Actor)**: Multi-layer neural network with softmax output for action probability distribution
- **Value Network (Critic)**: Estimates state values for advantage calculation
- **Input Features**: 9-dimensional state space including:
  - 3D directional vector to goal
  - 6 proximity sensor readings (left, right, front, back, above, below)

## 🚁 Drone Environment

### Sensor System

The drone is equipped with 6 directional proximity sensors that provide distance measurements to nearby obstacles:

- **Directional Coverage**: 360° horizontal + vertical coverage
- **Sensor Range**: Configurable maximum detection distance
- **Real-time Feedback**: Continuous sensor updates during flight

### Reward Structure

- **Goal Achievement**: Positive reward for reaching target positions
- **Obstacle Avoidance**: Penalties for proximity to obstacles and collisions
- **Direction Incentives**: Rewards for moving toward the goal
- **Distance Penalties**: Small penalties to encourage efficient paths

### 3D Environment

- **Dynamic Obstacles**: Randomly generated obstacle layouts
- **Bounded Space**: Contained 3D flight area with walls
- **Real-time Visualization**: Live 3D rendering of drone, sensors, and environment

## 🎮 Features

### Interactive Training Interface

- **Real-time 3D Visualization**: Watch the drone learn to navigate in real-time
- **Live Metrics Dashboard**: Track training progress with real-time charts
  - Total reward per episode
  - Policy, value, and entropy losses
  - Training convergence metrics
- **Configurable Parameters**: Adjust hyperparameters on-the-fly
  - Learning rates
  - Network architectures
  - Training batch sizes
  - Algorithm selection

### Browser-Based Training

- **No Installation Required**: Everything runs in your web browser
- **GPU Acceleration**: Leverages WebGL for fast neural network training
- **Model Persistence**: Save and load trained models locally
- **Real-time Performance**: Interactive framerates during training

### Advanced Controls

- **Algorithm Switching**: Compare different RL algorithms
- **Hyperparameter Tuning**: Extensive configuration options
- **Training Visualization**: Sensor readings, reward signals, and loss curves
- **Model Export**: Download trained weights for analysis

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Modern web browser with WebGL support
- 4GB+ RAM recommended for training

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd rldrone

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Quick Start Training

1. **Load the Application**: Navigate to the drone training page
2. **Configure Settings**: Adjust training parameters in the settings panel
3. **Start Training**: Click "Train From Scratch" to begin
4. **Watch and Learn**: Observe the drone learning to navigate in real-time
5. **Analyze Results**: Monitor training metrics and performance charts

## 🛠 Technology Stack

### Core Technologies

- **Next.js 15.4.4** - React framework for the web application
- **TensorFlow.js 3.7.0** - In-browser machine learning and neural networks
- **Three.js + React Three Fiber** - 3D visualization and rendering
- **TypeScript** - Type-safe development

### 3D Graphics & Visualization

- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for 3D development
- **WebGL** - Hardware-accelerated 3D graphics

### Machine Learning Stack

- **@tensorflow/tfjs-backend-webgl** - GPU acceleration via WebGL
- **@tensorflow/tfjs-backend-cpu** - CPU fallback for training
- **@tensorflow/tfjs-backend-wasm** - WebAssembly backend for performance

## 📊 Training Insights

### State Space (9 dimensions)

1. **Goal Direction Vector** (3D): Normalized direction from drone to goal
2. **Sensor Readings** (6D): Distance measurements from each directional sensor

### Action Space (7 discrete actions)

- Move Forward/Backward
- Move Left/Right
- Move Up/Down
- Stay in place

### Hyperparameter Options

- **Learning Rate**: 1e-5 to 1e-3
- **Network Sizes**: 64 to 512 neurons
- **Batch Sizes**: 512 to 4096 samples
- **Discount Factor**: 0.9 to 0.99
- **Episode Length**: 1000 to 10000 steps

## 🎯 Educational Value

This project demonstrates:

- **RL Algorithm Comparison**: Side-by-side performance of different approaches
- **Hyperparameter Sensitivity**: How settings affect learning
- **Exploration vs Exploitation**: Balance between trying new actions and exploiting known good ones
- **Neural Network Training**: Real-time visualization of gradient descent
- **Sensor Fusion**: Combining multiple sensor inputs for decision making

## 🤝 Contributing

This project is perfect for:

- **RL Researchers**: Experimenting with new algorithms
- **Students**: Learning RL concepts through visualization
- **Developers**: Adding new features or environments
- **Educators**: Teaching autonomous systems concepts

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Resources

- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [Reinforcement Learning: An Introduction](http://incompleteideas.net/book/the-book.html)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)

---

**Ready to watch AI learn to fly?** Start the development server and begin training your drone! 🚁✨
