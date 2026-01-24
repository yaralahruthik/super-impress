import ChangePasswordPage from '@/features/settings/change-password-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/_app/change-password')({
	component: ChangePasswordPage
});
