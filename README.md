# AlgoRyth-M

AlgoRyth-M is a browser-based algorithm visualizer focused on making sorting and searching easier to understand through animated, step-by-step playback.

Live Demo: https://algorythm-beryl.vercel.app/

## Overview

The app is built with vanilla HTML, CSS, and JavaScript. There is no framework, bundler, or package manager involved.

Current visualizations include:

- Merge Sort
- Quick Sort
- Heap Sort
- Bubble Sort
- Selection Sort
- Linear Search
- Binary Search

## Features

- Animated playback for sorting and searching algorithms
- Pause and resume controls during playback
- Step backward and forward after a run completes
- Comparison, swap, and overwrite counters
- Adjustable array size and animation speed
- Random array generation
- Custom user-input arrays with normalization for visualization
- Random target selection for searching

## Project Structure

The codebase is intentionally small and flat:

- `index.html` - main page structure and script loading order
- `style.css` - layout, view switching, and visual styling
- `script.js` - DOM wiring, app state, and UI event handling
- `animation-engine.js` - animation playback and reversible step rendering
- `sorting.js` - sorting algorithm implementations and recorder steps
- `searching.js` - searching algorithm implementations and recorder steps

## Running Locally

Because this is a static app, you can run it without installing dependencies.

1. Clone or download the repository.
2. Open [index.html](/d:/PROJECTS/AlgoRythM/index.html) in a browser.


## How To Use

1. Open the app and choose `SORTING` or `SEARCHING`.
2. Set the array size and speed if needed.
3. Generate a random array or enter your own values.
4. Start an algorithm from the available controls.
5. Use `Pause`, `Previous`, and `Next` to inspect the playback.

For searching:

- Enter a target manually, or use `Random Target`.
- With custom arrays, use the original input values as the target values.

## Implementation Notes

- The app records algorithm actions first, then replays them through a shared animation engine.
- Sorting and searching logic are separated from animation rendering.
- Binary search runs on a sorted copy of the displayed data so the visualization remains algorithmically correct.
- View switching is handled through body classes and plain-script DOM updates.

## Current Limitations

- Array size is capped at `475` to keep bars visible and hoverable.
- The app relies on global browser scripts loaded in a specific order.
- Duplicate values in custom arrays currently trigger an alert, but input is not fully rejected afterward.
- Binary search reports positions in the sorted search view, not the original unsorted order.
- There is no automated test suite or build pipeline yet.

## Roadmap

The next planned milestone is a sorting comparison mode.

## Author

Mohit Agarwal - [@mohitagarwal11](https://github.com/mohitagarwal11)
