function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getBarsSnapshot(context) {
  return context.visualBars.slice();
}

function resetBarTransforms(context) {
  const bars = context.container.querySelectorAll(".bar");
  bars.forEach((bar) => {
    bar.style.transform = "";
    bar.style.willChange = "";
  });
}

function getBarAt(context, index) {
  return context.visualBars[index] || null;
}

function setBarLane(bar, laneIndex) {
  bar.dataset.lane = String(laneIndex);
  bar.style.order = String(laneIndex);
}

function swapVisualBars(context, i, j) {
  if (i === j) return;

  const first = getBarAt(context, i);
  const second = getBarAt(context, j);
  if (!first || !second) return;

  context.visualBars[i] = second;
  context.visualBars[j] = first;
  setBarLane(second, i);
  setBarLane(first, j);
}

function computeAnimDuration(baseSpeed, multiplier, minMs, maxMs) {
  const scaled = Math.round(baseSpeed * multiplier);

  if (typeof maxMs === "number") {
    const adaptiveMax = Math.max(maxMs, Math.round(baseSpeed * 1.15));
    return clamp(scaled, minMs, adaptiveMax);
  }

  return Math.max(minMs, scaled);
}

function waitMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function animateElement(element, keyframes, options) {
  if (!element) return;

  if (typeof element.animate === "function") {
    const animation = element.animate(keyframes, options);
    const keepsFinalFrame = options?.fill === "forwards";
    try {
      await animation.finished;
    } catch (_) {
      // Ignore interrupted animations.
    } finally {
      if (!keepsFinalFrame) {
        animation.cancel();
      }
    }
    return;
  }

  const fallbackDuration = options?.duration ?? 120;
  await waitMs(fallbackDuration);
}

async function animateSwapMotion(context, i, j, animSpeed = context.speed) {
  if (i === j) return;

  resetBarTransforms(context);

  const firstBar = getBarAt(context, i);
  const secondBar = getBarAt(context, j);
  if (!firstBar || !secondBar) return;

  const firstRect = firstBar.getBoundingClientRect();
  const secondRect = secondBar.getBoundingClientRect();
  const xDelta = secondRect.left - firstRect.left;
  if (!xDelta) {
    swapVisualBars(context, i, j);
    return;
  }

  const bars = getBarsSnapshot(context);
  const travelDuration = computeAnimDuration(animSpeed, 0.55, 18, 140);
  const lift = bars.length > 220 ? 4 : 8;

  firstBar.style.willChange = "transform";
  secondBar.style.willChange = "transform";

  try {
    await Promise.all([
      animateElement(
        firstBar,
        [
          { transform: "translate(0px, 0px)" },
          { transform: `translate(${xDelta}px, ${-lift}px)` },
          { transform: `translate(${xDelta}px, 0px)` },
        ],
        { duration: travelDuration, easing: "ease-in-out", fill: "none" },
      ),
      animateElement(
        secondBar,
        [
          { transform: "translate(0px, 0px)" },
          { transform: `translate(${-xDelta}px, ${-lift}px)` },
          { transform: `translate(${-xDelta}px, 0px)` },
        ],
        { duration: travelDuration, easing: "ease-in-out", fill: "none" },
      ),
    ]);
  } finally {
    firstBar.style.transform = "";
    secondBar.style.transform = "";
    firstBar.style.willChange = "";
    secondBar.style.willChange = "";
  }

  swapVisualBars(context, i, j);
}

async function animateCompareWiggle(
  context,
  indices,
  isReverse,
  animSpeed = context.speed,
) {
  const bars = getBarsSnapshot(context);
  const amplitudeX = bars.length > 220 ? 1 : 2;
  const amplitudeY = bars.length > 220 ? 1 : 2;
  const duration = computeAnimDuration(animSpeed, 0.25, 10, 55);
  const easing = isReverse ? "ease-in" : "ease-out";

  const wiggles = indices.map((idx, position) => {
    const bar = getBarAt(context, idx);
    if (!bar) return Promise.resolve();

    const direction = position % 2 === 0 ? 1 : -1;

    return animateElement(
      bar,
      [
        { transform: "translate(0px, 0px)" },
        {
          transform: `translate(${direction * amplitudeX}px, ${-amplitudeY}px)`,
        },
        {
          transform: `translate(${-direction * amplitudeX}px, ${-(amplitudeY / 2)}px)`,
        },
        { transform: "translate(0px, 0px)" },
      ],
      { duration, easing, fill: "none" },
    );
  });

  await Promise.all(wiggles);
}

