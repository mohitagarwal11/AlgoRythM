// LINEAR SEARCH
function linearSearch(arr, target, recorder) {
  target = parseInt(target);

  recorder.setTarget(target);

  for (let i = 0; i < arr.length; i++) {
    recorder.scan(i);

    if (arr[i] == target) {
      recorder.found(i);
      return { result: i, found: true };
    }
  }

  recorder.notFound();
  return { result: -1, found: false };
}

// BINARY SEARCH
function binarySearch(arr, target, recorder) {
  target = parseInt(target);

  const sortedArr = [...arr].sort((a, b) => a - b);
  // renderBars(sortedArr);

  recorder.setTarget(target);

  let left = 0;
  let right = sortedArr.length - 1;

  recorder.setRange(left, right);

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    recorder.pivot(mid);
    recorder.check(mid);

    if (sortedArr[mid] === target) {
      recorder.found(mid);
      return { result: mid, found: true, sortedArr, restore: true };
    }

    if (sortedArr[mid] < target) {
      recorder.eliminate(left, mid);
      left = mid + 1;
    } else {
      recorder.eliminate(mid, right);
      right = mid - 1;
    }

    if (left <= right) {
      recorder.setRange(left, right);
    }
  }

  recorder.notFound();
  return { result: -1, found: false, sortedArr, restore: true };
}

// JUMP SEARCH
function jumpSearch(arr, target, recorder) {
  target = parseInt(target);

  const sortedArr = [...arr].sort((a, b) => a - b);
  const n = sortedArr.length;
  const jumpSize = Math.max(1, Math.floor(Math.sqrt(n)));

  recorder.setTarget(target);

  let left = 0;
  let right = Math.min(jumpSize, n) - 1;

  if (n === 0) {
    recorder.notFound();
    return { result: -1, found: false, sortedArr, restore: true };
  }

  recorder.setRange(left, right);

  while (left < n) {
    recorder.pivot(right);
    recorder.check(right);

    if (sortedArr[right] >= target) {
      break;
    }

    recorder.eliminate(left, right);
    left += jumpSize;

    if (left >= n) {
      recorder.notFound();
      return { result: -1, found: false, sortedArr, restore: true };
    }

    right = Math.min(left + jumpSize, n) - 1;
    recorder.setRange(left, right);
  }

  for (let i = left; i <= right; i++) {
    recorder.scan(i);

    if (sortedArr[i] === target) {
      recorder.found(i);
      return { result: i, found: true, sortedArr, restore: true };
    }

    if (sortedArr[i] > target) {
      break;
    }
  }

  recorder.notFound();
  return { result: -1, found: false, sortedArr, restore: true };
}

// INTERPOLATION SEARCH
function interpolationSearch(arr, target, recorder) {
  target = parseInt(target);

  const sortedArr = [...arr].sort((a, b) => a - b);
  recorder.setTarget(target);

  if (sortedArr.length === 0) {
    recorder.notFound();
    return { result: -1, found: false, sortedArr, restore: true };
  }

  let left = 0;
  let right = sortedArr.length - 1;

  recorder.setRange(left, right);

  while (
    left <= right &&
    target >= sortedArr[left] &&
    target <= sortedArr[right]
  ) {
    if (left === right) {
      recorder.check(left);

      if (sortedArr[left] === target) {
        recorder.found(left);
        return { result: left, found: true, sortedArr, restore: true };
      }

      break;
    }

    const rangeValue = sortedArr[right] - sortedArr[left];

    if (rangeValue === 0) {
      recorder.check(left);

      if (sortedArr[left] === target) {
        recorder.found(left);
        return { result: left, found: true, sortedArr, restore: true };
      }

      break;
    }

    const estimatedPosition =
      left +
      Math.floor(
        ((target - sortedArr[left]) * (right - left)) / rangeValue,
      );
    const position = Math.max(left, Math.min(estimatedPosition, right));

    recorder.pivot(position);
    recorder.check(position);

    if (sortedArr[position] === target) {
      recorder.found(position);
      return { result: position, found: true, sortedArr, restore: true };
    }

    if (sortedArr[position] < target) {
      recorder.eliminate(left, position);
      left = position + 1;
    } else {
      recorder.eliminate(position, right);
      right = position - 1;
    }

    if (left <= right) {
      recorder.setRange(left, right);
    }
  }

  recorder.notFound();
  return { result: -1, found: false, sortedArr, restore: true };
}
