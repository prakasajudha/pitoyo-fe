import { cn } from '../../lib/utils';

export const Table = ({ className, ...props }) => (
  <div className="relative w-full overflow-auto">
    <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
  </div>
);

export const TableHeader = ({ ...props }) => <thead {...props} />;

export const TableBody = ({ ...props }) => <tbody {...props} />;

export const TableRow = ({ className, ...props }) => (
  <tr className={cn('border-b border-slate-100 transition-colors hover:bg-slate-50/80', className)} {...props} />
);

export const TableHead = ({ className, ...props }) => (
  <th
    className={cn(
      'h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/80 [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
);

export const TableCell = ({ className, ...props }) => (
  <td className={cn('p-4 align-middle text-slate-700 [&:has([role=checkbox])]:pr-0', className)} {...props} />
);
