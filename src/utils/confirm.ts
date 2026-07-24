import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

interface ConfirmOptions {
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const showConfirm = ({
  title = 'Konfirmasi',
  message,
  onConfirm,
  onCancel,
  confirmText = 'Ya',
  cancelText = 'Batal',
}: ConfirmOptions): void => {
  confirmAlert({
    title,
    message,
    buttons: [
      {
        label: confirmText,
        onClick: onConfirm,
      },
      {
        label: cancelText,
        onClick: onCancel ?? (() => {}),
      },
    ],
    closeOnEscape: true,
    closeOnClickOutside: true,
  });
};
