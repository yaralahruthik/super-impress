import { IconAlertCircle } from "@tabler/icons-react";
import {
  type FallbackProps,
  ErrorBoundary as ReactErrorBoundary,
} from "react-error-boundary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getErrorMessage } from "@/utils/get-error-message";
import { reportError } from "@/utils/report-error";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  resetKeys?: unknown[];
  onReset?: () => void;
  fallback?: React.ComponentType<FallbackProps>;
};

function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = getErrorMessage(error);

  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <Card className="w-full max-w-lg border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconAlertCircle className="size-5 text-destructive" />
            Something went wrong
          </CardTitle>
          <CardDescription>
            Try again or reload the page if the problem persists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">{message}</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={resetErrorBoundary} type="button">
              Try again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              type="button"
              variant="outline"
            >
              Reload page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ErrorBoundary({
  children,
  resetKeys,
  onReset,
  fallback: FallbackComponent = DefaultErrorFallback,
}: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      fallbackRender={(props) => <FallbackComponent {...props} />}
      onError={(error, info) => reportError(error, info)}
      onReset={onReset}
      resetKeys={resetKeys}
    >
      {children}
    </ReactErrorBoundary>
  );
}

export { DefaultErrorFallback };
