export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
}) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`space-y-3 max-w-2xl ${alignment} ${className}`}>
      {eyebrow && (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200/80">
          {eyebrow}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      {description && (
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
