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

const speed_slider = document.getElementById("speed_slider");
const userArrLen = document.getElementById("arrLen");
const targetBox = document.getElementById("target");
const arrBox = document.getElementById("numbersInput");
const targetIndicator = document.getElementById("target_indicator");
const searchStatus = document.getElementById("search_status");
const sortStatus = document.getElementById("sort_status");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

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
      previousValue: previousValue,
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
    this.steps.push({ type: "setTarget", value: value });
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

let animations = new Animations();
let array = [];
let originalArray = [];
let arrlen = userArrLen.value;
let speed = 251 - speed_slider.value;
let target = targetBox.value;
let isPaused = false;
let isSorting = false;
let isUserArray = false;
let pendingBinaryRestore = false;

let currentStepIndex = -1;
let isSteppingMode = false;
let steppingBars = null;
let steppingSpeed = 150;

const targetMin = 10;
const targetMax = 400;

function updatePlaybackControls() {
  const canPause = isSorting;
  pauseBtn.disabled = !canPause;

  if (!canPause) {
    pauseBtn.textContent = "Pause";
    pauseBtn.style.borderColor = "#333333";
  } else if (isPaused) {
    pauseBtn.textContent = "Resume";
    pauseBtn.style.borderColor = "#4d50ff";
  } else {
    pauseBtn.textContent = "Pause";
    pauseBtn.style.borderColor = "#333333";
  }

  const hasSteps =
    isSteppingMode && animations.steps.length > 0 && steppingBars;
  const canPrev = hasSteps && currentStepIndex > -1;
  const canNext =
    hasSteps && currentStepIndex < animations.steps.length - 1;

  prevBtn.disabled = !canPrev;
  nextBtn.disabled = !canNext;
  const stepBorder = hasSteps ? "#00ff00" : "#333333";
  prevBtn.style.borderColor = stepBorder;
  nextBtn.style.borderColor = stepBorder;
}

const userInput = arrBox.value;

