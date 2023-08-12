// Collapse an array of arrays into a single array

function collapseArray(array: any[]) {
  return array.reduce((acc, val) => acc.concat(val), []);
}

export default collapseArray;
