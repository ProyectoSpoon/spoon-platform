/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import CompactMetrics from '../components/CompactMetrics';

describe('CompactMetrics', () => {
  it('renderiza métricas y formato de pesos', () => {
    render(
      <CompactMetrics
        pendientes={2}
        enRuta={1}
        entregados={3}
        totalDia={123456}
        disponibles={4}
        showCajaBannerInside={false}
      />
    );

    expect(screen.getByText('Pendientes')).toBeInTheDocument();
  expect(screen.getByText(/en\s*ruta/i)).toBeInTheDocument();
    expect(screen.getByText('Entregados')).toBeInTheDocument();
  expect(screen.getByText(/total\s*d[ií]a/i)).toBeInTheDocument();
    // Total formateado con $ y separadores
  expect(screen.getByText(/\$\s*123[.,]456/)).toBeInTheDocument();
  });
});
