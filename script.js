const arrCon = document.getElementById("array_container");

const sortBtn = document.getElementById("sort");
const searchBtn = document.getElementById("search");
const homeBtn = document.getElementById("home_btn");
const pauseBtn = document.getElementById("pause");
const generateBtn = document.getElementById("generate");

const mergeBtn = document.getElementById("merge");
const quickBtn = document.getElementById("quick");
const heapBtn = document.getElementById("heap");
const bubbleBtn = document.getElementById("bubble");
const selectionBtn = document.getElementById("selection");
const insertionBtn = document.getElementById("insertion");
const shellBtn = document.getElementById("shell");
const radixBtn = document.getElementById("radix");

const linearBtn = document.getElementById("linear");
const binaryBtn = document.getElementById("binary");
const jumpBtn = document.getElementById("jump");
const interpolationBtn = document.getElementById("interpolation");

const speedSlider = document.getElementById("speed_slider");
const userArrLen = document.getElementById("arrLen");
const targetBox = document.getElementById("target");
const arrBox = document.getElementById("numbersInput");
const initialTargetIndicator = document.getElementById("target_indicator");
const searchStatus = document.getElementById("search_status");
const sortStatus = document.getElementById("sort_status");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

const quickTips = document.getElementById("quick_tips");
const quickTipsTitle = document.getElementById("quick_tips_title");
const quickTipsMessage = document.getElementById("quick_tips_message");
const quickTipsList = document.getElementById("quick_tips_list");
const helpBtn = document.getElementById("help_btn");

const compareElem = document.getElementById("compares");
const swapElem = document.getElementById("swaps");
const overwriteElem = document.getElementById("overwrites");
const algoTimeElem = document.getElementById("algo_time");
const playbackTimeElem = document.getElementById("playback_time");
const stepRateElem = document.getElementById("step_rate");

class Animations {
  constructor() {
    this.steps = [];
  }
  compare(i, j) {
    this.steps.push({ type: "compare", indices: [i, j] });
  }
  overwrite(i, value, previousValue) {
    this.steps.push({
      type: "overwrite",
      indices: [i],
      values: [value],
      previousValue,
    });
  }
  swap(i, j) {
    this.steps.push({ type: "swap", indices: [i, j] });
  }
  found(i) {
    this.steps.push({ type: "found", indices: [i] });
  }
  notFound() {
    this.steps.push({ type: "notFound", indices: [] });
  }
  setTarget(value) {
    this.steps.push({ type: "setTarget", value });
  }
  scan(i) {
    this.steps.push({ type: "scan", indices: [i] });
  }
  check(i) {
    this.steps.push({ type: "check", indices: [i] });
  }
  setRange(left, right) {
    this.steps.push({ type: "setRange", indices: [left, right] });
  }
  eliminate(start, end) {
    this.steps.push({ type: "eliminate", indices: [start, end] });
  }
  pivot(i) {
    this.steps.push({ type: "pivot", indices: [i] });
  }
  setPivot(i) {
    this.steps.push({ type: "setPivot", indices: [i] });
  }
  setPartition(i) {
    this.steps.push({ type: "setPartition", indices: [i] });
  }
  setSorted(i) {
    this.steps.push({ type: "setSorted", indices: [i] });
  }
}

function createContext() {
  return {
    array: [],
    originalArray: [],
    animations: new Animations(),
    container: arrCon,
    targetIndicator: initialTargetIndicator,
    visualBars: [],
    speed: 220,
    isPaused: false,
    isSorting: false,
    isSteppingMode: false,
    currentStepIndex: -1,
    pendingSearchRestore: false,
    algorithmRuntimeMs: 0,
    playbackElapsedMs: 0,
    playbackStartedAt: null,
    playbackTickerId: null,
    completedPlaybackSteps: 0,
    isUserArray: false,
    compareElem,
    swapElem,
    overwriteElem,
    algoTimeElem,
    playbackTimeElem,
    stepRateElem,
  };
}

// now we can make different contexts for different algorithms for parallel viewing
const currentContext = createContext();

