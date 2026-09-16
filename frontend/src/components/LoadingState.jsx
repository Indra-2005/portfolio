import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading records from database...' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[240px] w-full flex flex-col items-center justify-center space-y-3 p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
    >
      <Loader2 className="w-7 h-7 text-blue-600 dark:text-blue-400 animate-spin" />
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-mono">{message}</p>
      <span className="sr-only">Loading content, please wait.</span>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs animate-pulse flex flex-col justify-between"
    >
      <div className="aspect-[16/9] w-full bg-slate-200 dark:bg-slate-800" />
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="space-y-2 pt-1">
            <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-3.5 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className="flex gap-2">
            <div className="h-5 w-14 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-5 w-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="flex justify-between items-center pt-1">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectGridSkeleton({ count = 3 }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading projects, please wait...</span>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="animate-pulse border-b border-slate-100 dark:border-slate-800">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
        </td>
      ))}
    </tr>
  );
}

export default LoadingState;
