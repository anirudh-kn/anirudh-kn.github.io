import React, { useEffect, useRef } from 'react';

export interface UseModalFocusOptions<T extends HTMLElement = HTMLElement> {
  isOpen?: boolean;
  onClose: () => void;
  containerRef?: React.RefObject<T | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Manages accessible keyboard focus for modal dialogs:
 * - Saves the previously focused element on open and restores focus on close
 * - Focuses the primary interactive control inside the modal on mount
 * - Traps Tab / Shift+Tab focus within the modal container
 * - Invokes onClose when Escape is pressed
 */
export function useModalFocus<T extends HTMLElement = HTMLDivElement>(
  arg: (() => void) | UseModalFocusOptions<T>,
) {
  const internalRef = useRef<T | null>(null);
  const options: UseModalFocusOptions<T> =
    typeof arg === 'function' ? { isOpen: true, onClose: arg } : arg;

  const isOpen = options.isOpen ?? true;
  const activeContainerRef = options.containerRef || internalRef;
  const onCloseRef = useRef(options.onClose);
  onCloseRef.current = options.onClose;
  const initialFocusRef = options.initialFocusRef;

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const container = activeContainerRef.current;

    if (initialFocusRef?.current) {
      initialFocusRef.current.focus({ preventScroll: true });
    } else if (container) {
      const focusableSelector =
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const firstFocusable =
        container.querySelector<HTMLElement>('[data-autofocus="true"]') ||
        container.querySelector<HTMLElement>(focusableSelector);
      if (firstFocusable) {
        firstFocusable.focus({ preventScroll: true });
      } else {
        container.focus({ preventScroll: true });
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab' && activeContainerRef.current) {
        const focusableSelector =
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusables = Array.from(
          activeContainerRef.current.querySelectorAll<HTMLElement>(
            focusableSelector,
          ),
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (
        previouslyFocused &&
        typeof previouslyFocused.focus === 'function' &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [isOpen, activeContainerRef, initialFocusRef]);

  return activeContainerRef;
}
