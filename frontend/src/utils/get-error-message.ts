import type { AxiosError } from 'axios';

/**
 * Extracts a user-friendly error message from an Axios error.
 * Handles both FastAPI HTTPException (detail as string) and
 * HTTPValidationError (detail as array of validation errors).
 */
export function getErrorMessage(error: AxiosError<unknown> | null): string {
	if (!error) {
		return 'An unknown error occurred';
	}

	const responseData = error.response?.data;

	if (responseData && typeof responseData === 'object' && 'detail' in responseData) {
		const detail = (responseData as { detail: unknown }).detail;

		// FastAPI HTTPException - detail is a string
		if (typeof detail === 'string') {
			return detail;
		}

		// FastAPI HTTPValidationError - detail is an array of validation errors
		if (Array.isArray(detail) && detail.length > 0) {
			const firstError = detail[0];
			if (firstError && typeof firstError === 'object' && 'msg' in firstError) {
				return String(firstError.msg);
			}
		}
	}

	// Fallback to the generic axios error message
	return error.message || 'An unknown error occurred';
}