function generateArray() {
  animations.steps = [];
  array.length = 0;

  const step = (targetMax - targetMin) / (arrlen - 1);

  for (let i = 0; i < arrlen; i++) {
    array.push(Math.round(targetMin + i * step));
  }
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const allUnique = (arr) => new Set(arr).size === arr.length;
const getUserArray = () => {
  stopAnimations();
  isUserArray = true;
  const userInput = arrBox.value;
  array = userInput
    .split(" ")
    .map(Number)
    .filter((n) => !isNaN(n));
  if (array.length != arrlen) arrlen = array.length;
  userArrLen.value = arrlen;
  originalArray = [...array];
  if (!allUnique(originalArray)) alert("Enter unique elements!");
  array = normalizeUserArray(array);
  renderBars(array);
  pendingBinaryRestore = false;
};

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

function renderBars(arr) {
  compareElem.textContent = 0;
  swapElem.textContent = 0;
  overwriteElem.textContent = 0;

  arrCon.innerHTML = "";

  const newIndicator = document.createElement("div");
  newIndicator.id = "target_indicator";
  arrCon.appendChild(newIndicator);

  const containerWidth = arrCon.offsetWidth;
  const barWidth = containerWidth / arrlen - 2;

  arr.forEach((value, index) => {
    const bar = document.createElement("div");
    bar.style.height = value + "px";
    bar.style.width = barWidth + "px";
    bar.classList.add("bar");

    if (isUserArray && originalArray.length > 0) {
      bar.dataset.height = originalArray[index];
    } else {
      bar.dataset.height = value;
    }

    arrCon.appendChild(bar);
  });
}

async function runSort(sortFn, btn) {
  if (isSorting) return;

  restoreArrayAfterBinarySearch();
  stopAnimations();

  btn.style.borderColor = "#4d50ff";
  animations.steps = [];
  isPaused = false;
  updatePlaybackControls();
  sortStatus.textContent = `Sorting with ${btn.textContent}...`;

  const result = sortFn(array);
  await playAnimations(speed, result);

  btn.style.borderColor = "#333333";
  sortStatus.textContent = `Sorted!`;
}

async function runSearch(searchFn, btn, target) {
  if (isSorting) return;

  restoreArrayAfterBinarySearch();
  stopAnimations();
  renderBars(array);

  btn.style.borderColor = "#4d50ff";
  animations.steps = [];
  isPaused = false;
  updatePlaybackControls();
  searchStatus.textContent = `Searching for: ${target}`;

  const result = searchFn(array, target);
  await playAnimations(speed, result);

  if (result && result.restore) {
    pendingBinaryRestore = true;
  }

  btn.style.borderColor = "#333333";

  if (result && result.found) {
    searchStatus.textContent = `Found at index ${result.result}!`;
  } else {
    searchStatus.textContent = `Not found`;
  }
}

async function animateStep(step, bars, animSpeed, isReverse = false) {
  if (step.type === "setTarget") {
    const targetHeight = step.value;
    const indicator = document.getElementById("target_indicator");
    if (indicator) {
      if (isReverse) {
        indicator.style.display = "none";
      } else {
        indicator.style.bottom = targetHeight + "px";
        indicator.style.display = "block";
      }
    }
  }

  if (step.type === "scan") {
    const [i] = step.indices;

    if (isReverse) {
      compareElem.textContent = Math.max(
        0,
        Number(compareElem.textContent) - 1,
      );
      bars[i].style.backgroundColor = "#ff8800";
      bars[i].style.boxShadow = "0 0 15px #ff8800";
      await sleep(animSpeed);
      bars[i].style.boxShadow = "none";
      bars[i].style.backgroundColor = "#ff4da6";
      if (i > 0) bars[i - 1].style.backgroundColor = "#ff4da6";
    } else {
      compareElem.textContent = Number(compareElem.textContent) + 1;
      for (let j = 0; j < i; j++) {
        bars[j].style.backgroundColor = "#666666";
      }
      bars[i].style.backgroundColor = "#00ffff";
      bars[i].style.boxShadow = "0 0 15px #00ffff";
      await sleep(animSpeed);
      bars[i].style.boxShadow = "none";
    }
  }

  if (step.type === "check") {
    if (isReverse) {
      compareElem.textContent = Math.max(
        0,
        Number(compareElem.textContent) - 1,
      );
    } else {
      compareElem.textContent = Number(compareElem.textContent) + 1;
    }
  }

  if (step.type === "setRange") {
    const [left, right] = step.indices;

    if (isReverse) {
      for (let j = 0; j < bars.length; j++) {
        bars[j].style.backgroundColor = "#ff4da6";
      }
    } else {
      for (let j = 0; j < bars.length; j++) {
        if (j >= left && j <= right) {
          bars[j].style.backgroundColor = "#ff4da6";
        } else {
          bars[j].style.backgroundColor = "#333333";
        }
      }
      await sleep(animSpeed);
    }
  }

  if (step.type === "pivot") {
    const [mid] = step.indices;

    if (isReverse) {
      bars[mid].style.backgroundColor = "#ff8800";
      bars[mid].style.boxShadow = "0 0 20px #ff8800";
      await sleep(animSpeed);
      bars[mid].style.backgroundColor = "#ff4da6";
      bars[mid].style.boxShadow = "none";
    } else {
      bars[mid].style.backgroundColor = "#ffff00";
      bars[mid].style.boxShadow = "0 0 20px #ffff00";
      await sleep(animSpeed * 1.5);
      bars[mid].style.boxShadow = "none";
    }
  }

  if (step.type === "eliminate") {
    const [start, end] = step.indices;

    if (isReverse) {
      for (let j = start; j <= end; j++) {
        bars[j].style.backgroundColor = "#ff4da6";
      }
    } else {
      for (let j = start; j <= end; j++) {
        bars[j].style.backgroundColor = "#1a1a1a";
      }
      await sleep(animSpeed * 2);
    }
  }

  if (step.type === "found") {
    const [i] = step.indices;

    if (isReverse) {
      bars[i].style.backgroundColor = "#ff8800";
      bars[i].style.boxShadow = "0 0 20px #ff8800";
      await sleep(animSpeed);
      bars[i].style.backgroundColor = "#ff4da6";
      bars[i].style.boxShadow = "none";
    } else {
      for (let pulse = 0; pulse < 3; pulse++) {
        bars[i].style.backgroundColor = "#00ff00";
        bars[i].style.boxShadow = "0 0 30px #00ff00";
        await sleep(animSpeed / 2);
        bars[i].style.backgroundColor = "#00cc00";
        bars[i].style.boxShadow = "0 0 10px #00ff00";
        await sleep(animSpeed / 2);
      }
      bars[i].style.backgroundColor = "green";
      bars[i].style.boxShadow = "none";
    }
  }

  if (step.type === "notFound") {
    if (isReverse) {
      for (let bar of bars) {
        bar.style.backgroundColor = "#ff8800";
      }
      await sleep(animSpeed / 2);
      for (let bar of bars) {
        bar.style.backgroundColor = "#ff4da6";
      }
    } else {
      for (let flash = 0; flash < 2; flash++) {
        for (let bar of bars) {
          bar.style.backgroundColor = "#ff3333";
        }
        await sleep(animSpeed / 2);
        for (let bar of bars) {
          bar.style.backgroundColor = "#ff0000";
        }
        await sleep(animSpeed / 2);
      }
    }
  }

  if (step.type === "setPivot") {
    const [i] = step.indices;

    if (isReverse) {
      bars[i].style.backgroundColor = "#ff8800";
      bars[i].style.boxShadow = "0 0 15px #ff8800";
      await sleep(animSpeed / 2);
      bars[i].style.backgroundColor = "#ff4da6";
      bars[i].style.boxShadow = "none";
    } else {
      bars[i].style.backgroundColor = "#ffff00";
      bars[i].style.boxShadow = "0 0 15px #ffff00";
      await sleep(animSpeed / 2);
    }
  }

  if (step.type === "setPartition") {
    const [i] = step.indices;

    if (isReverse) {
      bars[i].style.backgroundColor = "#ff4da6";
    } else {
      bars[i].style.backgroundColor = "#ff6600";
      await sleep(animSpeed / 3);
    }
  }

  if (step.type === "setSorted") {
    const [i] = step.indices;

    if (isReverse) {
      bars[i].style.backgroundColor = "#ff8800";
      bars[i].style.boxShadow = "0 0 10px #ff8800";
      await sleep(animSpeed / 2);
      bars[i].style.boxShadow = "none";
      bars[i].style.backgroundColor = "#ff4da6";
    } else {
      bars[i].style.backgroundColor = "#00ff00";
      bars[i].style.boxShadow = "0 0 10px #00ff00";
      await sleep(animSpeed / 4);
      bars[i].style.boxShadow = "none";
      bars[i].style.backgroundColor = "#00cc00";
    }
  }

  if (step.type === "compare") {
    const [i, j] = step.indices;

    if (isReverse) {
      compareElem.textContent = Math.max(
        0,
        Number(compareElem.textContent) - 1,
      );
      bars[i].style.backgroundColor = "#ff8800";
      bars[i].style.boxShadow = "0 0 15px #ff8800";
      bars[j].style.backgroundColor = "#ff8800";
      bars[j].style.boxShadow = "0 0 15px #ff8800";
      await sleep(animSpeed);
      bars[i].style.backgroundColor = "#ff4da6";
      bars[j].style.backgroundColor = "#ff4da6";
      bars[i].style.boxShadow = "none";
      bars[j].style.boxShadow = "none";
    } else {
      compareElem.textContent = Number(compareElem.textContent) + 1;
      bars[i].style.backgroundColor = "#00ffff";
      bars[i].style.boxShadow = "0 0 15px #00ffff";
      bars[j].style.backgroundColor = "#00ffff";
      bars[j].style.boxShadow = "0 0 15px #00ffff";
      await sleep(animSpeed);
      bars[i].style.backgroundColor = "#ff4da6";
      bars[j].style.backgroundColor = "#ff4da6";
      bars[i].style.boxShadow = "none";
      bars[j].style.boxShadow = "none";
    }
  }

  if (step.type === "overwrite") {
    const [i] = step.indices;
    const value = step.values[0];

    if (isReverse) {
      if (step.previousValue !== undefined) {
        bars[i].style.height = step.previousValue + "px";
      }
      bars[i].style.backgroundColor = "#ff8800";
      await sleep(animSpeed);
      bars[i].style.backgroundColor = "#ff4da6";
      overwriteElem.textContent = Math.max(
        0,
        Number(overwriteElem.textContent) - 1,
      );
    } else {
      step.previousValue = parseInt(bars[i].style.height);
      overwriteElem.textContent = Number(overwriteElem.textContent) + 1;
      bars[i].style.height = value + "px";
      bars[i].style.backgroundColor = "#ff0000";
      await sleep(animSpeed);
      bars[i].style.backgroundColor = "#ff4da6";
    }
  }

  if (step.type === "swap") {
    const [i, j] = step.indices;

    if (isReverse) {
      swapElem.textContent = Math.max(0, Number(swapElem.textContent) - 1);

      bars[i].style.backgroundColor = "#ff8800";
      bars[j].style.backgroundColor = "#ff8800";
      bars[i].style.boxShadow = "0 0 15px #ff8800";
      bars[j].style.boxShadow = "0 0 15px #ff8800";

      await sleep(animSpeed / 2);

      if (step.previousHeights) {
        bars[i].style.height = step.previousHeights[0];
        bars[j].style.height = step.previousHeights[1];
      } else {
        let temp = bars[i].style.height;
        bars[i].style.height = bars[j].style.height;
        bars[j].style.height = temp;
      }

      if (step.previousData) {
        bars[i].dataset.height = step.previousData[0];
        bars[j].dataset.height = step.previousData[1];
      } else {
        let tempData = bars[i].dataset.height;
        bars[i].dataset.height = bars[j].dataset.height;
        bars[j].dataset.height = tempData;
      }

      await sleep(animSpeed / 2);

      bars[i].style.backgroundColor = "#ff4da6";
      bars[j].style.backgroundColor = "#ff4da6";
      bars[i].style.boxShadow = "none";
      bars[j].style.boxShadow = "none";
    } else {
      swapElem.textContent = Number(swapElem.textContent) + 1;
      bars[i].style.backgroundColor = "#ff0000";
      bars[j].style.backgroundColor = "#ff0000";
      bars[i].style.boxShadow = "0 0 15px #ff0000";
      bars[j].style.boxShadow = "0 0 15px #ff0000";

      await sleep(animSpeed / 2);

      step.previousHeights = [bars[i].style.height, bars[j].style.height];
      step.previousData = [bars[i].dataset.height, bars[j].dataset.height];
      let temp = bars[i].style.height;
      bars[i].style.height = bars[j].style.height;
      bars[j].style.height = temp;
      let tempData = bars[i].dataset.height;
      bars[i].dataset.height = bars[j].dataset.height;
      bars[j].dataset.height = tempData;

      await sleep(animSpeed / 2);

      bars[i].style.backgroundColor = "#ff4da6";
      bars[j].style.backgroundColor = "#ff4da6";
      bars[i].style.boxShadow = "none";
      bars[j].style.boxShadow = "none";
    }
  }
}

async function playAnimations(animSpeed, result) {
  const bars = document.getElementsByClassName("bar");

  steppingBars = bars;

  isSorting = true;
  isPaused = false;
  isSteppingMode = false;
  currentStepIndex = -1;
  updatePlaybackControls();

  for (let i = 0; i < animations.steps.length; i++) {
    currentStepIndex = i;
    const step = animations.steps[i];

    if (!isSorting) break;
    while (isPaused) {
      await sleep(25);
    }

    await animateStep(step, bars, animSpeed, false);
  }

  isSorting = false;

  isSteppingMode = true;
  updatePlaybackControls();
}

function stopAnimations() {
  isPaused = false;
  isSorting = false;

  isSteppingMode = false;
  currentStepIndex = -1;
  animations.steps = [];

  updatePlaybackControls();
}

function restoreArrayAfterBinarySearch() {
  if (!pendingBinaryRestore) return;
  renderBars(array);
  pendingBinaryRestore = false;
}

function sleep() {
  return new Promise((resolve) => setTimeout(resolve, speed));
}

function showView(viewName) {
  stopAnimations();
  document.body.className = viewName;
  pendingBinaryRestore = false;

  if (viewName === "sorting-view") {
    generateArray();
    renderBars(array);
    searchStatus.textContent = "";
    sortStatus.textContent = "";
    targetIndicator.style.display = "none";
  } else if (viewName === "searching-view") {
    generateArray();
    renderBars(array);
    searchStatus.textContent = "";
    sortStatus.textContent = "";
  }
}

function showHome() {
  stopAnimations();
  document.body.className = "";
  arrCon.innerHTML = "";
  pendingBinaryRestore = false;
  searchStatus.textContent = "";
  sortStatus.textContent = "";
  targetIndicator.style.display = "none";
}

// Buttons general
sortBtn.addEventListener("click", () => {
  showView("sorting-view");
});

searchBtn.addEventListener("click", () => {
  showView("searching-view");
});

homeBtn.addEventListener("click", () => {
  showHome();
});

generateBtn.addEventListener("click", () => {
  stopAnimations();
  isUserArray = false;
  originalArray = [];
  generateArray();
  renderBars(array);
  pendingBinaryRestore = false;
  arrBox.value = null;
  targetBox.value = null;
  searchStatus.textContent = "";
  sortStatus.textContent = "";
  targetIndicator.style.display = "none";
});

pauseBtn.addEventListener("click", () => {
  if (!isSorting) return;
  isPaused = !isPaused;
  updatePlaybackControls();
});

prevBtn.addEventListener("click", async () => {
  if (!isSteppingMode || currentStepIndex < 0 || !steppingBars) {
    console.log("Cannot go to previous step");
    return;
  }

  isPaused = true;
  updatePlaybackControls();

  const step = animations.steps[currentStepIndex];
  await animateStep(step, steppingBars, steppingSpeed, true);
  currentStepIndex--;
  updatePlaybackControls();

  // console.log("Went to Prev step: ${currentStepIndex + 1}");
});

nextBtn.addEventListener("click", async () => {
  if (
    !isSteppingMode ||
    currentStepIndex >= animations.steps.length - 1 ||
    !steppingBars
  ) {
    console.log("Cannot go to next step");
    return;
  }

  isPaused = true;
  updatePlaybackControls();

  currentStepIndex++;
  const step = animations.steps[currentStepIndex];
  await animateStep(step, steppingBars, steppingSpeed, false);
  updatePlaybackControls();

  // console.log("Went to next step: ${currentStepIndex + 1}");
});

// Sorting
mergeBtn.addEventListener("click", () => runSort(mergeSort, mergeBtn));
heapBtn.addEventListener("click", () => runSort(heapSort, heapBtn));
quickBtn.addEventListener("click", () => runSort(quickSort, quickBtn));
bubbleBtn.addEventListener("click", () => runSort(bubbleSort, bubbleBtn));
selectionBtn.addEventListener("click", () =>
  runSort(selectionSort, selectionBtn),
);

// Searching
binaryBtn.addEventListener("click", () => {
  target = targetBox.value;
  if (isUserArray) target = normalizeTarget(target, originalArray);
  if (target) runSearch(binarySearch, binaryBtn, target);
});
linearBtn.addEventListener("click", () => {
  target = targetBox.value;
  if (isUserArray) target = normalizeTarget(target, originalArray);
  if (target) runSearch(linearSearch, linearBtn, target);
});

// Utility stuff
speed_slider.addEventListener("input", () => {
  speed = 251 - speed_slider.value;
});

userArrLen.addEventListener("input", () => {
  if (userArrLen.value <= 475) arrlen = userArrLen.value;
  else alert("Under 475 please!");

  arrBox.value = null;
  targetBox.value = null;

  isUserArray = false;
  generateArray();
  renderBars(array);
  pendingBinaryRestore = false;
});

targetBox.addEventListener("input", () => {
  if (array.length != 0) renderBars(array);
});

document.getElementById("random").addEventListener("click", () => {
  if (array.length == 0) return;

  if (isUserArray && originalArray.length > 0) {
    const randomValue =
      originalArray[Math.floor(Math.random() * originalArray.length)];
    targetBox.value = randomValue;
  } else {
    const randomValue = array[Math.floor(Math.random() * array.length)];
    targetBox.value = randomValue;
  }
});

window.addEventListener("resize", () => {
  if (!isSorting) renderBars(array);
});

updatePlaybackControls();
