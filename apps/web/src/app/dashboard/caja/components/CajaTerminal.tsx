// Deprecated component placeholder to avoid breakage during removal window
export const CajaTerminal: React.FC = () => {
  if (typeof window !== 'undefined') {
    console.warn('[Deprecado] CajaTerminal.tsx fue removido. Usa CajaPage.tsx.');
  }
  return null;
};

export default CajaTerminal;

