const swapElements = (arr, index1, index2) => {
  [arr[index1], arr[index2]] = [arr[index2], arr[index1]];
};

//Merge Sort
function mergeSort(arr, recorder) {
  const aux = arr.slice();
  mergeHelper(arr, 0, arr.length - 1, aux, recorder);
  return arr;
}

function mergeHelper(arr, start, end, aux, recorder) {
  if (start >= end) return;

  const mid = Math.floor((start + end) / 2);

  mergeHelper(aux, start, mid, arr, recorder);
  mergeHelper(aux, mid + 1, end, arr, recorder);
  merge(arr, start, mid, end, aux, recorder);
}

function merge(arr, start, mid, end, aux, recorder) {
  let i = start;
  let j = mid + 1;
  let k = start;

  while (i <= mid && j <= end) {
    recorder.compare(i, j);

    if (aux[i] <= aux[j]) {
      recorder.overwrite(k, aux[i]);
      arr[k++] = aux[i++];
    } else {
      recorder.overwrite(k, aux[j]);
      arr[k++] = aux[j++];
    }
  }

  while (i <= mid) {
    recorder.overwrite(k, aux[i]);
    arr[k++] = aux[i++];
  }
  while (j <= end) {
    recorder.overwrite(k, aux[j]);
    arr[k++] = aux[j++];
  }

  for (let idx = start; idx <= end; idx++) {
    recorder.setSorted(idx);
  }
}

//Quick sort
function quickSort(arr, recorder) {
  return quickSortHelper(arr, recorder, 0, arr.length - 1);
}
function quickSortHelper(arr, recorder, low = 0, high = arr.length - 1) {
  if (low < high) {
    const p = partition(arr, recorder, low, high);
    quickSortHelper(arr, recorder, low, p - 1);
    quickSortHelper(arr, recorder, p + 1, high);
  }

  return arr;
}
function partition(arr, recorder, low, high) {
  recorder.setPivot(high);

  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    recorder.compare(j, high);

    if (arr[j] <= pivot) {
      i++;

      if (i !== j) {
        recorder.setPartition(i);
        swapElements(arr, i, j);
        recorder.swap(i, j);
      }
    }
  }

  swapElements(arr, i + 1, high);
  recorder.swap(i + 1, high);

  recorder.setSorted(i + 1);

  return i + 1;
}

//heap sort
function heapSort(arr, recorder) {
  const n = arr.length;

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i, recorder);
  }

  for (let i = n - 1; i > 0; i--) {
    recorder.setPivot(0);
    swapElements(arr, 0, i);
    recorder.swap(0, i);

    recorder.setSorted(i);

    heapify(arr, i, 0, recorder);
  }

  recorder.setSorted(0);

  return arr;
}

function heapify(arr, heapSize, root, recorder) {
  let largest = root;
  let left = 2 * root + 1;
  let right = 2 * root + 2;

  if (left < heapSize) {
    recorder.compare(left, largest);

    if (arr[left] > arr[largest]) {
      largest = left;
    }
  }

  if (right < heapSize) {
    recorder.compare(right, largest);

    if (arr[right] > arr[largest]) {
      largest = right;
    }
  }

  if (largest !== root) {
    recorder.compare(largest, root);
    swapElements(arr, root, largest);
    recorder.swap(root, largest);

    heapify(arr, heapSize, largest, recorder);
  }
}

//bubble sort
function bubbleSort(arr, recorder) {
  let aux = arr;
  let end = aux.length;

  while (end > 0) {
    let swapped = false;

    for (let i = 0; i < end - 1; i++) {
      let j = i + 1;

      recorder.compare(i, j);

      if (aux[i] >= aux[j]) {
        swapElements(aux, i, j);
        recorder.swap(i, j);
        swapped = true;
      }
    }

    recorder.setSorted(end - 1);
    end--;

    if (!swapped) {
      for (let i = 0; i < end; i++) {
        recorder.setSorted(i);
      }
      break;
    }
  }

  return aux;
}

//Selection sort
function selectionSort(arr, recorder) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;

    for (let j = i + 1; j < n; j++) {
      recorder.compare(j, minIndex);

      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }

    if (minIndex !== i) {
      swapElements(arr, i, minIndex);
      recorder.swap(i, minIndex);
    }

    recorder.setSorted(i);
  }

  recorder.setSorted(n - 1);

  return arr;
}
