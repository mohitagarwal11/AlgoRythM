# AlgoRyth-M

An interactive algorithm visualizer that brings sorting and searching algorithms to life with stunning animations and realtime visual feedback.

## Features

### Sorting Algorithms

- **Merge Sort** - Efficient divide-and-conquer algorithm
- **Quick Sort** - Fast partitioning-based sorting
- **Heap Sort** - Binary heap tree-based sorting
- **Bubble Sort** - Simple comparison-based algorithm
- **Selection Sort** - In-place comparison sorting

### Searching Algorithms

- **Linear Search** - Sequential search through elements
- **Binary Search** - Efficient search on sorted arrays

### Interactive Controls

- **Realtime Visualization** - Watch algorithms work step-by-step
- **Adjustable Speed** - Control animation speed
- **Customizable Array Size** - Set array length (10-475 elements)
- **Pause/Resume** - Pause animations at any time
- **Generate New Arrays** - Create random arrays on demand
- **Target Search** - Specify target values for searching

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
   - Set your preferred array size (10-475)
   - Adjust animation speed using the slider
3. **Choose Algorithm**: Click on any algorithm button to start visualization
4. **Control Playback**: Use Pause/Resume to control the animation
5. **Generate New Array**: Click "Generate New" to create a fresh random array
6. **Return Home**: Click "Home" to go back to the main menu

### For Searching

- Enter a target value in the "Target" input field
- The visualizer will show a green line indicating the target height
- Watch as the algorithm searches for your value

## Color Coding

### Sorting

- 🟣 **Pink (#ff4da6)** - Default/unsorted elements
- ⚪ **White** - Elements being compared
- 🟠 **Orange (#ffaa00)** - Elements being swapped
- 🟢 **Green** - Sorted/completed elements
- 🟡 **Yellow** - Pivot element (Quick Sort)
- 🟠 **Orange (#ff6600)** - Partition marker (Quick Sort)

### Searching

- 🟣 **Pink (#ff4da6)** - Active search range
- 🔵 **Cyan (#00ffff)** - Current element being checked (Linear Search)
- 🟡 **Yellow** - Middle element being checked (Binary Search)
- ⚫ **Dark Gray** - Eliminated search space
- 🟢 **Green** - Found target
- 🔴 **Red** - Target not found

## Technical Details

### Architecture

- **Vanilla JavaScript** - No frameworks or libraries
- **Class based Animation System** - Modular animation steps
- **Async/Await Pattern** - Smooth animation sequencing
- **CSS Transitions** - Hardware accelerated visual effects

### Key Components

- **Animations Class** - Records algorithm steps for playback
- **Dynamic Bar Rendering** - Responsive visualization based on array size
- **State Management** - Controls for pausing, speed and view switching

### Ideas for Contributions

- Add more sorting algorithms (Insertion Sort, Shell Sort, Radix Sort)
- Add more searching algorithms (Jump Search, Interpolation Search)
- Implement algorithm complexity information
- Create step-by-step code explanation view

## Author

Your Name - [@mohitagarwal11](https://github.com/mohitagarwal11)
