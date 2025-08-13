'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUserProfile, getUserRestaurant, type User, type Restaurant } from '../lib/supabase';

interface UserContextValue {
  profile: User | null;
  restaurant: Restaurant | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [p, r] = await Promise.all([
        getUserProfile().catch(() => null),
        getUserRestaurant().catch(() => null),
      ]);
      setProfile(p);
      setRestaurant(r);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Ctx.Provider value={{ profile, restaurant, loading, refresh: load }}>
      {children}
    </Ctx.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useUserContext must be used within UserProvider');
  return ctx;
}