let isGuideOpen = true;

const onboardingTips = {
  home: {
    title: "Getting Started",
    message:
      "Choose a mode based on what you want to learn, and begin with a small array so each step is easy to follow.",
    bullets: [
      "Sorting shows how values rearrange over time through swaps and overwrites.",
      "Searching shows how a target is located step by step within the array.",
    ],
  },

  "sorting-view": {
    title: "Understanding Sorting",
    message:
      "Use fewer bars and a moderate speed so you can clearly observe comparisons and swaps.",
    bullets: [
      "Start with 10 to 20 elements to keep movements readable.",
      "Begin with Bubble Sort, Selection Sort, or Insertion Sort to understand basic patterns.",
      "After playback, use Previous/Next to step through and analyze each operation.",
    ],
  },

  "searching-view": {
    title: "Understanding Searching",
    message:
      "Focus on how the algorithm inspects or narrows down elements to find the target.",
    bullets: [
      "Use Random Target or pick a visible value from the array.",
      "Start with Linear Search to follow a simple left-to-right scan.",
      "Binary, Jump, and Interpolation Search visualize on a sorted copy of the array.",
    ],
  },
};

let arrlen = Number(userArrLen.value);
let target = targetBox.value;

const targetMin = 10;
const targetMax = 400;
const minStepDelay = 4;
const maxStepDelay = 1100;
const steppingSpeed = 150;

function formatTime(ms) {
  if (!Number.isFinite(ms) || ms <= 0) {
    return "0 ms";
  }

  if (ms < 1000) {
    return `${ms.toFixed(ms < 100 ? 1 : 0)} ms`;
  }

  return `${(ms / 1000).toFixed(ms < 10000 ? 2 : 1)} s`;
}

function formatStepRate(rate) {
  if (!Number.isFinite(rate) || rate <= 0) {
    return "0 step/s";
  }

  if (rate < 100) {
    return `${rate.toFixed(1)} step/s`;
  }

  return `${Math.round(rate)} step/s`;
}

function getPlaybackElapsedMs(context = currentContext) {
  if (context.playbackStartedAt === null) {
    return context.playbackElapsedMs;
  }

  return context.playbackElapsedMs + (performance.now() - context.playbackStartedAt);
}

function getCompletedStepCount(context = currentContext) {
  if (context.isSorting) {
    return Math.max(context.completedPlaybackSteps, context.currentStepIndex + 1, 0);
  }

  return Math.max(context.completedPlaybackSteps, 0);
}

function renderRealTimeStats(context = currentContext) {
  context.algoTimeElem.textContent = formatTime(context.algorithmRuntimeMs);

  const playbackElapsedMs = getPlaybackElapsedMs(context);
  context.playbackTimeElem.textContent = formatTime(playbackElapsedMs);

  const completedSteps = getCompletedStepCount(context);
  const stepRate =
    playbackElapsedMs > 0 ? (completedSteps * 1000) / playbackElapsedMs : 0;
  context.stepRateElem.textContent = formatStepRate(stepRate);
}

function startPlaybackMetrics(context = currentContext) {
  stopPlaybackMetrics(context);

  context.playbackElapsedMs = 0;
  context.playbackStartedAt = performance.now();
  context.completedPlaybackSteps = 0;
  renderRealTimeStats(context);

  context.playbackTickerId = window.setInterval(() => {
    renderRealTimeStats(context);
  }, 80);
}

function pausePlaybackMetrics(context = currentContext) {
  if (context.playbackStartedAt === null) return;

  context.playbackElapsedMs += performance.now() - context.playbackStartedAt;
  context.playbackStartedAt = null;
  renderRealTimeStats(context);
}

function resumePlaybackMetrics(context = currentContext) {
  if (!context.isSorting || context.playbackStartedAt !== null) return;

  context.playbackStartedAt = performance.now();
  renderRealTimeStats(context);
}

