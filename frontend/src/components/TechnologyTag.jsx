export function TechnologyTag({ name, size = 'sm', className = '' }) {
  const sizeClasses =
    size === 'md'
      ? 'px-2.5 py-1 text-xs'
      : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center font-mono rounded-md bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors select-none ${sizeClasses} ${className}`}
    >
      {name}
    </span>
  );
}

export default TechnologyTag;
