import { useNavigation } from '@remix-run/react';
import { useMemo } from 'react';

export type BaseSubmitButtonProps = {
  text: string;
  submittingText?: string;
};

export type SubmitButtonContent = (props: BaseSubmitButtonProps) => JSX.Element;

export type SubmitButtonProps = { content?: SubmitButtonContent } & BaseSubmitButtonProps &
  React.HTMLAttributes<HTMLButtonElement>;

export const SubmitButton = ({
  text,
  submittingText,
  content: Content,
  ...rest
}: SubmitButtonProps) => {
  const navigation = useNavigation();
  const isSubmitting = useMemo(() => navigation.state === 'submitting', [navigation.state]);

  return (
    <button type="submit" disabled={isSubmitting} {...rest}>
      {Content && <Content text={text} submittingText={submittingText} />}
      {!Content && (isSubmitting && submittingText ? submittingText : text)}
    </button>
  );
};