function stopPlaybackMetrics(context = currentContext, finalStepCount = null) {
  if (context.playbackStartedAt !== null) {
    context.playbackElapsedMs += performance.now() - context.playbackStartedAt;
    context.playbackStartedAt = null;
  }

  if (typeof finalStepCount === "number") {
    context.completedPlaybackSteps = finalStepCount;
  } else {
    context.completedPlaybackSteps = Math.max(
      context.completedPlaybackSteps,
      context.currentStepIndex + 1,
      0,
    );
  }

  if (context.playbackTickerId !== null) {
    window.clearInterval(context.playbackTickerId);
    context.playbackTickerId = null;
  }

  renderRealTimeStats(context);
}

function resetRealTimeStats(context = currentContext) {
  stopPlaybackMetrics(context, 0);
  context.algorithmRuntimeMs = 0;
  context.playbackElapsedMs = 0;
  context.completedPlaybackSteps = 0;
  renderRealTimeStats(context);
}

function updatePlaybackControls(context = currentContext) {
  const canPause = context.isSorting;
  pauseBtn.disabled = !canPause;

  if (!canPause) {
    pauseBtn.textContent = "Pause";
    pauseBtn.style.borderColor = "#333333";
  } else if (context.isPaused) {
    pauseBtn.textContent = "Resume";
    pauseBtn.style.borderColor = "#4d50ff";
  } else {
    pauseBtn.textContent = "Pause";
    pauseBtn.style.borderColor = "#333333";
  }

  const hasSteps =
    context.isSteppingMode && context.animations.steps.length > 0;
  const canPrev = hasSteps && context.currentStepIndex > -1;
  const canNext =
    hasSteps && context.currentStepIndex < context.animations.steps.length - 1;

  prevBtn.disabled = !canPrev;
  nextBtn.disabled = !canNext;
  const stepBorder = hasSteps ? "#00ff00" : "#333333";
  prevBtn.style.borderColor = stepBorder;
  nextBtn.style.borderColor = stepBorder;
}

function getArraySpeedFactor(arraySize) {
  if (arraySize >= 180) return 0.24;
  if (arraySize >= 120) return 0.32;
  if (arraySize >= 80) return 0.42;
  if (arraySize >= 50) return 0.58;
  if (arraySize >= 30) return 0.78;
  return 1;
}

function sliderValueToDelay(sliderValue, arraySize = arrlen) {
  const min = Number(speedSlider.min) || 1;
  const max = Number(speedSlider.max) || 250;
  const value = Number(sliderValue);
  const normalized = clamp((value - min) / (max - min), 0, 1);

  const curve = Math.pow(1 - normalized, 3.6);
  const baseDelay = minStepDelay + curve * (maxStepDelay - minStepDelay);
  return Math.max(1, Math.round(baseDelay * getArraySpeedFactor(arraySize)));
}

function syncSpeedFromSlider(context = currentContext) {
  const arraySize = context.array.length || arrlen;
  context.speed = sliderValueToDelay(speedSlider.value, arraySize);
}

function getActiveViewName() {
  if (document.body.classList.contains("sorting-view")) {
    return "sorting-view";
  }

  if (document.body.classList.contains("searching-view")) {
    return "searching-view";
  }

  return "home";
}

function renderQuickTips(viewName = getActiveViewName()) {
  const activeTips = onboardingTips[viewName] ?? onboardingTips.home;

  quickTipsTitle.textContent = activeTips.title;
  quickTipsMessage.textContent = activeTips.message;
  quickTipsList.innerHTML = activeTips.bullets
    .map((bullet) => `<li>${bullet}</li>`)
    .join("");

  quickTips.hidden = !isGuideOpen;
  helpBtn.textContent = isGuideOpen ? "Hide Guide" : "Show Guide";
  helpBtn.setAttribute("aria-expanded", isGuideOpen ? "true" : "false");
}

function generateArray(context) {
  context.array.length = 0;

  const step = (targetMax - targetMin) / (arrlen - 1);

  for (let i = 0; i < arrlen; i++) {
    context.array.push(Math.round(targetMin + i * step));
  }

  for (let i = context.array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [context.array[i], context.array[j]] = [context.array[j], context.array[i]];
  }
}

const allUnique = (arr) => new Set(arr).size === arr.length;

