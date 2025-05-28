
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useRouteChange = (callback: () => void) => {
  const location = useLocation();

  useEffect(() => {
    callback();
  }, [location.pathname, callback]);
};
