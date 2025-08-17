// ========================================
// ÍNDICE DE COMPONENTES - USUARIOS
// File: components/usuarios/index.ts
// ========================================

export { EstadisticasUsuarios } from './EstadisticasUsuarios';
export { UsuariosTab } from './UsuariosTab';
export { ConfiguracionRolesTab } from './ConfiguracionRolesTab';
export { AuditoriaTab } from './AuditoriaTab';

// También re-exportamos el servicio para facilidad de uso
export { UsuariosService } from '@spoon/shared/services/usuarios';
export type { 
  UsuarioRestaurante,
  RoleSistema,
  PermisoSistema,
  EstadisticasUsuarios as EstadisticasUsuariosType,
  CambioAuditoria
} from '@spoon/shared/services/usuarios';