# AlgoRyth-M

An interactive algorithm visualizer that brings sorting and searching algorithms to life. This project emphasizes clarity and step-by-step execution, making it suitable for both learning and demonstration purposes.

Live Demo: https://algorythm-beryl.vercel.app/
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
- Target values can be identified by hovering over the bars. For custom arrays, use the original input values as the target.
- The visualizer will show a green line indicating the target height
- Watch as the algorithm searches for your value

## Known Limitations and Issues

- Array size is capped at 475 elements to prevent bars from becoming sub-pixel in width, which would break visual clarity and hover-based inspection.

## Author

Mohit Agarwal - [@mohitagarwal11](https://github.com/mohitagarwal11)

## Acknowledgments

- Inspired by algorithm visualization tools and educational resources
- Built with passion for computer science education
