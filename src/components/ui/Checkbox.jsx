import { cn } from '../../lib/utils';

export const Checkbox = ({ className, checked, onCheckedChange, ...props }) => (
  <input
    type="checkbox"
    checked={checked ?? false}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    className={cn(
      'h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-400',
      className
    )}
    aria-label={props['aria-label'] ?? 'Checkbox'}
    {...props}
  />
);
