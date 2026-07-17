import { randomUUID } from "node:crypto";

export function generateUniqueTitle(): string {
  const randomNumber = Math.floor(Math.random() * 1_000_000);
  return `New product ${randomNumber}`;
}

export function generateUniqueEmail(): string {
  const id = randomUUID().replaceAll("-", "");
  return `vik${id}@gmail.com`;
}
export function generateUniqueUsername() {
  const id = randomUUID().replaceAll("-", "").slice(0, 20);
  return `vik${id}`;
}
