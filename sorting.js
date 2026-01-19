const swapElements = (arr, index1, index2) => {
  [arr[index1], arr[index2]] = [arr[index2], arr[index1]];
};

//Merge Sort
function mergeSort(arr) {
  const aux = arr.slice();
  mergeHelper(arr, 0, arr.length - 1, aux);
  return arr;
}

function mergeHelper(arr, start, end, aux) {
  if (start >= end) return;

  const mid = Math.floor((start + end) / 2);

  mergeHelper(aux, start, mid, arr);
  mergeHelper(aux, mid + 1, end, arr);
  merge(arr, start, mid, end, aux);
}

function merge(arr, start, mid, end, aux) {
  let i = start;
  let j = mid + 1;
  let k = start;

  while (i <= mid && j <= end) {
    animations.compare(i, j);

    if (aux[i] <= aux[j]) {
      animations.overwrite(k, aux[i]);
      arr[k++] = aux[i++];
    } else {
      animations.overwrite(k, aux[j]);
      arr[k++] = aux[j++];
    }
  }

  while (i <= mid) {
    animations.overwrite(k, aux[i]);
    arr[k++] = aux[i++];
  }
  while (j <= end) {
    animations.overwrite(k, aux[j]);
    arr[k++] = aux[j++];
  }

  for (let idx = start; idx <= end; idx++) {
    animations.setSorted(idx);
  }
}

//Quick sort
function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const p = partition(arr, low, high);
    quickSort(arr, low, p - 1);
    quickSort(arr, p + 1, high);
  }

  return arr;
}
function partition(arr, low, high) {
  animations.setPivot(high);

  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    animations.compare(j, high);

    if (arr[j] <= pivot) {
      i++;

      if (i !== j) {
        animations.setPartition(i);
        swapElements(arr, i, j);
        animations.swap(i, j);
      }
    }
  }

  swapElements(arr, i + 1, high);
  animations.swap(i + 1, high);

  animations.setSorted(i + 1);

  return i + 1;
}

//this is not working for some reason in prev and next
//heap sort
function heapSort(arr) {
  const n = arr.length;

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    animations.setPivot(0);
    swapElements(arr, 0, i);
    animations.swap(0, i);

    animations.setSorted(i);

    heapify(arr, i, 0);
  }

  animations.setSorted(0);

  return arr;
}

function heapify(arr, heapSize, root) {
  let largest = root;
  let left = 2 * root + 1;
  let right = 2 * root + 2;

  if (left < heapSize) {
    animations.compare(left, largest);

    if (arr[left] > arr[largest]) {
      largest = left;
    }
  }

  if (right < heapSize) {
    animations.compare(right, largest);

    if (arr[right] > arr[largest]) {
      largest = right;
    }
  }

  if (largest !== root) {
    animations.compare(largest, root);
    swapElements(arr, root, largest);
    animations.swap(root, largest);

    heapify(arr, heapSize, largest);
  }
}

//bubble sort
function bubbleSort(arr) {
  let aux = arr;
  let end = aux.length;
  animations.steps = [];

  while (end > 0) {
    let swapped = false;

    for (let i = 0; i < end - 1; i++) {
      let j = i + 1;

      animations.compare(i, j);

      if (aux[i] >= aux[j]) {
        swapElements(aux, i, j);
        animations.swap(i, j);
        swapped = true;
      }
    }

    animations.setSorted(end - 1);
    end--;

    if (!swapped) {
      for (let i = 0; i < end; i++) {
        animations.setSorted(i);
      }
      break;
    }
  }

  return aux;
}

//Selection sort
function selectionSort(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;

    for (let j = i + 1; j < n; j++) {
      animations.compare(j, minIndex);

      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }

    if (minIndex !== i) {
      swapElements(arr, i, minIndex);
      animations.swap(i, minIndex);
    }

    animations.setSorted(i);
  }

  animations.setSorted(n - 1);

  return arr;
}
