import { useEffect, useRef, useState } from 'react';

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
   * The amount to increment the progress bar by.
   */
  increment?: number;
  /**
   * The threshold at which the progress bar will increment slower.
   */
  threshold?: number;
  /**
   * The amount to increment the progress bar by when the threshold is reached.
   */
  thresholdIncrement?: number;
  /**
   * The initial progress of the progress bar.
   */
  initialProgress?: number;
  /**
   * The amount of time to wait before incrementing the progress bar.
   */
  timeToIncrement?: number;
};

export const ProgressBar = ({
  active,
  loadingMessage = 'Loading...',
  increment = 5,
  threshold = 75,
  thresholdIncrement = 2.5,
  initialProgress = 10,
  timeToIncrement = 2000,
}: ProgressBarProps) => {
  const barRef = useRef<HTMLDivElement>(null);
  const progressUpdateIntervalRef = useRef<number | undefined>(undefined);
  const clearAnimationTimeoutRef = useRef<number | undefined>(undefined);
  const [currentProgress, setCurrentProgress] = useState(initialProgress);

  const updateProgress = (value: number) => {
    if (!barRef.current) {
      return;
    }

    setCurrentProgress(value);

    barRef.current.style.width = `${value}%`;
  };

  useEffect(() => {
    const returnCallback = () => {
      window.clearInterval(progressUpdateIntervalRef.current);
      window.clearTimeout(clearAnimationTimeoutRef.current);
    };

    if (!barRef.current) {
      return returnCallback;
    }

    if (active) {
      if (progressUpdateIntervalRef.current) {
        window.clearInterval(progressUpdateIntervalRef.current);
      }

      barRef.current.style.opacity = '1';
      updateProgress(initialProgress);

      progressUpdateIntervalRef.current = window.setInterval(() => {
        if (!barRef.current) {
          return;
        }

        const currentWidth = parseFloat(barRef.current.style.width);
        const incrementBy = currentWidth >= threshold ? thresholdIncrement : increment;
        const newWidth = Math.min(currentWidth + incrementBy, 100);

        if (newWidth === 100) {
          updateProgress(100);

          window.clearInterval(progressUpdateIntervalRef.current);
        } else {
          updateProgress(newWidth);
        }
      }, timeToIncrement);
    } else {
      window.clearInterval(progressUpdateIntervalRef.current);

      updateProgress(100);

      if (clearAnimationTimeoutRef.current) {
        window.clearTimeout(clearAnimationTimeoutRef.current);
      }

      clearAnimationTimeoutRef.current = window.setTimeout(() => {
        if (!barRef.current) {
          return;
        }

        barRef.current.style.opacity = '0';
        updateProgress(0);
      }, 300);
    }

    return returnCallback;
  }, [active, increment, initialProgress, threshold, thresholdIncrement, timeToIncrement]);

  return (
    <div
      id="global-progress-bar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={currentProgress}
      role="progressbar"
      aria-hidden={!active}
      aria-valuetext={active ? loadingMessage : undefined}
      className="fixed left-0 top-0 z-50 h-0.5 w-full rounded-b-full bg-transparent"
    >
      <div
        className="h-0.5 rounded-b-full bg-blue-600 transition-all duration-300 ease-in-out dark:bg-blue-500"
        style={{ width: '0%', opacity: 0 }}
        ref={barRef}
      ></div>
    </div>
  );
};
