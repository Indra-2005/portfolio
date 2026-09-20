export function TechnologyTag({ name, size = 'sm', className = '' }) {
  const sizeClasses =
    size === 'md'
      ? 'px-2.5 py-1 text-xs'
      : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center font-mono rounded bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 select-none ${sizeClasses} ${className}`}
    >
      {name}
    </span>
  );
}

export default TechnologyTag;

