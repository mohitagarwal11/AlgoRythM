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

class Animations {
  constructor() {
    this.steps = [];
  }
  compare(i, j) {
    this.steps.push({ type: "compare", indices: [i, j] });
  }
  overwrite(i, value) {
    this.steps.push({ type: "overwrite", indices: [i], values: [value] });
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
  highlight(i) {
    this.steps.push({ type: "highlight", indices: [i] });
  }
}

let animations = new Animations();
let array = [];
let originalArray = [];
let arrlen = 100;
let speed = speed_slider.value;
let target = targetBox.value;
let isPaused = false;
let isSorting = false;
let isUserArray = false;

const targetMin = 10;
const targetMax = 400;

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
  // console.log(array);
}

const allUnique = (arr) => new Set(arr).size === arr.length;
const getUserArray = () => {
  isUserArray = true;
  const userInput = document.getElementById("numbersInput").value;
  array = userInput
    .split(" ")
    .map(Number)
    .filter((n) => !isNaN(n));
  // console.log(array.length);
  if (array.length != arrlen) arrlen = array.length;
  userArrLen.value = arrlen;
  originalArray = [...array];
  // console.log("User Array:" + originalArray);
  array = normalizeUserArray(array);
  // console.log("Normalized: " + array);
  renderBars(array);
  if (!allUnique(array)) alert("Enter unique elements!");
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
  arrCon.innerHTML = "";

  const newIndicator = document.createElement("div");
  newIndicator.id = "target_indicator";
  arrCon.appendChild(newIndicator);

  const containerWidth = arrCon.offsetWidth;
  const barWidth = containerWidth / arrlen - 2;

  arr.forEach((value) => {
    const bar = document.createElement("div");
    bar.style.height = value + "px";
    bar.style.width = barWidth + "px";
    bar.classList.add("bar");
    bar.dataset.height = value;
    arrCon.appendChild(bar);
  });
}

async function runSort(sortFn, btn) {
  if (isSorting) return;

  btn.style.borderColor = "#4d50ff";
  animations.steps = [];
  isPaused = false;
  sortStatus.textContent = `Sorting with ${btn.textContent}...`;

  const result = sortFn(array);
  await playAnimations(speed, result);

  btn.style.borderColor = "#333333";
  sortStatus.textContent = `Sorted!`;
}

async function runSearch(searchFn, btn, target) {
  if (isSorting) return;

  btn.style.borderColor = "#4d50ff";
  animations.steps = [];
  isPaused = false;
  searchStatus.textContent = `Searching for: ${target}`;

  const result = searchFn(array, target);
  await playAnimations(speed, result);

  btn.style.borderColor = "#333333";

  if (result && result.found) {
    searchStatus.textContent = `Found at index ${result.result}!`;
  } else {
    searchStatus.textContent = `Not found`;
  }
}

