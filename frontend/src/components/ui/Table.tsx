import React from 'react';
import { cn } from '../../utils/cn';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => (
  <div className="overflow-x-auto">
    <table className={cn('min-w-full divide-y divide-gray-200 dark:divide-gray-700', className)}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => (
  <thead className={cn('bg-gray-50 dark:bg-gray-800', className)}>
    {children}
  </thead>
);

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => (
  <tbody className={cn('bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700', className)}>
    {children}
  </tbody>
);

export const TableRow: React.FC<TableRowProps> = ({ children, className, onClick }) => (
  <tr 
    className={cn(
      'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150',
      onClick && 'cursor-pointer',
      className
    )}
    onClick={onClick}
  >
    {children}
  </tr>
);

export const TableCell: React.FC<TableCellProps> = ({ children, className }) => (
  <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100', className)}>
    {children}
  </td>
);

export const TableHead: React.FC<TableHeadProps> = ({ children, className }) => (
  <th className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider', className)}>
    {children}
  </th>
);