async function animateStep(
  context,
  step,
  isReverse = false,
  animSpeed = context.speed,
) {
  const bars = getBarsSnapshot(context);

  if (step.type === "setTarget") {
    const indicator =
      context.targetIndicator ??
      context.container.querySelector("#target_indicator");

    if (indicator) {
      context.targetIndicator = indicator;
      if (isReverse) {
        indicator.style.display = "none";
      } else {
        indicator.style.bottom = `${step.value}px`;
        indicator.style.display = "block";
      }
    }
  }

  if (step.type === "scan") {
    const [i] = step.indices;
    const bar = getBarAt(context, i);
    if (!bar) return;

    if (isReverse) {
      context.compareElem.textContent = Math.max(
        0,
        Number(context.compareElem.textContent) - 1,
      );
      bar.style.backgroundColor = "#ff8800";
      bar.style.boxShadow = "0 0 15px #ff8800";
      await sleep(animSpeed);
      bar.style.boxShadow = "none";
      bar.style.backgroundColor = "#ff4da6";

      const previousBar = getBarAt(context, i - 1);
      if (previousBar) {
        previousBar.style.backgroundColor = "#ff4da6";
      }
    } else {
      context.compareElem.textContent =
        Number(context.compareElem.textContent) + 1;
      for (let j = 0; j < i; j++) {
        const scannedBar = getBarAt(context, j);
        if (scannedBar) {
          scannedBar.style.backgroundColor = "#666666";
        }
      }
      bar.style.backgroundColor = "#00ffff";
      bar.style.boxShadow = "0 0 15px #00ffff";
      await sleep(animSpeed);
      bar.style.boxShadow = "none";
    }
  }

  if (step.type === "check") {
    if (isReverse) {
      context.compareElem.textContent = Math.max(
        0,
        Number(context.compareElem.textContent) - 1,
      );
    } else {
      context.compareElem.textContent =
        Number(context.compareElem.textContent) + 1;
    }
  }

  if (step.type === "setRange") {
    const [left, right] = step.indices;

    for (let j = 0; j < bars.length; j++) {
      const bar = getBarAt(context, j);
      if (!bar) continue;

      if (isReverse) {
        bar.style.backgroundColor = "#ff4da6";
      } else if (j >= left && j <= right) {
        bar.style.backgroundColor = "#ff4da6";
      } else {
        bar.style.backgroundColor = "#333333";
      }
    }

    if (!isReverse) {
      await sleep(animSpeed);
    }
  }

  if (step.type === "pivot") {
    const [mid] = step.indices;
    const bar = getBarAt(context, mid);
    if (!bar) return;

    if (isReverse) {
      bar.style.backgroundColor = "#ff8800";
      bar.style.boxShadow = "0 0 20px #ff8800";
      await sleep(animSpeed);
      bar.style.backgroundColor = "#ff4da6";
      bar.style.boxShadow = "none";
    } else {
      bar.style.backgroundColor = "#ffff00";
      bar.style.boxShadow = "0 0 20px #ffff00";
      await sleep(animSpeed * 1.5);
      bar.style.boxShadow = "none";
    }
  }

  if (step.type === "eliminate") {
    const [start, end] = step.indices;

    for (let j = start; j <= end; j++) {
      const bar = getBarAt(context, j);
      if (!bar) continue;

      bar.style.backgroundColor = isReverse ? "#ff4da6" : "#1a1a1a";
    }

    if (!isReverse) {
      await sleep(animSpeed * 2);
    }
  }

  if (step.type === "found") {
    const [i] = step.indices;
    const bar = getBarAt(context, i);
    if (!bar) return;

    if (isReverse) {
      bar.style.backgroundColor = "#ff8800";
      bar.style.boxShadow = "0 0 20px #ff8800";
      await sleep(animSpeed);
      bar.style.backgroundColor = "#ff4da6";
      bar.style.boxShadow = "none";
    } else {
      for (let pulse = 0; pulse < 3; pulse++) {
        bar.style.backgroundColor = "#00ff00";
        bar.style.boxShadow = "0 0 30px #00ff00";
        await sleep(animSpeed / 2);
        bar.style.backgroundColor = "#00cc00";
        bar.style.boxShadow = "0 0 10px #00ff00";
        await sleep(animSpeed / 2);
      }
      bar.style.backgroundColor = "green";
      bar.style.boxShadow = "none";
    }
  }

  if (step.type === "notFound") {
    if (isReverse) {
      for (const bar of bars) {
        bar.style.backgroundColor = "#ff8800";
      }
      await sleep(animSpeed / 2);
      for (const bar of bars) {
        bar.style.backgroundColor = "#ff4da6";
      }
    } else {
      for (let flash = 0; flash < 2; flash++) {
        for (const bar of bars) {
          bar.style.backgroundColor = "#ff3333";
        }
        await sleep(animSpeed / 2);
        for (const bar of bars) {
          bar.style.backgroundColor = "#ff0000";
        }
        await sleep(animSpeed / 2);
      }
    }
  }

  if (step.type === "setPivot") {
    const [i] = step.indices;
    const bar = getBarAt(context, i);
    if (!bar) return;

    if (isReverse) {
      bar.style.backgroundColor = "#ff8800";
      bar.style.boxShadow = "0 0 15px #ff8800";
      await sleep(animSpeed / 2);
      bar.style.backgroundColor = "#ff4da6";
      bar.style.boxShadow = "none";
    } else {
      bar.style.backgroundColor = "#ffff00";
      bar.style.boxShadow = "0 0 15px #ffff00";
      await sleep(animSpeed / 2);
    }
  }

  if (step.type === "setPartition") {
    const [i] = step.indices;
    const bar = getBarAt(context, i);
    if (!bar) return;

    if (isReverse) {
      bar.style.backgroundColor = "#ff4da6";
    } else {
      bar.style.backgroundColor = "#ff6600";
      await sleep(animSpeed / 3);
    }
  }

  if (step.type === "setSorted") {
    const [i] = step.indices;
    const bar = getBarAt(context, i);
    if (!bar) return;

    if (isReverse) {
      bar.style.backgroundColor = "#ff8800";
      bar.style.boxShadow = "0 0 10px #ff8800";
      await sleep(animSpeed / 2);
      bar.style.boxShadow = "none";
      bar.style.backgroundColor = "#ff4da6";
    } else {
      bar.style.backgroundColor = "#00ff00";
      bar.style.boxShadow = "0 0 10px #00ff00";
      await sleep(animSpeed / 4);
      bar.style.boxShadow = "none";
      bar.style.backgroundColor = "#00cc00";
    }
  }

  if (step.type === "compare") {
    const [i, j] = step.indices;
    const leftBar = getBarAt(context, i);
    const rightBar = getBarAt(context, j);
    if (!leftBar || !rightBar) return;

    if (isReverse) {
      context.compareElem.textContent = Math.max(
        0,
        Number(context.compareElem.textContent) - 1,
      );
      leftBar.style.backgroundColor = "#ff8800";
      leftBar.style.boxShadow = "0 0 15px #ff8800";
      rightBar.style.backgroundColor = "#ff8800";
      rightBar.style.boxShadow = "0 0 15px #ff8800";
      await animateCompareWiggle(context, [i, j], true, animSpeed);
      leftBar.style.backgroundColor = "#ff4da6";
      rightBar.style.backgroundColor = "#ff4da6";
      leftBar.style.boxShadow = "none";
      rightBar.style.boxShadow = "none";
    } else {
      context.compareElem.textContent =
        Number(context.compareElem.textContent) + 1;
      leftBar.style.backgroundColor = "#00ffff";
      leftBar.style.boxShadow = "0 0 15px #00ffff";
      rightBar.style.backgroundColor = "#00ffff";
      rightBar.style.boxShadow = "0 0 15px #00ffff";
      await animateCompareWiggle(context, [i, j], false, animSpeed);
      leftBar.style.backgroundColor = "#ff4da6";
      rightBar.style.backgroundColor = "#ff4da6";
      leftBar.style.boxShadow = "none";
      rightBar.style.boxShadow = "none";
    }
  }

  if (step.type === "overwrite") {
    const [i] = step.indices;
    const value = step.values[0];
    const bar = getBarAt(context, i);
    if (!bar) return;

    if (isReverse) {
      if (step.previousValue !== undefined) {
        const previousHeight = parseInt(step.previousValue, 10);
        const previousData =
          step.previousData !== undefined
            ? step.previousData
            : String(previousHeight);

        bar.style.backgroundColor = "#ff8800";
        bar.style.boxShadow = "0 0 15px #ff8800";
        await animateElement(
          bar,
          [
            { height: `${parseInt(bar.style.height, 10)}px` },
            { height: `${previousHeight}px` },
          ],
          {
            duration: computeAnimDuration(animSpeed, 0.45, 16, 110),
            easing: "ease-out",
            fill: "forwards",
          },
        );

        bar.style.height = `${previousHeight}px`;
        bar.dataset.height = previousData;
        bar.style.boxShadow = "none";
      } else {
        bar.style.backgroundColor = "#ff8800";
        await waitMs(computeAnimDuration(animSpeed, 0.3, 12, 60));
      }

      bar.style.backgroundColor = "#ff4da6";
      context.overwriteElem.textContent = Math.max(
        0,
        Number(context.overwriteElem.textContent) - 1,
      );
    } else {
      step.previousValue = parseInt(bar.style.height, 10);
      step.previousData = bar.dataset.height;

      context.overwriteElem.textContent =
        Number(context.overwriteElem.textContent) + 1;
      bar.style.backgroundColor = "#ff0000";
      bar.style.boxShadow = "0 0 15px #ff0000";
      await animateElement(
        bar,
        [{ height: `${step.previousValue}px` }, { height: `${value}px` }],
        {
          duration: computeAnimDuration(animSpeed, 0.45, 16, 110),
          easing: "ease-in-out",
          fill: "forwards",
        },
      );

      bar.style.height = `${value}px`;
      bar.dataset.height = String(value);
      bar.style.boxShadow = "none";
      bar.style.backgroundColor = "#ff4da6";
    }
  }

  if (step.type === "swap") {
    const [i, j] = step.indices;
    const firstBar = getBarAt(context, i);
    const secondBar = getBarAt(context, j);
    if (!firstBar || !secondBar) return;

    if (isReverse) {
      context.swapElem.textContent = Math.max(
        0,
        Number(context.swapElem.textContent) - 1,
      );
      firstBar.style.backgroundColor = "#ff8800";
      secondBar.style.backgroundColor = "#ff8800";
      firstBar.style.boxShadow = "0 0 15px #ff8800";
      secondBar.style.boxShadow = "0 0 15px #ff8800";

      await animateSwapMotion(context, i, j, animSpeed);

      const reverseFirst = getBarAt(context, i);
      const reverseSecond = getBarAt(context, j);
      if (reverseFirst) {
        reverseFirst.style.backgroundColor = "#ff4da6";
        reverseFirst.style.boxShadow = "none";
      }
      if (reverseSecond) {
        reverseSecond.style.backgroundColor = "#ff4da6";
        reverseSecond.style.boxShadow = "none";
      }
    } else {
      context.swapElem.textContent =
        Number(context.swapElem.textContent) + 1;
      firstBar.style.backgroundColor = "#ff0000";
      secondBar.style.backgroundColor = "#ff0000";
      firstBar.style.boxShadow = "0 0 15px #ff0000";
      secondBar.style.boxShadow = "0 0 15px #ff0000";

      await animateSwapMotion(context, i, j, animSpeed);

      const forwardFirst = getBarAt(context, i);
      const forwardSecond = getBarAt(context, j);
      if (forwardFirst) {
        forwardFirst.style.backgroundColor = "#ff4da6";
        forwardFirst.style.boxShadow = "none";
      }
      if (forwardSecond) {
        forwardSecond.style.backgroundColor = "#ff4da6";
        forwardSecond.style.boxShadow = "none";
      }
    }
  }
}

async function playAnimations(context) {
  context.isSorting = true;
  context.isPaused = false;
  context.isSteppingMode = false;
  context.currentStepIndex = -1;
  updatePlaybackControls(context);

  for (let i = 0; i < context.animations.steps.length; i++) {
    context.currentStepIndex = i;
    const step = context.animations.steps[i];

    if (!context.isSorting) break;
    while (context.isPaused) {
      await sleep(25);
    }

    await animateStep(context, step, false, context.speed);
  }

  context.isSorting = false;
  context.isSteppingMode = true;
  updatePlaybackControls(context);
}

function sleep(delay = 0) {
  delay = Number(delay);
  const safeDelay = Number.isFinite(delay) ? Math.max(0, delay) : 0;
  return new Promise((resolve) => setTimeout(resolve, safeDelay));
}
