// LINEAR SEARCH
function linearSearch(arr, target) {
  animations.steps = [];
  target = parseInt(target);

  animations.setTarget(target);

  for (let i = 0; i < arr.length; i++) {
    animations.scan(i);

    if (arr[i] == target) {
      animations.found(i);
      return { result: i, found: true };
    }
  }

  animations.notFound();
  return { result: -1, found: false };
}

// BINARY SEARCH
function binarySearch(arr, target) {
  animations.steps = [];
  target = parseInt(target);

  const sortedArr = [...arr].sort((a, b) => a - b);
  renderBars(sortedArr);

  animations.setTarget(target);

  let left = 0;
  let right = sortedArr.length - 1;

  animations.setRange(left, right);

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    animations.pivot(mid);
    animations.check(mid);

    if (sortedArr[mid] === target) {
      animations.found(mid);
      return { result: mid, found: true, restore: true };
    }

    if (sortedArr[mid] < target) {
      animations.eliminate(left, mid);
      left = mid + 1;
    } else {
      animations.eliminate(mid, right);
      right = mid - 1;
    }

    if (left <= right) {
      animations.setRange(left, right);
    }
  }

  animations.notFound();
  return { result: -1, found: false, restore: true };
}
