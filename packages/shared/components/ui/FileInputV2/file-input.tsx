"use client";

import React, { useRef, useState } from 'react';
import { cn } from '../../../lib/utils';

export interface FileInputV2Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  requiredMark?: boolean;
  multiple?: boolean;
  accept?: string;
  onChange?: (files: FileList | null) => void;
}

export const FileInputV2 = React.forwardRef<HTMLInputElement, FileInputV2Props>(
  ({ id, className, label, helperText, errorMessage, requiredMark, disabled, multiple, accept, onChange, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setDragging] = useState(false);
    const [fileNames, setFileNames] = useState<string[]>([]);
    const descriptionId = helperText || errorMessage ? `${id || 'fileinput'}-description` : undefined;

    const open = () => inputRef.current?.click();
    const handleFiles = (fl: FileList | null) => {
      setFileNames(fl ? Array.from(fl).map((f) => f.name) : []);
      onChange?.(fl);
    };

    const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
      e.preventDefault();
      if (disabled) return;
      setDragging(false);
      const dt = e.dataTransfer;
      if (dt?.files) handleFiles(dt.files);
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    };

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label id={`${id}-label`} htmlFor={id} className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
            {label}
            {requiredMark && <span className="text-[color:var(--sp-error)] ml-1">*</span>}
          </label>
        )}
        <div
          role="button"
          tabIndex={0}
          aria-disabled={disabled || undefined}
          aria-labelledby={label ? `${id}-label` : undefined}
          onKeyDown={onKeyDown}
          onClick={open}
          onDragOver={(e) => {
            e.preventDefault();
            if (disabled) return;
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg border p-6 text-center transition-colors',
            'bg-[color:var(--sp-surface)] border-[color:var(--sp-border)] hover:border-[color:var(--sp-neutral-300)]',
            'text-[color:var(--sp-on-surface)]',
            isDragging && 'ring-2 ring-[color:var(--sp-focus)]',
            disabled && 'opacity-70 cursor-not-allowed'
          )}
          aria-describedby={descriptionId}
        >
          <span className="select-none">
            Arrastra y suelta archivos aquí, o
            <span className="text-[color:var(--sp-primary-600)]"> haz clic para seleccionar</span>
          </span>
        </div>
        <input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === 'function') ref(node!);
            else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
          }}
          id={id}
          type="file"
          className="sr-only"
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          aria-invalid={!!errorMessage || undefined}
          aria-describedby={descriptionId}
          disabled={disabled}
          {...props}
        />
        {!!fileNames.length && (
          <ul className="mt-2 list-disc pl-5 text-sm text-[color:var(--sp-neutral-700)]">
            {fileNames.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
        {(helperText || errorMessage) && (
          <p id={descriptionId} className={cn('mt-2 text-sm', errorMessage ? 'text-[color:var(--sp-error)]' : 'text-[color:var(--sp-neutral-500)]')}>
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  }
);

FileInputV2.displayName = 'FileInputV2';

export default FileInputV2;
