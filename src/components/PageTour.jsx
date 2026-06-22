import React, { useEffect, useState } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useTour } from '../context/TourContext';

const PageTour = ({ tourName, steps }) => {
  const { hasCompletedTour, markTourCompleted } = useTour();
  const [run, setRun] = useState(false);

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
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      markTourCompleted(tourName);
    }
  };

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
      scrollToFirstStep={true}
      disableOverlayClose={true}
      disableCloseOnEsc={true}
      spotlightPadding={8}
      styles={{
        options: {
          primaryColor: 'var(--color-burgundy)',
          textColor: '#333',
          zIndex: 10000,
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
