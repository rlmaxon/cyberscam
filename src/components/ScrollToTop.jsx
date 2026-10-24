import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Start each new page at the top, the way a normal website behaves.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
