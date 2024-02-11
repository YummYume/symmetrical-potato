import { Button } from '@radix-ui/themes';
import { useNavigation } from '@remix-run/react';
import { useMemo } from 'react';

export type BaseSubmitButtonProps = {
  text: string;
  submittingText?: string;
  allowNavigating?: boolean;
};

export type SubmitButtonContent = (props: BaseSubmitButtonProps) => JSX.Element;

export type SubmitButtonProps = { content?: SubmitButtonContent } & BaseSubmitButtonProps &
  React.ComponentProps<typeof Button> &
  React.RefAttributes<HTMLButtonElement>;

export const SubmitButton = ({
  text,
  submittingText,
  allowNavigating = false,
  content: Content,
  ...rest
}: SubmitButtonProps) => {
  const navigation = useNavigation();
  const isSubmitting = useMemo(() => {
    if (!allowNavigating) {
      return navigation.state === 'submitting';
    }

    return navigation.state === 'loading';
  }, [navigation.state, allowNavigating]);

  return (
    <Button type="submit" {...rest} disabled={rest.disabled || isSubmitting}>
      {Content && <Content text={text} submittingText={submittingText} />}
      {!Content && (isSubmitting && submittingText ? submittingText : text)}
    </Button>
  );
};