function getUserArray() {
  stopAnimations(currentContext);
  currentContext.isUserArray = true;

  const userInput = arrBox.value.trim();
  currentContext.array = userInput
    .split(" ")
    .map(Number)
    .filter((n) => !Number.isNaN(n));

  if (currentContext.array.length !== arrlen) {
    arrlen = currentContext.array.length;
  }

  userArrLen.value = arrlen;
  currentContext.originalArray = [...currentContext.array];

  if (!allUnique(currentContext.originalArray)) {
    alert("Enter unique elements!");
  }

  currentContext.array = normalizeUserArray(currentContext.array);
  renderBars(currentContext, currentContext.array);
  currentContext.pendingSearchRestore = false;
  syncSpeedFromSlider(currentContext);
}

window.getUserArray = getUserArray;

function normalizeUserArray(arr) {
  const minArr = Math.min(...arr);
  const maxArr = Math.max(...arr);

  if (minArr === maxArr) {
    return arr.map(() => 200);
  }

  return arr.map((value) => {
    const normalized =
      ((value - minArr) / (maxArr - minArr)) * (targetMax - targetMin) +
      targetMin;
    return Math.round(normalized);
  });
}

function normalizeTarget(targetValue, originalArray) {
  const minArr = Math.min(...originalArray);
  const maxArr = Math.max(...originalArray);

  if (minArr === maxArr) {
    return 200;
  }

  const normalized =
    ((targetValue - minArr) / (maxArr - minArr)) * (targetMax - targetMin) +
    targetMin;
  return Math.round(normalized);
}

function renderBars(context, arr) {
  context.compareElem.textContent = 0;
  context.swapElem.textContent = 0;
  context.overwriteElem.textContent = 0;
  context.container.style.overflow = "hidden";
  context.visualBars = [];

  context.container.innerHTML = "";

  const indicator = document.createElement("div");
  indicator.id = "target_indicator";
  indicator.style.display = "none";
  context.targetIndicator = indicator;
  context.container.appendChild(indicator);

  const containerWidth = context.container.offsetWidth;
  const barWidth = containerWidth / arrlen - 2;

  arr.forEach((value, index) => {
    const bar = document.createElement("div");
    bar.style.height = `${value}px`;
    bar.style.width = `${barWidth}px`;
    bar.classList.add("bar");
    setBarLane(bar, index);

    if (context.isUserArray && context.originalArray.length > 0) {
      bar.dataset.height = context.originalArray[index];
    } else {
      bar.dataset.height = value;
    }

    context.visualBars.push(bar);
    context.container.appendChild(bar);
  });
}

async function runSort(sortFn, btn) {
  if (currentContext.isSorting) return;

  restoreArrayAfterBinarySearch(currentContext);
  stopAnimations(currentContext);

  btn.style.borderColor = "#4d50ff";
  currentContext.animations = new Animations();
  currentContext.isPaused = false;
  updatePlaybackControls(currentContext);
  sortStatus.textContent = `Sorting with ${btn.textContent}...`;

  const computeStart = performance.now();
  sortFn(currentContext.array, currentContext.animations);
  currentContext.algorithmRuntimeMs = performance.now() - computeStart;
  renderRealTimeStats(currentContext);

  startPlaybackMetrics(currentContext);
  await playAnimations(currentContext);
  stopPlaybackMetrics(
    currentContext,
    currentContext.animations.steps.length,
  );

  btn.style.borderColor = "#333333";
  sortStatus.textContent = "Sorted!";
}

