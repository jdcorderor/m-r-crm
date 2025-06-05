import { useEffect } from 'react';

export function useHideMenuOnClickOutside(menuOpen: boolean, setMenuOpen: (open: boolean) => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (menuOpen && !target.closest('.nav-links') && !target.closest('.menu-toggle')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen, setMenuOpen]);
}