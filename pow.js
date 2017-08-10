function pow(x, n) {
  if (n < 0) {
    return x;
  }
  return x * pow(x, n - 1);
}

console.log('result is', pow(2, 3));