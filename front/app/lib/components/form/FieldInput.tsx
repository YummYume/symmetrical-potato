import { useMemo } from 'react';

export type FieldInputProps = {
  name: string;
  label: string;
  error?: string;
  hideLabel?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const FieldInput = ({ name, label, error, hideLabel = false, ...rest }: FieldInputProps) => {
  const ariaDescribedBy = useMemo(() => `${name}-error`, [name]);

  return (
    <div>
      <label htmlFor={name} className={hideLabel ? 'sr-only' : ''}>
        {label}
      </label>
      <input id={name} name={name} aria-describedby={ariaDescribedBy} {...rest} />
      {error && (
        <span id={ariaDescribedBy} className="text-red-500">
          {error}
        </span>
      )}
    </div>
  );
};
