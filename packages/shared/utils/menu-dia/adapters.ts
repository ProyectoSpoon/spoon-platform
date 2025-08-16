import { MenuCombinacion } from '../../types/menu-dia/menuTypes';

// Mapea los campos del UI a los nombres de columnas en DB para combinaciones
export function mapCombinationUpdatesToDb(updates: Partial<MenuCombinacion>) {
  const dbUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.nombre !== undefined) dbUpdates.combination_name = updates.nombre;
  if (updates.descripcion !== undefined) dbUpdates.combination_description = updates.descripcion;
  if (updates.precio !== undefined) dbUpdates.combination_price = updates.precio;
  if (updates.disponible !== undefined) dbUpdates.is_available = updates.disponible;

  if (updates.favorito !== undefined) dbUpdates.is_favorite = updates.favorito;
  if (updates.especial !== undefined) dbUpdates.is_special = updates.especial;

  return dbUpdates;
}
