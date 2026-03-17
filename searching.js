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
