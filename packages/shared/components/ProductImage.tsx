'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ingredientImageUtils } from '../lib/storage';

interface ProductImageProps {
  product: {
    name: string;
    image_url?: string;
  };
  size?: number;
  className?: string;
  fallbackIcon?: string;
  showFallback?: boolean;
}

/**
 * Componente para mostrar imagen de producto con fallback a ícono
 * Prioridad: image_url directo > storage bucket con nombre formateado > ícono
 */
export default function ProductImage({
  product,
  size = 32,
  className = '',
  fallbackIcon,
  showFallback = true
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Resolver URL de imagen con lógica de fallback
  const imageUrl = ingredientImageUtils.resolveProductImageUrl(product);



  // Si no hay imageUrl o hay error, mostrar ícono de fallback
  if (!imageUrl || imageError) {
    if (!showFallback) return null;

    return (
      <div
        className={`w-${size / 4} h-${size / 4} rounded-lg flex items-center justify-center text-sm font-medium shrink-0 ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`
        }}
      >
        {fallbackIcon || '🍽️'}
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-lg overflow-hidden shrink-0 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`
      }}
    >
      <Image
        src={imageUrl}
        alt={product.name}
        fill
        sizes={`${size}px`}
        className={`object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        unoptimized // Para evitar problemas con imágenes externas
      />
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export { ProductImage };
