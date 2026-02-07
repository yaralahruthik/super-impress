import { useRouterState } from "@tanstack/react-router";
import { ErrorBoundary } from "@/components/error-boundary";
import { Logo } from "@/components/logo";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const location = useRouterState({ select: (state) => state.location });

  return (
    <ErrorBoundary resetKeys={[location.href]}>
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <Logo />
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </ErrorBoundary>
  );
}
