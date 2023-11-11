import { Button } from '@radix-ui/themes';
import { useNavigation } from '@remix-run/react';
import { useMemo } from 'react';

export type BaseSubmitButtonProps = {
  text: string;
  submittingText?: string;
};

export type SubmitButtonContent = (props: BaseSubmitButtonProps) => JSX.Element;

export type SubmitButtonProps = { content?: SubmitButtonContent } & BaseSubmitButtonProps &
  React.ComponentProps<typeof Button> &
  React.RefAttributes<HTMLButtonElement>;

export const SubmitButton = ({
  text,
  submittingText,
  content: Content,
  ...rest
}: SubmitButtonProps) => {
  const navigation = useNavigation();
  const isSubmitting = useMemo(() => navigation.state === 'submitting', [navigation.state]);

  return (
    <Button type="submit" disabled={isSubmitting} {...rest}>
      {Content && <Content text={text} submittingText={submittingText} />}
      {!Content && (isSubmitting && submittingText ? submittingText : text)}
    </Button>
  );
};
