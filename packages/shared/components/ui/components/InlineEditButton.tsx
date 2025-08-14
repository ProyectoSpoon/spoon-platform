import React from 'react';
import { Pencil } from 'lucide-react';

interface InlineEditButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  editing?: boolean; // when true, button is disabled and shows proper title
}

export const InlineEditButton: React.FC<InlineEditButtonProps> = ({ label = 'Editar', editing = false, className = '', ...props }) => {
  return (
    <button
      type="button"
      disabled={editing || props.disabled}
      className={
        'shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-lg border border-[color:var(--sp-border)] text-[color:var(--sp-on-surface)] hover:bg-[color:var(--sp-neutral-50)] disabled:opacity-50 disabled:cursor-default disabled:hover:bg-transparent ' +
        className
      }
      aria-label={label}
      title={editing ? 'Editando' : label}
      {...props}
    >
      <Pencil className="h-4 w-4" />
    </button>
  );
};

export default InlineEditButton;
