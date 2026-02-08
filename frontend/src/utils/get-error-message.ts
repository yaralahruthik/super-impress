import type { AxiosError } from "axios";

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
 * Extracts a user-friendly error message from an Axios error.
 * Handles both FastAPI HTTPException (detail as string) and
 * HTTPValidationError (detail as array of validation errors).
 */
export function getErrorMessage(error: AxiosError<unknown> | null): string {
  if (!error) {
    return "An unknown error occurred";
  }

  const responseData = error.response?.data;
  const detailErrorMessage = getDetailErrorMessage(responseData);
  if (detailErrorMessage) {
    return detailErrorMessage;
  }

  const messageError = getMessageError(responseData);
  if (messageError) {
    return messageError;
  }

  // Fallback to the generic axios error message
  return error.message || "An unknown error occurred";
}
