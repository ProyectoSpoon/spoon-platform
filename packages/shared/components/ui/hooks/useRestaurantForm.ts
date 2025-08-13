import { useState } from 'react';

export interface RestaurantInfo {
  name: string;
  description: string;
  phone: string;
  email: string;
  cuisineType: string;
}

export function useRestaurantForm(initial: RestaurantInfo) {
  const [formData, setFormData] = useState<RestaurantInfo>(initial);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleChange = (field: keyof RestaurantInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    setFormData,
    saving,
    setSaving,
    loading,
    setLoading,
    handleChange,
  };
}
