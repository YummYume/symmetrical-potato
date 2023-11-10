import { useNProgress } from '@tanem/react-nprogress';
import { useMemo } from 'react';

export type ContainerProps = {
  /**
   * The current progress of the progress bar.
   */
  progress: number;
  /**
   * Whether or not the progress bar is finished.
   */
  visible: boolean;
  /**
   * The duration of the animation.
   */
  animationDuration?: number;
  /**
   * The minimum progress possible for the progress bar.
   */
  minimum?: number;
  /**
   * The message to display to screen readers when the progress bar is active.
   */
  loadingMessage?: string;
  /**
   * The children to render.
   */
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export type BarProps = {
  /**
   * The current progress of the progress bar.
   */
  progress: number;
  /**
   * Whether or not the progress bar is finished.
   */
  visible: boolean;
  /**
   * The duration of the animation.
   */
  animationDuration?: number;
  /**
   * The children to render.
   */
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

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
   * The props to spread on the bar element.
   */
  barProps?: React.HTMLAttributes<HTMLDivElement>;
  /**
   * The container component.
   */
  container?: (props: ContainerProps) => React.ReactElement;
  /**
   * The bar component.
   */
  bar?: (props: BarProps) => React.ReactElement;
  /**
   * The children to render.
   */
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const Container = ({
  progress,
  visible,
  animationDuration = 300,
  loadingMessage = 'Loading...',
  minimum = 0,
  children,
  ...props
}: ContainerProps) => (
  <div
    role="progressbar"
    aria-valuemin={minimum}
    aria-valuemax={100}
    aria-valuenow={progress}
    aria-hidden={!visible}
    aria-valuetext={visible ? loadingMessage : undefined}
    style={{
      opacity: visible ? 1 : 0,
      pointerEvents: 'none',
      transition: `opacity ${animationDuration}ms linear`,
    }}
    {...props}
  >
    {children}
  </div>
);

export const Bar = ({
  progress,
  visible,
  animationDuration = 300,
  children,
  ...props
}: BarProps) => (
  <div
    style={{
      width: `${progress}%`,
      opacity: visible ? 1 : 0,
      transitionDuration: `${animationDuration}ms`,
    }}
    {...props}
  >
    {children}
  </div>
);

export const ProgressBar = ({
  active,
  loadingMessage = 'Loading...',
  animationDuration = 300,
  incrementDuration = 750,
  minimum = 0.2,
  barProps = {
    className:
      'h-full bg-blue-600 transition-all motion-reduce:transition-none ease-in-out dark:bg-blue-500',
  },
  container: ContainerComponent = Container,
  bar: BarComponent = Bar,
  children,
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
    <ContainerComponent
      {...props}
      progress={barStatus.progress}
      visible={barStatus.visible}
      animationDuration={duration}
      loadingMessage={loadingMessage}
      minimum={minimum}
    >
      <BarComponent
        {...barProps}
        progress={barStatus.progress}
        visible={barStatus.visible}
        animationDuration={duration}
      />
      {children}
    </ContainerComponent>
  );
};
