import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Unable to load content',
  error = 'A network or server error occurred while retrieving data.',
  onRetry,
}) {
  return (
    <div
      role="alert"
      className="p-8 sm:p-10 text-center bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-4 max-w-lg mx-auto"
    >
      <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-semibold text-rose-900 dark:text-rose-200">{title}</h3>
        <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 leading-relaxed font-mono">
          {error}
        </p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button
            onClick={onRetry}
            size="sm"
            variant="secondary"
            icon={RotateCcw}
            className="border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

export default ErrorState;
