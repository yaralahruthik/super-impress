import type { ErrorInfo } from "react";

export function reportError(error: unknown, info?: ErrorInfo) {
  console.error("Application error boundary", error, info);
}
