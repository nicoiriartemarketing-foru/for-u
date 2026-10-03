import { useEffect } from 'react';
export function confirmWorkspaceNavigation() {
  return window.dispatchEvent(new Event('foru:before-navigate', { cancelable: true }));
}
export function useUnsavedNavigation(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const confirm = (event: Event) => {
      if (!window.confirm('Hay cambios sin guardar. ¿Quieres salir y descartarlos?')) event.preventDefault();
    };
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;
      const link = (event.target as HTMLElement).closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || link.target === '_blank' || link.hasAttribute('download') || link.href === window.location.href) return;
      if (!window.confirm('Hay cambios sin guardar. ¿Quieres salir y descartarlos?')) { event.preventDefault(); event.stopPropagation(); }
    };
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('foru:before-navigate', confirm);
    document.addEventListener('click', click, true);
    window.addEventListener('beforeunload', unload);
    return () => { window.removeEventListener('foru:before-navigate', confirm); document.removeEventListener('click', click, true); window.removeEventListener('beforeunload', unload); };
  }, [dirty]);
}
