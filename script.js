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

const linearBtn = document.getElementById("linear");
const binaryBtn = document.getElementById("binary");

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
    pendingBinaryRestore: false,
    isUserArray: false,
    compareElem,
    swapElem,
    overwriteElem,
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
      "Begin with Bubble Sort or Selection Sort to understand basic patterns.",
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
    ],
  },
};

let arrlen = Number(userArrLen.value);
let target = targetBox.value;

const targetMin = 10;
const targetMax = 400;
const minStepDelay = 12;
const maxStepDelay = 1300;
const steppingSpeed = 150;

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

function sliderValueToDelay(sliderValue) {
  const min = Number(speedSlider.min) || 1;
  const max = Number(speedSlider.max) || 250;
  const value = Number(sliderValue);
  const normalized = clamp((value - min) / (max - min), 0, 1);

  const curve = Math.pow(1 - normalized, 2.4);
  return Math.round(minStepDelay + curve * (maxStepDelay - minStepDelay));
}

function syncSpeedFromSlider(context = currentContext) {
  context.speed = sliderValueToDelay(speedSlider.value);
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
  currentContext.pendingBinaryRestore = false;
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

  sortFn(currentContext.array, currentContext.animations);
  await playAnimations(currentContext);

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

  const result = searchFn(
    currentContext.array,
    searchTarget,
    currentContext.animations,
  );

  if (result?.sortedArr) {
    renderBars(currentContext, result.sortedArr);
  }

  await playAnimations(currentContext);

  if (result?.restore) {
    currentContext.pendingBinaryRestore = true;
  }

  btn.style.borderColor = "#333333";
  searchStatus.textContent = result?.found
    ? `Found at index ${result.result}!`
    : "Not found";
}

function stopAnimations(context) {
  context.isPaused = false;
  context.isSorting = false;
  resetBarTransforms(context);
  context.isSteppingMode = false;
  context.currentStepIndex = -1;
  context.animations = new Animations();

  updatePlaybackControls(context);
}

function restoreArrayAfterBinarySearch(context) {
  if (!context.pendingBinaryRestore) return;

  renderBars(context, context.array);
  context.pendingBinaryRestore = false;
}

function showView(viewName) {
  stopAnimations(currentContext);
  document.body.className = viewName;
  currentContext.pendingBinaryRestore = false;
  currentContext.isUserArray = false;
  currentContext.originalArray = [];

  generateArray(currentContext);
  renderBars(currentContext, currentContext.array);
  searchStatus.textContent = "";
  sortStatus.textContent = "";

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
  currentContext.pendingBinaryRestore = false;
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
  currentContext.pendingBinaryRestore = false;
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
  currentContext.pendingBinaryRestore = false;
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
renderQuickTips();
