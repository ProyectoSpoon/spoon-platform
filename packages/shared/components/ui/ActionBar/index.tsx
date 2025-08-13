import React from 'react';

export interface ActionBarProps {
  primary?: {
    label: string;
    onClick: () => void;
  color?: 'blue' | 'purple' | 'yellow' | 'emerald' | 'red' | 'indigo' | 'orange' | 'slate' | 'amber';
    disabled?: boolean;
  className?: string;
  };
  secondary?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
    disabled?: boolean;
  className?: string;
  };
  children?: React.ReactNode;
  className?: string;
}

type ActionBarColor = NonNullable<NonNullable<ActionBarProps['primary']>['color']>;

const colorToClasses: Record<ActionBarColor, string> = {
  blue: 'bg-blue-600 hover:bg-blue-700',
  purple: 'bg-purple-600 hover:bg-purple-700',
  yellow: 'bg-yellow-600 hover:bg-yellow-700',
  emerald: 'bg-emerald-600 hover:bg-emerald-700',
  red: 'bg-red-600 hover:bg-red-700',
  indigo: 'bg-indigo-600 hover:bg-indigo-700',
  orange: 'bg-orange-600 hover:bg-orange-700',
  slate: 'bg-slate-600 hover:bg-slate-700',
  amber: 'bg-amber-500 hover:bg-amber-600',
};

export const ActionBar: React.FC<ActionBarProps> = ({ primary, secondary, children, className }) => {
  return (
    <div className={`p-4 border-t border-gray-200 sticky bottom-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 z-10 ${className || ''}`}>
      {children && (
        <div className="mb-3">
          {children}
        </div>
      )}
      {(primary || secondary) && (
        <div className="flex gap-2">
          {primary && (
            <button
              onClick={primary.onClick}
              disabled={primary.disabled}
              className={`flex-1 px-4 py-3 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colorToClasses[primary.color || 'blue']} ${primary.className || ''}`}
            >
              {primary.label}
            </button>
          )}
          {secondary && (
            <button
              onClick={secondary.onClick}
              disabled={secondary.disabled}
              className={`px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${secondary.variant === 'outline' ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} ${secondary.className || ''}`}
            >
              {secondary.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionBar;
