import React, { createContext, useContext, useState } from 'react';

const TourContext = createContext();

export function TourProvider({ children }) {
  const [completedTours, setCompletedTours] = useState(() => {
    try {
      const stored = localStorage.getItem('completedTours');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const markTourCompleted = (tourName) => {
    if (!completedTours.includes(tourName)) {
      const updated = [...completedTours, tourName];
      setCompletedTours(updated);
      localStorage.setItem('completedTours', JSON.stringify(updated));
    }
  };

  // FEATURE PAUSED: Always return true to disable all tours and unblock popups
  const hasCompletedTour = (tourName) => true;

  return (
    <TourContext.Provider value={{ completedTours, markTourCompleted, hasCompletedTour }}>
      {children}
    </TourContext.Provider>
  );
}

export const useTour = () => useContext(TourContext);
