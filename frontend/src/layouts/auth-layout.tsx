import { Logo } from "@/components/logo";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto flex min-h-screen flex-col gap-6 items-center justify-center px-4">
      <Logo />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
