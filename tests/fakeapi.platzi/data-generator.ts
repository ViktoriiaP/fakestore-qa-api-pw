export function generateUniqueTitle(): string {
  const randomNumber = Math.floor(Math.random() * 1_000_000);
  return `New product ${randomNumber}`;
}
