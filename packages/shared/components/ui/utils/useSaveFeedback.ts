import { useState } from 'react';
import { toast } from '../Toast';

export function useSaveFeedback() {
  const [saving, setSaving] = useState(false);

  const showSuccess = (msg: string) => toast.success(msg);
  const showError = (msg: string) => toast.error(msg);

  return {
    saving,
    setSaving,
    showSuccess,
    showError,
  };
}