async function playAnimations(speed, result) {
  const bars = document.getElementsByClassName("bar");
  const container = document.getElementById("array_container");

  isSorting = true;
  isPaused = false;

  for (const step of animations.steps) {
    if (!isSorting) break;
    while (isPaused) {
      await sleep(25);
    }

    if (step.type === "setTarget") {
      const targetHeight = step.value;
      const indicator = document.getElementById("target_indicator");
      if (indicator) {
        indicator.style.bottom = targetHeight + 5 + "px";
        indicator.style.display = "block";
      }
    }

    if (step.type === "scan") {
      const [i] = step.indices;
      for (let j = 0; j < i; j++) {
        bars[j].style.backgroundColor = "#666666";
      }
      bars[i].style.backgroundColor = "#00ffff";
      bars[i].style.boxShadow = "0 0 15px #00ffff";
      await sleep(speed);
      bars[i].style.boxShadow = "none";
    }

    if (step.type === "setRange") {
      const [left, right] = step.indices;

      for (let j = 0; j < bars.length; j++) {
        if (j >= left && j <= right) {
          bars[j].style.backgroundColor = "#ff4da6";
        } else {
          bars[j].style.backgroundColor = "#333333";
        }
      }
      await sleep(speed);
    }

    if (step.type === "pivot") {
      const [mid] = step.indices;

      bars[mid].style.backgroundColor = "#ffff00";
      bars[mid].style.boxShadow = "0 0 20px #ffff00";
      await sleep(speed * 1.5);
      bars[mid].style.boxShadow = "none";
    }

    if (step.type === "eliminate") {
      const [start, end] = step.indices;
      for (let j = start; j <= end; j++) {
        bars[j].style.backgroundColor = "#1a1a1a";
        await sleep(speed / 10);
      }
      await sleep(speed / 2);
    }

    if (step.type === "found") {
      const [i] = step.indices;

      for (let pulse = 0; pulse < 3; pulse++) {
        bars[i].style.backgroundColor = "#00ff00";
        bars[i].style.boxShadow = "0 0 30px #00ff00";
        await sleep(speed / 2);
        bars[i].style.backgroundColor = "#00cc00";
        bars[i].style.boxShadow = "0 0 10px #00ff00";
        await sleep(speed / 2);
      }

      bars[i].style.backgroundColor = "green";
      bars[i].style.boxShadow = "none";
    }

    if (step.type === "notFound") {
      for (let flash = 0; flash < 2; flash++) {
        for (let bar of bars) {
          bar.style.backgroundColor = "#ff3333";
        }
        await sleep(speed / 2);
        for (let bar of bars) {
          bar.style.backgroundColor = "#ff0000";
        }
        await sleep(speed / 2);
      }
    }

    if (step.type === "setPivot") {
      const [i] = step.indices;
      bars[i].style.backgroundColor = "#ffff00";
      bars[i].style.boxShadow = "0 0 15px #ffff00";
      await sleep(speed / 2);
    }

    if (step.type === "setPartition") {
      const [i] = step.indices;
      bars[i].style.backgroundColor = "#ff6600";
      await sleep(speed / 3);
    }

    if (step.type === "setSorted") {
      const [i] = step.indices;
      bars[i].style.backgroundColor = "#00ff00";
      bars[i].style.boxShadow = "0 0 10px #00ff00";
      await sleep(speed / 4);
      bars[i].style.boxShadow = "none";
      bars[i].style.backgroundColor = "#00cc00";
    }

    if (step.type === "highlight") {
      const [i] = step.indices;
      bars[i].style.backgroundColor = "#ffffff";
      await sleep(speed);
      bars[i].style.backgroundColor = "#ff4da6";
    }

    if (step.type === "compare") {
      const [i, j] = step.indices;
      bars[i].style.backgroundColor = "#00ffff";
      bars[i].style.boxShadow = "0 0 15px #00ffff";
      bars[j].style.backgroundColor = "#00ffff";
      bars[j].style.boxShadow = "0 0 15px #00ffff";
      await sleep(speed);
      bars[i].style.backgroundColor = "#ff4da6";
      bars[j].style.backgroundColor = "#ff4da6";
      bars[i].style.boxShadow = "none";
      bars[j].style.boxShadow = "none";
    }

    if (step.type === "overwrite") {
      const [i] = step.indices;
      const value = step.values[0];
      bars[i].style.height = value + "px";
      bars[i].style.backgroundColor = "#00ff88";
      await sleep(speed);
      bars[i].style.backgroundColor = "#ff4da6";
    }

    if (step.type === "swap") {
      const [i, j] = step.indices;

      bars[i].style.backgroundColor = "#ffffff";
      bars[j].style.backgroundColor = "#ffffff";

      let temp = bars[i].style.height;
      bars[i].style.height = bars[j].style.height;
      bars[j].style.height = temp;

      await sleep(speed);

      bars[i].style.backgroundColor = "#ff4da6";
      bars[j].style.backgroundColor = "#ff4da6";
    }
  }

  if (isSorting && Array.isArray(result)) {
    let i = 0;
    for (let bar of bars) {
      const barValue = parseInt(bar.style.height);
      if (barValue == result[i++]) {
        bar.style.backgroundColor = "green";
        bar.style.boxShadow = "0 0 8px #00ff00";
        await sleep(15);
        bar.style.boxShadow = "none";
      }
    }
  }
  isSorting = false;
}

function stopAnimations() {
  isPaused = false;
  pauseBtn.textContent = "Pause";
  isSorting = false;
  animations.steps = [];
}

function sleep() {
  return new Promise((resolve) => setTimeout(resolve, speed));
}

function showView(viewName) {
  document.body.className = viewName;

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
  pauseBtn.style.borderColor = "#333333";
  searchStatus.textContent = "";
  sortStatus.textContent = "";
  targetIndicator.style.display = "none";
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

generateBtn.addEventListener("click", () => {
  stopAnimations();
  generateArray();
  renderBars(array);
  arrBox.value = null;
  targetBox.value = null;
  pauseBtn.style.borderColor = "#333333";
  searchStatus.textContent = "";
  sortStatus.textContent = "";
  targetIndicator.style.display = "none";
});

pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  if (isPaused) {
    pauseBtn.textContent = "Resume";
    pauseBtn.style.borderColor = "#4d50ff";
  } else {
    pauseBtn.textContent = "Pause";
    pauseBtn.style.borderColor = "#333333";
  }
});

// Sorting
mergeBtn.addEventListener("click", () => runSort(mergeSort, mergeBtn));
bubbleBtn.addEventListener("click", () => runSort(bubbleSort, bubbleBtn));
quickBtn.addEventListener("click", () => runSort(quickSort, quickBtn));
selectionBtn.addEventListener("click", () =>
  runSort(selectionSort, selectionBtn)
);
heapBtn.addEventListener("click", () => runSort(heapSort, heapBtn));

// Searching
linearBtn.addEventListener("click", () => {
  target = targetBox.value;
  if (isUserArray) target = normalizeTarget(target, originalArray);
  // console.log("Target: " + target);
  if (target) runSearch(linearSearch, linearBtn, target);
});
binaryBtn.addEventListener("click", () => {
  target = targetBox.value;
  if (isUserArray) target = normalizeTarget(target, originalArray);
  // console.log("Target: " + target);
  if (target) runSearch(binarySearch, binaryBtn, target);
});

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
});

targetBox.addEventListener("input", () => {
  target = targetBox.value;
  if (array.length != 0) renderBars(array);
});
