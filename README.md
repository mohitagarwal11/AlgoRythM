# AlgoRyth-M

An interactive algorithm visualizer that brings sorting and searching algorithms to life. This project emphasizes calrity, step by step execution making it suitable for both learning and demonstration purposes.

## Key Highlights

- Visualizes core algorithms: Merge, Quick, Heap, Bubble, Selection, Linear Search and Binary Search
- Step-by-step animated execution with **pause, resume, previous and next** controls
- Real-time tracking of **comparisons, swaps and overwrites**
- Supports **custom user input arrays** with automatic normalization
- Clean UI with no external libraries or frameworks

## Technical Overview

- Custom animation engine that records algorithm operations as reversible steps
- Clear separation of concerns between algorithm logic, animation rendering and UI control flow
- Binary search visualization operates on a sorted copy for correctness

## Getting Started

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/algorythm-m.git
```

2. Navigate to the project directory

```bash
cd algorythm-m
```

3. Open `index.html` in your browser

```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

## How to Use

1. **Select Mode**: Choose between SORTING or SEARCHING on the home screen
2. **Adjust Settings**:
   - Set your custom array values and size
   - Adjust animation speed using the slider
3. **Choose Algorithm**: Click on any algorithm button to start visualization
4. **Control Playback**: Use Pause/Resume to control the animation
5. **Generate New Array**: Click "Generate New" to create a fresh random array
6. **Return Home**: Click "Home" to go back to the main menu

### For Searching

- Enter a target value in the "Target" input field
- Target Value can be found by hovering over the bars on the screen. (For custom arrays use your own inputed values as target value)
- The visualizer will show a green line indicating the target height
- Watch as the algorithm searches for your value

## Author

Your Name - [@mohitagarwal11](https://github.com/mohitagarwal11)

## Acknowledgments

- Inspired by algorithm visualization tools and educational resources
- Built with passion for computer science education
