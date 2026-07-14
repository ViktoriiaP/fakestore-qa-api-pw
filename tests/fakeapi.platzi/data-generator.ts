export function generateUniqueTitle(): string {
  const randomNumber = Math.floor(Math.random() * 1_000_000);
  return `New product ${randomNumber}`;
}

export function generateUniqueEmail(): string {
  return `vik${Date.now()}${Math.floor(Math.random() * 10000)}@gmail.com`;
}
