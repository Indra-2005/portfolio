import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-blue-600 hover:bg-blue-700 text-white shadow-xs border border-transparent',
  secondary:
    'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs',
  outline:
    'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-sm sm:text-base rounded-xl font-medium',
};

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    href,
    to,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white select-none';

  const combinedClasses = `${baseClasses} ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`;

  const content = (
    <>
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />}
      {!isLoading && Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 ml-2 flex-shrink-0" />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedClasses} ref={ref} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={combinedClasses}
        ref={ref}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={combinedClasses}
      ref={ref}
      {...props}
    >
      {content}
    </button>
  );
});

export default Button;
