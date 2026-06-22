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

  const hasCompletedTour = (tourName) => completedTours.includes(tourName);

  return (
    <TourContext.Provider value={{ completedTours, markTourCompleted, hasCompletedTour }}>
      {children}
    </TourContext.Provider>
  );
}

export const useTour = () => useContext(TourContext);
