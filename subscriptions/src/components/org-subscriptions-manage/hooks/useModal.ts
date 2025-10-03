import { useState, useCallback } from 'react';

interface UseModalOptions {
  /**
   * Optional callback function to be executed when the modal opens
   */
  onOpen?: () => void;
  /**
   * Optional callback function to be executed when the modal closes
   */
  onClose?: () => void;
  /**
   * Initial state of the modal
   * @default false
   */
  initialState?: boolean;
}

/**
 * A hook for managing modal state with optional callbacks for open and close events
 *
 * @param options Configuration options for the modal
 * @returns Object containing modal state and handler functions
 *
 * @example
 * ```tsx
 * const { isOpen, handleOpen, handleClose, handleToggle } = useModal({
 *   onOpen: () => console.log('Modal opened'),
 *   onClose: () => console.log('Modal closed')
 * });
 *
 * return (
 *   <>
 *     <Button onClick={handleOpen}>Open Modal</Button>
 *     <Modal open={isOpen} onClose={handleClose}>
 *       <ModalContent />
 *     </Modal>
 *   </>
 * );
 * ```
 */
export function useModal(options: UseModalOptions = {}) {
  const { onOpen, onClose, initialState = false } = options;
  const [isOpen, setIsOpen] = useState(initialState);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      if (newState) {
        onOpen?.();
      } else {
        onClose?.();
      }
      return newState;
    });
  }, [onOpen, onClose]);

  return {
    isOpen,
    handleOpen,
    handleClose,
    handleToggle,
    setIsOpen,
  };
}
