"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@spoon/shared/lib/supabase';

export default function SplashPage() {
  const router = useRouter();
  const [visible, setVisible] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  const [zooming, setZooming] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
  setMounted(true);

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const target = session ? "/dashboard" : "/auth";
        const popInDuration = 700; // espera a que termine el pop-in
        const zoomDuration = 600;  // duración del zoom hasta desaparecer
        setTimeout(() => {
          if (cancelled) return;
          setZooming(true);
          setTimeout(() => {
            if (cancelled) return;
            router.replace(target);
          }, zoomDuration);
        }, popInDuration);
      } catch {
        const popInDuration = 700;
        const zoomDuration = 600;
        setTimeout(() => {
          if (cancelled) return;
          setZooming(true);
          setTimeout(() => router.replace('/auth'), zoomDuration);
        }, popInDuration);
      }
    })();

    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className={`min-h-screen flex items-center justify-center bg-[color:var(--sp-surface)] transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col items-center">
        <Image
          src="/images/spoon-logo.jpg"
          alt="SPOON Logo"
          width={240}
          height={240}
          priority
          className={`object-contain animated-logo ${!zooming && mounted ? 'pop-in' : ''} ${zooming ? 'zoom-away' : ''}`}
          style={zooming ? { transform: 'scale(1.8)', opacity: 0, transition: 'transform 600ms ease-in, opacity 600ms ease-in' } : undefined}
        />
      </div>

      {/* Animaciones locales para la splash */}
      <style jsx global>{`
  .animated-logo { will-change: transform, opacity; transform-origin: center center; }
        @keyframes popIn {
          0% { transform: scale(0.92); opacity: 0; }
          60% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .pop-in { animation: popIn 700ms ease-out forwards; }

        @keyframes zoomAway {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        .zoom-away { animation: zoomAway 600ms ease-in forwards; }

        @media (prefers-reduced-motion: reduce) {
          .pop-in { animation: fadeIn 400ms ease-out forwards; }
          .zoom-away { animation: fadeOut 300ms ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        }
      `}</style>
    </div>
  );
}