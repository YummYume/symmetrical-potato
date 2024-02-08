import type { Path } from 'react-hook-form';

export type DefaultLabelProps = {
  /**
   * The id of the label.
   */
  id?: string;
  /**
   * The className of the label.
   */
  className?: string;
  /**
   * The htmlFor of the label.
   */
  htmlFor?: string;
  /**
   * Whether to render the label as a label or a span.
   */
  as?: 'label' | 'span';
  /**
   * The content (text) of the label.
   */
  children?: React.ReactNode;
};

export type DefaultHelpProps = {
  /**
   * The id of the help text.
   */
  id?: string;
  /**
   * The className of the container (icon + text).
   */
  containerClassName?: string;
  /**
   * The content (text) of the help text.
   */
  children?: React.ReactNode;
};

export type DefaultErrorProps = {
  /**
   * The id of the error text.
   */
  id?: string;
  /**
   * The className of the container (icon + text).
   */
  containerClassName?: string;
  /**
   * The content (text) of the error text.
   */
  children?: React.ReactNode;
};

export type DefaultFieldProps<T extends Record<string, unknown>> = {
  /**
   * The name of the field (registered in react-hook-form).
   */
  name: Path<T>;
  /**
   * The label of the field.
   */
  label: string;
  /**
   * The id of the field. Will default to the name if not provided.
   */
  id?: string;
  /**
   * Whether or not to hide the label (visually).
   */
  hideLabel?: boolean;
  /**
   * Whether or not to hide the error (visually).
   */
  hideError?: boolean;
  /**
   * Whether or not the field is disabled.
   */
  disabled?: boolean;
  /**
   * Whether or not the field is required.
   */
  required?: boolean;
  /**
   * The help text of the field.
   */
  help?: string;
  /**
   * The className to apply to the container of the field.
   */
  containerClassName?: string;
  /**
   * A render prop for the label.
   */
  labelRender?: (props: DefaultLabelProps) => JSX.Element;
  /**
   * A render prop for the help text.
   */
  helpRender?: (props: DefaultHelpProps) => JSX.Element;
  /**
   * A render prop for the error text.
   */
  errorRender?: (props: DefaultErrorProps) => JSX.Element;
};
