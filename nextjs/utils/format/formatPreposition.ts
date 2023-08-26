function formatPreposition(baseWord: string) {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const firstLetter = baseWord[0];
  if (vowels.includes(firstLetter)) {
    return `an ${baseWord}`.trim();
  }
  return `a ${baseWord}`.trim();
}

export default formatPreposition;
