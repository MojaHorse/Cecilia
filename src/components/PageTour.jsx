import React, { useEffect, useState, useMemo } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useTour } from '../context/TourContext';

const PageTour = ({ tourName, steps }) => {
  const { hasCompletedTour, markTourCompleted } = useTour();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    if (!hasCompletedTour(tourName)) {
      // Delay slightly to let the page finish rendering and animations
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tourName, hasCompletedTour]);

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      markTourCompleted(tourName);
    } else if (type === 'step:after' || type === 'error') {
      // Update step index
      if (action === 'next') {
        setStepIndex(index + 1);
      } else if (action === 'prev') {
        setStepIndex(index - 1);
      }
    }
  };

  const enhancedSteps = useMemo(() => steps.map(step => ({ ...step, disableBeacon: true })), [steps]);

  // If tour is already completed, don't mount Joyride at all
  if (hasCompletedTour(tourName)) return null;

  return (
    <Joyride
      steps={enhancedSteps}
      run={run}
      stepIndex={stepIndex}
      continuous={true}
      disableScrollParentFix={true}
      showSkipButton={true}
      showProgress={true}
      scrollToFirstStep={true}
      disableOverlayClose={false}
      disableCloseOnEsc={false}
      spotlightPadding={isMobile ? 2 : 8}
      styles={{
        options: {
          primaryColor: 'var(--color-burgundy)',
          textColor: '#333',
          zIndex: 10000,
          width: isMobile ? window.innerWidth - 40 : 380,
        },
        tooltipContainer: {
          textAlign: 'left',
          fontFamily: 'var(--font-sans)',
        },
        buttonNext: {
          backgroundColor: 'var(--color-burgundy)',
          color: 'var(--color-white)',
          borderRadius: '999px',
          padding: '8px 16px',
          fontWeight: 600,
        },
        buttonBack: {
          color: 'var(--color-burgundy)',
        },
        buttonSkip: {
          color: '#666',
        }
      }}
      locale={{
        last: 'Finish',
        skip: 'Skip Tour',
        next: 'Next',
        back: 'Back'
      }}
      callback={handleJoyrideCallback}
    />
  );
};

export default PageTour;
