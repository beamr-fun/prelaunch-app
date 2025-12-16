const SUBSCRIPT_DIGITS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

export const formatSubscriptPrice = (value: number): string => {
  if (value >= 0.01) {
    return value.toFixed(4);
  }

  const str = value.toFixed(12);
  const match = str.match(/^0\.(0+)(\d+)$/);

  if (!match) {
    return value.toFixed(8);
  }

  const zeroCount = match[1].length;
  const significantDigits = match[2].slice(0, 4);
  const subscript = zeroCount
    .toString()
    .split('')
    .map((d) => SUBSCRIPT_DIGITS[parseInt(d)])
    .join('');

  return `0.0${subscript}${significantDigits}`;
};
