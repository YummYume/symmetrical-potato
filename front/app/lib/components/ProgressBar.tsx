import { useNProgress } from '@tanem/react-nprogress';
import { useMemo } from 'react';

export type ProgressBarProps = {
  /**
   * Whether or not the progress bar is active (visible).
   */
  active: boolean;
  /**
   * The message to display to screen readers when the progress bar is active.
   */
  loadingMessage?: string;
  /**
   * The duration of the animation.
   */
  animationDuration?: number;
  /**
   * The time to wait before incrementing the progress bar.
   */
  incrementDuration?: number;
  /**
   * The minimum progress possible for the progress bar.
   */
  minimum?: number;
  /**
   * The classes to apply to the progress bar.
   */
  barClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const ProgressBar = ({
  active,
  loadingMessage = 'Loading...',
  animationDuration = 300,
  incrementDuration = 750,
  minimum = 0.1,
  barClassName = 'h-full bg-blue-600 transition-all motion-reduce:transition-none ease-in-out dark:bg-blue-500',
  ...props
}: ProgressBarProps) => {
  const {
    progress,
    isFinished,
    animationDuration: duration,
  } = useNProgress({
    isAnimating: active,
    animationDuration,
    incrementDuration,
    minimum,
  });
  const barStatus = useMemo(() => {
    return {
      progress: progress * 100,
      visible: !isFinished,
    };
  }, [progress, isFinished]);

  return (
    <div
      role="progressbar"
      aria-valuemin={minimum * 100}
      aria-valuemax={100}
      aria-valuenow={barStatus.progress}
      aria-hidden={!barStatus.visible}
      aria-valuetext={barStatus.visible ? loadingMessage : undefined}
      {...props}
    >
      <div
        className={barClassName}
        style={{
          width: `${barStatus.progress}%`,
          opacity: barStatus.visible ? 1 : 0,
          transitionDuration: `${duration}ms`,
        }}
      ></div>
    </div>
  );
};
