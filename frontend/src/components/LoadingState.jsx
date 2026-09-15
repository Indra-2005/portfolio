import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading records from database...' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[260px] w-full flex flex-col items-center justify-center space-y-3 p-8 rounded-2xl bg-slate-50 border border-slate-200"
    >
      <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
      <p className="text-xs sm:text-sm text-slate-600 font-mono">{message}</p>
      <span className="sr-only">Loading content, please wait.</span>
    </div>
  );
}

export default LoadingState;