async function runSearch(searchFn, btn, searchTarget) {
  if (currentContext.isSorting) return;

  restoreArrayAfterBinarySearch(currentContext);
  stopAnimations(currentContext);
  renderBars(currentContext, currentContext.array);

  btn.style.borderColor = "#4d50ff";
  currentContext.animations = new Animations();
  currentContext.isPaused = false;
  updatePlaybackControls(currentContext);
  searchStatus.textContent = `Searching for: ${searchTarget}`;

  const computeStart = performance.now();
  const result = searchFn(
    currentContext.array,
    searchTarget,
    currentContext.animations,
  );
  currentContext.algorithmRuntimeMs = performance.now() - computeStart;
  renderRealTimeStats(currentContext);

  if (result?.sortedArr) {
    renderBars(currentContext, result.sortedArr);
  }

  startPlaybackMetrics(currentContext);
  await playAnimations(currentContext);
  stopPlaybackMetrics(
    currentContext,
    currentContext.animations.steps.length,
  );

  if (result?.restore) {
    currentContext.pendingSearchRestore = true;
  }

  btn.style.borderColor = "#333333";
  searchStatus.textContent = result?.found
    ? `Found at index ${result.result}!`
    : "Not found";
}

function stopAnimations(context) {
  stopPlaybackMetrics(context, 0);
  context.isPaused = false;
  context.isSorting = false;
  resetBarTransforms(context);
  context.isSteppingMode = false;
  context.currentStepIndex = -1;
  context.animations = new Animations();
  resetRealTimeStats(context);

  updatePlaybackControls(context);
}

function restoreArrayAfterBinarySearch(context) {
  if (!context.pendingSearchRestore) return;

  renderBars(context, context.array);
  context.pendingSearchRestore = false;
}

function showView(viewName) {
  stopAnimations(currentContext);
  document.body.className = viewName;
  currentContext.pendingSearchRestore = false;
  currentContext.isUserArray = false;
  currentContext.originalArray = [];

  generateArray(currentContext);
  renderBars(currentContext, currentContext.array);
  searchStatus.textContent = "";
  sortStatus.textContent = "";
  syncSpeedFromSlider(currentContext);

  if (currentContext.targetIndicator) {
    currentContext.targetIndicator.style.display = "none";
  }

  renderQuickTips(viewName);
}

function showHome() {
  stopAnimations(currentContext);
  document.body.className = "";
  currentContext.container.innerHTML = "";
  currentContext.visualBars = [];
  currentContext.targetIndicator = null;
  currentContext.pendingSearchRestore = false;
  searchStatus.textContent = "";
  sortStatus.textContent = "";

  renderQuickTips("home");
}

sortBtn.addEventListener("click", () => {
  showView("sorting-view");
});

searchBtn.addEventListener("click", () => {
  showView("searching-view");
});

homeBtn.addEventListener("click", () => {
  showHome();
});

helpBtn.addEventListener("click", () => {
  isGuideOpen = !isGuideOpen;
  renderQuickTips();
});

document.addEventListener("click", (event) => {
  if (!isGuideOpen) return;

  const targetElement = event.target;
  if (!(targetElement instanceof Node)) return;

  if (quickTips.contains(targetElement) || helpBtn.contains(targetElement)) {
    return;
  }

  isGuideOpen = false;
  renderQuickTips();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isGuideOpen) {
    isGuideOpen = false;
    renderQuickTips();
  }
});

generateBtn.addEventListener("click", () => {
  stopAnimations(currentContext);
  currentContext.isUserArray = false;
  currentContext.originalArray = [];
  generateArray(currentContext);
  renderBars(currentContext, currentContext.array);
  currentContext.pendingSearchRestore = false;
  syncSpeedFromSlider(currentContext);
  arrBox.value = "";
  targetBox.value = "";
  searchStatus.textContent = "";
  sortStatus.textContent = "";

  if (currentContext.targetIndicator) {
    currentContext.targetIndicator.style.display = "none";
  }
});

pauseBtn.addEventListener("click", () => {
  if (!currentContext.isSorting) return;

  currentContext.isPaused = !currentContext.isPaused;
  if (currentContext.isPaused) {
    pausePlaybackMetrics(currentContext);
  } else {
    resumePlaybackMetrics(currentContext);
  }
  updatePlaybackControls(currentContext);
});

prevBtn.addEventListener("click", async () => {
  if (!currentContext.isSteppingMode || currentContext.currentStepIndex < 0) {
    return;
  }

  currentContext.isPaused = true;
  updatePlaybackControls(currentContext);

  const step = currentContext.animations.steps[currentContext.currentStepIndex];
  await animateStep(currentContext, step, true, steppingSpeed);

  currentContext.currentStepIndex--;
  updatePlaybackControls(currentContext);
});

