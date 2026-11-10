export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  delayMs: number
): (...args: A) => void {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  return (...args: A) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delayMs);
  };
}
