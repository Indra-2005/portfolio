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
      className="p-8 sm:p-10 text-center bg-rose-50 rounded-2xl border border-rose-200 space-y-4 max-w-lg mx-auto"
    >
      <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-semibold text-rose-900">{title}</h3>
        <p className="text-xs sm:text-sm text-rose-700 leading-relaxed font-mono">
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
            className="border-rose-300 text-rose-800 hover:bg-rose-100"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

export default ErrorState;
