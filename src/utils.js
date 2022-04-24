exports.normalizeHex = (number) => {
  if (number == null) {
    return null;
  }
  number = number.toLowerCase();
  if (!number.startsWith("0x")) {
    return `0x${number}`;
  }
  return number;
}

exports.denormalizeHex = (number) => {
  if (number == null) {
    return null;
  }
  number = number.toLowerCase();
  if (number.startsWith("0x")) {
    return number.substring(2);
  }
  return number;
}