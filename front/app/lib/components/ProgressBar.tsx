import { useNProgress } from '@tanem/react-nprogress';
import { useMemo } from 'react';

export type ProgressBarProps = {
  /**
   * Whether or not the progress bar is active (visible).
   */
  active: boolean;
  /**
   * The children to render.
   */
  children?: React.ReactNode;
  /**
   * The duration of the animation.
   */
  animationDuration?: number;
  /**
   * The time to wait before incrementing the progress bar.
   */
  incrementDuration?: number;
  /**
   * The message to display to screen readers when the progress bar is active.
   */
  loadingMessage?: string;
  /**
   * The minimum progress possible for the progress bar.
   */
  minimum?: number;
} & React.HTMLAttributes<HTMLElement>;

export const ProgressBar = ({
  active,
  children,
  animationDuration = 300,
  incrementDuration = 750,
  loadingMessage = 'Loading...',
  minimum = 0.2,
  ...props
}: ProgressBarProps) => {
  const { isFinished, progress } = useNProgress({
    animationDuration,
    incrementDuration,
    isAnimating: active,
    minimum,
  });

  const barStatus = useMemo(() => {
    return {
      progress: isFinished ? 0 : progress * 100,
      visible: !isFinished,
    };
  }, [isFinished, progress]);

  return (
    <progress
      aria-valuemin={minimum}
      aria-valuemax={100}
      aria-valuenow={barStatus.progress}
      aria-hidden={!barStatus.visible}
      aria-valuetext={barStatus.visible ? loadingMessage : undefined}
      max={100}
      style={{
        opacity: barStatus.visible ? 1 : 0,
        transitionDuration: `${animationDuration}ms`,
      }}
      value={barStatus.progress}
      {...props}
    >
      {children}
    </progress>
  );
};
