import { cn } from '../../lib/utils';

export const Button = ({
  className,
  variant = 'default',
  size = 'default',
  type = 'button',
  disabled,
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-slate-800 text-white hover:bg-slate-700 shadow-sm',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    ghost: 'text-slate-700 hover:bg-slate-100',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
  };
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
