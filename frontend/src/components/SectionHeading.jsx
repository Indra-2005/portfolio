export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
}) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`space-y-2 max-w-2xl ${alignment} ${className}`}>
      {eyebrow && (
        <span className="text-xs font-mono font-medium tracking-wider uppercase text-blue-600 dark:text-blue-400">
          {eyebrow}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;

