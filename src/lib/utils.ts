import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function parseFilename(originalFilename: string) {
  const extIndex = originalFilename.lastIndexOf(".");
  return {
    extension: originalFilename.slice(extIndex),
    filename: originalFilename.slice(0, extIndex),
  };
}

function parseDate() {
  const date = new Date().toISOString();
  return date.slice(0, date.lastIndexOf("."));
}

export { wait, getErrorMessage, parseFilename, parseDate };
