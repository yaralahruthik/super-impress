import { isAxiosError } from "axios";

function getDetailErrorMessage(responseData: unknown): string | null {
  if (
    !responseData ||
    typeof responseData !== "object" ||
    !("detail" in responseData)
  ) {
    return null;
  }

  const detail = (responseData as { detail: unknown }).detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (!Array.isArray(detail) || detail.length === 0) {
    return null;
  }

  const firstError = detail[0];
  if (!firstError || typeof firstError !== "object" || !("msg" in firstError)) {
    return null;
  }

  return String(firstError.msg);
}

function getMessageError(responseData: unknown): string | null {
  if (
    !responseData ||
    typeof responseData !== "object" ||
    !("message" in responseData)
  ) {
    return null;
  }

  const message = (responseData as { message?: unknown }).message;
  return typeof message === "string" ? message : null;
}

/**
 * Extracts a user-friendly error message from an error.
 * Handles API error responses with detail or message fields,
 * and falls back to the error message or string representation.
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return "An unknown error occurred";
  }

  if (isAxiosError(error)) {
    const responseData = error.response?.data;
    const detailErrorMessage = getDetailErrorMessage(responseData);
    if (detailErrorMessage) {
      return detailErrorMessage;
    }

    const messageError = getMessageError(responseData);
    if (messageError) {
      return messageError;
    }

    return error.message || "An unknown error occurred";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
