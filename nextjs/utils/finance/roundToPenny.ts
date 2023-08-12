function roundToPenny(o: { [key: string]: any } | number) {
  if (typeof o !== 'object') {
    const rounded = Math.round(o * 100) / 100;
    if (Number.isNaN(rounded)) {
      return o;
    }
    return rounded;
  }
  const obj = { ...o };
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      obj[key] = roundToPenny(obj[key]);
    } else if (typeof obj[key] === 'number') {
      obj[key] = roundToPenny(obj[key]);
    }

    // Round to nearest penny
    if (typeof obj[key] === 'number') {
      obj[key] = Math.round(obj[key] * 100) / 100;
    }
  }

  return obj;
}

export default roundToPenny;