nextBtn.addEventListener("click", async () => {
  if (
    !currentContext.isSteppingMode ||
    currentContext.currentStepIndex >= currentContext.animations.steps.length - 1
  ) {
    return;
  }

  currentContext.isPaused = true;
  updatePlaybackControls(currentContext);

  currentContext.currentStepIndex++;
  const step = currentContext.animations.steps[currentContext.currentStepIndex];
  await animateStep(currentContext, step, false, steppingSpeed);

  updatePlaybackControls(currentContext);
});

mergeBtn.addEventListener("click", () => runSort(mergeSort, mergeBtn));
heapBtn.addEventListener("click", () => runSort(heapSort, heapBtn));
quickBtn.addEventListener("click", () => runSort(quickSort, quickBtn));
bubbleBtn.addEventListener("click", () => runSort(bubbleSort, bubbleBtn));
selectionBtn.addEventListener("click", () =>
  runSort(selectionSort, selectionBtn),
);
insertionBtn.addEventListener("click", () =>
  runSort(insertionSort, insertionBtn),
);
shellBtn.addEventListener("click", () => runSort(shellSort, shellBtn));
radixBtn.addEventListener("click", () => runSort(radixSort, radixBtn));

binaryBtn.addEventListener("click", () => {
  target = targetBox.value;
  if (currentContext.isUserArray) {
    target = normalizeTarget(target, currentContext.originalArray);
  }
  if (target) {
    runSearch(binarySearch, binaryBtn, target);
  }
});

linearBtn.addEventListener("click", () => {
  target = targetBox.value;
  if (currentContext.isUserArray) {
    target = normalizeTarget(target, currentContext.originalArray);
  }
  if (target) {
    runSearch(linearSearch, linearBtn, target);
  }
});

jumpBtn.addEventListener("click", () => {
  target = targetBox.value;
  if (currentContext.isUserArray) {
    target = normalizeTarget(target, currentContext.originalArray);
  }
  if (target) {
    runSearch(jumpSearch, jumpBtn, target);
  }
});

interpolationBtn.addEventListener("click", () => {
  target = targetBox.value;
  if (currentContext.isUserArray) {
    target = normalizeTarget(target, currentContext.originalArray);
  }
  if (target) {
    runSearch(interpolationSearch, interpolationBtn, target);
  }
});

speedSlider.addEventListener("input", () => {
  syncSpeedFromSlider(currentContext);
});

userArrLen.addEventListener("input", () => {
  if (Number(userArrLen.value) <= 475) {
    arrlen = Number(userArrLen.value);
  } else {
    alert("Under 475 please!");
  }

  arrBox.value = "";
  targetBox.value = "";
  currentContext.isUserArray = false;
  currentContext.originalArray = [];
  generateArray(currentContext);
  renderBars(currentContext, currentContext.array);
  currentContext.pendingSearchRestore = false;
  syncSpeedFromSlider(currentContext);
});

targetBox.addEventListener("input", () => {
  if (currentContext.array.length !== 0) {
    renderBars(currentContext, currentContext.array);
  }
});

document.getElementById("random").addEventListener("click", () => {
  if (currentContext.array.length === 0) return;

  if (currentContext.isUserArray && currentContext.originalArray.length > 0) {
    const randomValue =
      currentContext.originalArray[
      Math.floor(Math.random() * currentContext.originalArray.length)
      ];
    targetBox.value = randomValue;
  } else {
    const randomValue =
      currentContext.array[
      Math.floor(Math.random() * currentContext.array.length)
      ];
    targetBox.value = randomValue;
  }
});

window.addEventListener("resize", () => {
  if (!currentContext.isSorting) {
    renderBars(currentContext, currentContext.array);
  }
});

syncSpeedFromSlider(currentContext);
updatePlaybackControls(currentContext);
renderRealTimeStats(currentContext);
renderQuickTips();
