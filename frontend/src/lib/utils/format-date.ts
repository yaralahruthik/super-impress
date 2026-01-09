import { format as formatDateFns, isValid, parseISO } from 'date-fns';

type DateFormat = 'MM/DD/YYYY' | 'MMMM D, YYYY' | 'YYYY-MM-DD' | 'MMM DD, h:mm a';

const DATE_FORMAT_MAP: Record<DateFormat, string> = {
	'MM/DD/YYYY': 'MM/dd/yyyy',
	'MMMM D, YYYY': 'MMMM d, yyyy',
	'YYYY-MM-DD': 'yyyy-MM-dd',
	'MMM DD, h:mm a': 'MMM dd, h:mm a'
};

export function formatDate(
	dateInput: string | Date | null | undefined,
	format: DateFormat
): string {
	if (!dateInput) {
		return 'N/A';
	}

	const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;

	if (!isValid(date)) {
		console.warn(`Invalid date input: ${dateInput}`);
		return 'N/A';
	}

	return formatDateFns(date, DATE_FORMAT_MAP[format]);
}
