// ========================================
// SERVICIO DE USUARIOS Y ROLES
// File: packages/shared/services/usuarios.ts
// ========================================

import { supabase, getCurrentUser, getUserRestaurant } from '../lib/supabase';

export interface UsuarioRestaurante {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  role: string; // legacy field
  
  // Datos del nuevo sistema de roles
  user_roles?: {
    id: string;
    role_id: string;
    is_active: boolean;
    assigned_at: string;
    notes: string | null;
    system_roles: {
      id: string;
      name: string;
      description: string;
    };
  }[];
}

export interface RoleSistema {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  created_at: string;
}

export interface PermisoSistema {
  id: string;
  name: string;
  module: string;
  description: string;
  is_critical: boolean;
}

export interface PermisoRol {
  role_id: string;
  permission_id: string;
  granted: boolean;
  permission: PermisoSistema;
}

export interface EstadisticasUsuarios {
  usuariosActivos: number;
  cajeros: number;
  meseros: number;
  cocineros: number;
  gerentes: number;
  total: number;
  // Nuevo: mapa dinámico por rol (slug -> cantidad)
  porRol: Record<string, number>;
}

export interface CambioAuditoria {
  id: string;
  accion: string;
  detalles: string;
  tipo: 'usuario_creado' | 'rol_asignado' | 'permiso_modificado' | 'usuario_activado' | 'usuario_desactivado';
  usuario: string;
  fecha: string;
  realizado_por: string;
}

export class UsuariosService {
  /**
   * Normaliza cadenas: minúsculas, sin acentos/emojis/caracteres no alfabéticos
   */
  private static normalize(text: string): string {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar diacríticos
      .replace(/[^a-z]/g, '') // dejar solo letras a-z
      .trim();
  }

  /**
   * Mapa de alias -> slug canónico (solo letras, sin tildes)
   */
  private static mapRoleNameToSlug(nameOrId: string): string | null {
    const aliases: Record<string, string> = {
      propietario: 'propietario', dueno: 'propietario', dueño: 'propietario', owner: 'propietario',
      gerente: 'gerente', manager: 'gerente',
      cajero: 'cajero', cashier: 'cajero',
      mesero: 'mesero', waiter: 'mesero',
      cocinero: 'cocinero', cook: 'cocinero',
      administrador: 'administrador', admin: 'administrador'
    };
    const known = new Set(Object.keys(this.getRoleDisplayNames()));
    const raw = (nameOrId || '').toString();
    // Si ya coincide exactamente con algún slug conocido
    if (known.has(raw)) return raw;
    const norm = this.normalize(raw);
    if (aliases[norm]) return aliases[norm];
    // Si la normalización ya coincide con un slug conocido
    if (known.has(norm)) return norm;
    return null;
  }
  /**
   * Roles por defecto cuando el backend no puede servirlos (p.ej. políticas recursivas)
   */
  private static defaultSystemRoles(): RoleSistema[] {
    const names = this.getRoleDisplayNames();
    const make = (id: string, label: string): RoleSistema => ({
      id, // usamos el slug como id estable de fallback
      name: id, // el sistema usa el slug como nombre técnico
      description: label, // mantener etiqueta como descripción (sin manipulación unicode)
      is_system: true,
      created_at: new Date(0).toISOString(),
    });
    return Object.entries(names).map(([id, label]) => make(id, label));
  }
  
  /**
   * Obtener todos los usuarios del restaurante actual
   */
  static async getUsuariosRestaurante(): Promise<{ data: UsuarioRestaurante[] | null; error: any }> {
    try {
      const restaurant = await getUserRestaurant();
      if (!restaurant) {
        return { data: null, error: new Error('No se encontró el restaurante') };
      }

      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          is_active,
          created_at,
          last_login,
          role,
          user_roles!user_id (
            id,
            role_id,
            is_active,
            assigned_at,
            notes
          )
        `)
        .eq('user_roles.restaurant_id', restaurant.id)
        .eq('user_roles.is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo usuarios:', error);
        // Fallback: si hay problema de políticas con system_roles, traer sin relación
        if ((error as any).code === '42P17' || (error as any).code === '500') {
          const { data: simpleData, error: simpleErr } = await supabase
            .from('users')
            .select(`
              id,
              first_name,
              last_name,
              email,
              phone,
              is_active,
              created_at,
              last_login,
              role,
              user_roles!user_id (
                id,
                role_id,
                is_active,
                assigned_at,
                notes
              )
            `)
            .eq('user_roles.restaurant_id', restaurant.id)
            .eq('user_roles.is_active', true)
            .order('created_at', { ascending: false });
          if (simpleErr) {
            return { data: null, error: simpleErr };
          }
          return { data: simpleData as UsuarioRestaurante[], error: null };
        }
        return { data: null, error };
      }

      return { data: data as UsuarioRestaurante[], error: null };
    } catch (error) {
      console.error('Error en getUsuariosRestaurante:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener todos los roles del sistema
   */
  static async getRolesSistema(): Promise<{ data: RoleSistema[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('system_roles')
        .select('*')
        .order('name');

      if (error) {
        // Fallback si hay un problema de políticas recursivas
        if ((error as any).code === '42P17') {
          console.warn('Roles: políticas recursivas detectadas (42P17). Usando roles por defecto.');
          return { data: this.defaultSystemRoles(), error: null };
        }
        console.error('Error obteniendo roles:', error);
        return { data: null, error };
      }

      // Si no hay roles (o tabla vacía), devolvemos roles de sistema por defecto
      if (!data || data.length === 0) {
        return { data: this.defaultSystemRoles(), error: null };
      }
      return { data, error: null };
    } catch (error) {
      console.error('Error en getRolesSistema:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener todos los permisos agrupados por módulo
   */
  static async getPermisos(): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('module')
        .order('name');

      if (error) {
        console.error('Error obteniendo permisos:', error);
        if ((error as any).code === '42P17') {
          return { data: {}, error: null };
        }
        return { data: null, error };
      }

      // Agrupar por módulo
      const permisosPorModulo = (data || []).reduce((acc: any, permiso: PermisoSistema) => {
        if (!acc[permiso.module]) {
          acc[permiso.module] = [];
        }
        acc[permiso.module].push(permiso);
        return acc;
      }, {});

      return { data: permisosPorModulo, error: null };
    } catch (error) {
      console.error('Error en getPermisos:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener permisos de un rol específico
   */
  static async getPermisosRol(roleId: string): Promise<{ data: PermisoRol[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          role_id,
          permission_id,
          granted,
          permissions (
            id,
            name,
            module,
            description,
            is_critical
          )
        `)
        .eq('role_id', roleId);

      if (error) {
        console.error('Error obteniendo permisos del rol:', error);
        return { data: null, error };
      }

      return { data: data as any[], error: null };
    } catch (error) {
      console.error('Error en getPermisosRol:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  static async getEstadisticas(): Promise<{ data: EstadisticasUsuarios | null; error: any }> {
    try {
      const restaurant = await getUserRestaurant();
      if (!restaurant) {
        return { data: null, error: new Error('No se encontró el restaurante') };
      }

      // Traer roles activos por usuario y filtrar usuarios activos
      const { data: urData, error: urErr } = await supabase
        .from('user_roles')
        .select('role_id, user_id, users!user_id(is_active)')
        .eq('restaurant_id', restaurant.id)
        .eq('is_active', true)
        .eq('users.is_active', true);

      if (urErr) {
        console.error('Error obteniendo estadísticas (user_roles):', urErr);
        // Fallback: contar total de relaciones activas con usuario activo
        if ((urErr as any).code === '42P17' || (urErr as any).code === '500') {
          const { data: simpleData, error: simpleErr } = await supabase
            .from('user_roles')
            .select('user_id, users!user_id(is_active)')
            .eq('restaurant_id', restaurant.id)
            .eq('is_active', true)
            .eq('users.is_active', true);
          if (simpleErr) return { data: null, error: simpleErr };
          const total = (simpleData || []).length;
          return { data: { usuariosActivos: total, cajeros: 0, meseros: 0, cocineros: 0, gerentes: 0, total, porRol: {} }, error: null };
        }
        return { data: null, error: urErr };
      }

      const total = (urData || []).length;
      const byRoleId = new Map<string, number>();
      (urData || []).forEach((row: any) => {
        if (row.role_id) byRoleId.set(row.role_id, (byRoleId.get(row.role_id) || 0) + 1);
      });

      // Intentar mapear ids a slugs conocidos consultando system_roles
      const roleIds = Array.from(byRoleId.keys());
      let slugCounts: Record<string, number> = {};
      if (roleIds.length > 0) {
        const { data: roles, error: rolesErr } = await supabase
          .from('system_roles')
          .select('id, name')
          .in('id', roleIds);
        if (!rolesErr && roles) {
          roles.forEach((r: any) => {
            const c = byRoleId.get(r.id) || 0;
            const slug = UsuariosService.mapRoleNameToSlug(r.name ?? r.id);
            if (slug) {
              slugCounts[slug] = (slugCounts[slug] || 0) + c;
            } else {
              // Si no podemos mapear, no contaminamos con IDs UUID; se contabiliza en total igualmente
            }
          });
        } else {
          // Fallback: sin nombres de roles, no intentes usar IDs como slugs (podrían ser UUIDs)
          // Deja slugCounts vacío; las tarjetas conocidas se rellenan con 0 más abajo
        }
      }

      // Asegurar que existan todas las llaves de roles conocidos
      const knownRoles = Object.keys(this.getRoleDisplayNames());
      knownRoles.forEach((slug) => {
        if (!(slug in slugCounts)) slugCounts[slug] = 0;
      });

      const stats: EstadisticasUsuarios = {
        usuariosActivos: total,
        cajeros: slugCounts['cajero'] || 0,
        meseros: slugCounts['mesero'] || 0,
        cocineros: slugCounts['cocinero'] || 0,
        gerentes: slugCounts['gerente'] || 0,
        total,
        porRol: slugCounts,
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error en getEstadisticas:', error);
      return { data: null, error };
    }
  }

  /**
   * Cambiar rol de un usuario
   */
  static async cambiarRolUsuario(
  userId: string, 
  nuevoRoleId: string, 
  notas?: string
): Promise<{ data: any | null; error: any }> {
  try {
    const user = await getCurrentUser();
    const restaurant = await getUserRestaurant();
    
    if (!user || !restaurant) {
      return { data: null, error: new Error('Usuario o restaurante no encontrado') };
    }

    // Upsert atómico para evitar 406 y ramas separadas
    const payload = {
      user_id: userId,
      restaurant_id: restaurant.id,
      role_id: nuevoRoleId,
      assigned_by: user.id,
      assigned_at: new Date().toISOString(),
      notes: notas,
      is_active: true,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('user_roles')
      .upsert(payload, { onConflict: 'user_id,restaurant_id' })
      .select()
      .single();

    if (error) {
      console.error('Error en upsert de user_role:', error);
      return { data: null, error };
    }

    return { data, error: null };

  } catch (error) {
    console.error('Error en cambiarRolUsuario:', error);
    return { data: null, error };
  }
}

  /**
   * Activar/Desactivar usuario
   */
  static async toggleUsuarioActivo(
    userId: string, 
    activo: boolean
  ): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          is_active: activo,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error toggleando usuario:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error en toggleUsuarioActivo:', error);
      return { data: null, error };
    }
  }

  /**
   * Invitar nuevo usuario
   */
  static async invitarUsuario(datos: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    role_id: string;
    mensaje?: string;
  }): Promise<{ data: any | null; error: any }> {
    try {
      const user = await getCurrentUser();
      const restaurant = await getUserRestaurant();
      
      if (!user || !restaurant) {
        return { data: null, error: new Error('Usuario o restaurante no encontrado') };
      }

      // Crear usuario si no existe (sin restaurant_id; la relación es vía user_roles)
      const nuevoUsuario = {
        first_name: datos.first_name,
        last_name: datos.last_name,
        email: datos.email,
        phone: datos.phone,
        is_active: false, // Inactivo hasta que acepte la invitación
        role: 'pending', // Role legacy
      } as const;

      let usuarioObjetivo: any | null = null;
      const { data: usuarioCreado, error: errorUsuario } = await supabase
        .from('users')
        .insert(nuevoUsuario)
        .select()
        .single();

      if (errorUsuario) {
        // Si el usuario ya existe (duplicado), buscarlo por email y continuar
        if ((errorUsuario as any).code === '23505') {
          const { data: existente, error: buscarErr } = await supabase
            .from('users')
            .select('*')
            .eq('email', datos.email)
            .maybeSingle();
          if (buscarErr || !existente) {
            console.error('Error encontrando usuario existente:', buscarErr || 'no encontrado');
            return { data: null, error: errorUsuario };
          }
          usuarioObjetivo = existente;
        } else {
          console.error('Error creando usuario:', errorUsuario);
          return { data: null, error: errorUsuario };
        }
      } else {
        usuarioObjetivo = usuarioCreado;
      }

      // Asegurar relación user_roles (crear o actualizar)
      const { data: relacionExistente } = await supabase
        .from('user_roles')
        .select('id, role_id, is_active')
        .eq('user_id', usuarioObjetivo.id)
        .eq('restaurant_id', restaurant.id)
        .maybeSingle();

      let rolAsignado: any | null = null;
      if (relacionExistente) {
        // Actualizar el rol si difiere y reactivar
        const { data, error } = await supabase
          .from('user_roles')
          .update({
            role_id: datos.role_id,
            is_active: true,
            assigned_by: user.id,
            updated_at: new Date().toISOString(),
            notes: 'Usuario invitado - actualizado',
          })
          .eq('id', relacionExistente.id)
          .select()
          .single();
        if (error) return { data: null, error };
        rolAsignado = data;
      } else {
        const { data, error } = await supabase
          .from('user_roles')
          .insert({
            user_id: usuarioObjetivo.id,
            role_id: datos.role_id,
            restaurant_id: restaurant.id,
            assigned_by: user.id,
            notes: 'Usuario invitado - pendiente de activación',
            is_active: true,
          })
          .select()
          .single();
        if (error) return { data: null, error };
        rolAsignado = data;
      }

      return {
        data: {
          usuario: usuarioObjetivo,
          rol: rolAsignado,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error en invitarUsuario:', error);
      return { data: null, error };
    }
  }

  /**
   * Actualizar permisos de un rol (solo para configuraciones personalizadas)
   */
  static async actualizarPermisosRol(
    roleId: string,
    permissionId: string,
    granted: boolean
  ): Promise<{ data: any | null; error: any }> {
    try {
      const user = await getCurrentUser();
      const restaurant = await getUserRestaurant();
      
      if (!user || !restaurant) {
        return { data: null, error: new Error('Usuario o restaurante no encontrado') };
      }

      // Verificar si ya existe una configuración personalizada
      const { data: existing } = await supabase
        .from('restaurant_role_configs')
        .select('id')
        .eq('restaurant_id', restaurant.id)
        .eq('role_id', roleId)
        .eq('permission_id', permissionId)
        .maybeSingle();

      if (existing) {
        // Actualizar existente
        const { data, error } = await supabase
          .from('restaurant_role_configs')
          .update({
            granted,
            configured_by: user.id,
            configured_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        return { data, error };
      } else {
        // Crear nueva configuración personalizada
        const { data, error } = await supabase
          .from('restaurant_role_configs')
          .insert({
            restaurant_id: restaurant.id,
            role_id: roleId,
            permission_id: permissionId,
            granted,
            configured_by: user.id
          })
          .select()
          .single();

        return { data, error };
      }
    } catch (error) {
      console.error('Error en actualizarPermisosRol:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener historial de cambios para auditoría
   */
  static async getHistorialCambios(options?: { startDate?: string; endDate?: string; page?: number; pageSize?: number }): Promise<{ data: CambioAuditoria[] | null; error: any; total?: number }> {
    try {
      const restaurant = await getUserRestaurant();
      if (!restaurant) {
        return { data: null, error: new Error('No se encontró el restaurante') };
      }

      const page = Math.max(1, options?.page ?? 1);
      const pageSize = Math.max(1, Math.min(200, options?.pageSize ?? 50));
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // 1) Traer eventos del log de auditoría con filtros y paginación
      let query = supabase
        .from('audit_log')
        .select('id, table_name, operation, old_data, new_data, user_id, timestamp', { count: 'exact' })
        .order('timestamp', { ascending: false });

      if (options?.startDate) {
        query = query.gte('timestamp', options.startDate);
      }
      if (options?.endDate) {
        query = query.lte('timestamp', options.endDate);
      }

      const { data: rawLogs, error: auditErr, count } = await query.range(from, to);

      if (auditErr) {
        console.error('Error leyendo audit_log:', auditErr);
        return { data: null, error: auditErr };
      }

      const logs = (rawLogs || []) as Array<{
        id: string;
        table_name: string;
        operation: string;
        old_data: any | null;
        new_data: any | null;
        user_id: string | null;
        timestamp: string;
      }>;

      // 2) Pre-cargar catálogos (roles, permisos) y usuarios necesarios para mostrar nombres legibles
      const roleIds = new Set<string>();
      const permissionIds = new Set<string>();
      const actorIds = new Set<string>();
      const targetUserIds = new Set<string>();

      for (const r of logs) {
        const nd = r.new_data || {};
        const od = r.old_data || {};
        if (r.table_name === 'user_roles') {
          if (nd.role_id) roleIds.add(nd.role_id);
          if (od.role_id) roleIds.add(od.role_id);
          if (nd.user_id) targetUserIds.add(nd.user_id);
          if (od.user_id) targetUserIds.add(od.user_id);
        }
        if (r.table_name === 'restaurant_role_configs' || r.table_name === 'role_permissions') {
          if (nd.permission_id) permissionIds.add(nd.permission_id);
          if (od.permission_id) permissionIds.add(od.permission_id);
          if (nd.role_id) roleIds.add(nd.role_id);
          if (od.role_id) roleIds.add(od.role_id);
        }
        if (r.table_name === 'users') {
          if (nd.id) targetUserIds.add(nd.id);
          if (od.id) targetUserIds.add(od.id);
        }
        if (r.user_id) actorIds.add(r.user_id);
      }

      // Convertir Sets a arrays
      const roleIdList = Array.from(roleIds);
      const permIdList = Array.from(permissionIds);
      const userIdList = Array.from(
        new Set(
          Array.from(actorIds).concat(Array.from(targetUserIds))
        )
      );

      // Cargar nombres de roles
      const [rolesRes, permsRes, usersRes] = await Promise.all([
        roleIdList.length
          ? supabase.from('system_roles').select('id, name, description').in('id', roleIdList)
          : Promise.resolve({ data: [], error: null } as any),
        permIdList.length
          ? supabase.from('permissions').select('id, name').in('id', permIdList)
          : Promise.resolve({ data: [], error: null } as any),
        userIdList.length
          ? supabase
              .from('users')
              .select('id, first_name, last_name, email')
              .in('id', userIdList)
          : Promise.resolve({ data: [], error: null } as any),
      ]);

      if (rolesRes.error || permsRes.error || usersRes.error) {
        const err = rolesRes.error || permsRes.error || usersRes.error;
        console.error('Error precargando catálogos para auditoría:', err);
        return { data: null, error: err };
      }

      const roleMap = new Map<string, { id: string; name: string; description?: string }>();
      (rolesRes.data || []).forEach((r: any) => roleMap.set(r.id, r));
      const permMap = new Map<string, { id: string; name: string }>();
      (permsRes.data || []).forEach((p: any) => permMap.set(p.id, p));
      const userMap = new Map<string, { id: string; first_name: string; last_name: string; email: string }>();
      (usersRes.data || []).forEach((u: any) => userMap.set(u.id, u));

      // 3) Filtrar sólo eventos del restaurante actual (cuando la fila tiene restaurant_id)
      const isForRestaurant = (nd: any, od: any): boolean => {
        const rid = nd?.restaurant_id ?? od?.restaurant_id;
        if (!rid) return true; // si no existe, lo dejamos pasar (ej. tabla users)
        return String(rid) === String(restaurant.id);
      };

      // 4) Transformar a formato UI
      const cambios: CambioAuditoria[] = [];
      for (const r of logs) {
        const nd = r.new_data || {};
        const od = r.old_data || {};
        if (!isForRestaurant(nd, od)) continue;

        const actor = r.user_id ? userMap.get(r.user_id) : null;
        const realizado_por = actor ? `${actor.first_name ?? ''} ${actor.last_name ?? ''}`.trim() || actor.email : 'Sistema';

        if (r.table_name === 'user_roles') {
          // Cambio o asignación de rol
          const targetId = nd.user_id || od.user_id;
          const target = targetId ? userMap.get(targetId) : null;
          const usuario = target ? `${target.first_name ?? ''} ${target.last_name ?? ''}`.trim() || target.email : 'Usuario';
          const oldRole = od.role_id ? roleMap.get(od.role_id)?.name || od.role_id : null;
          const newRole = nd.role_id ? roleMap.get(nd.role_id)?.name || nd.role_id : null;

          const huboCambio = oldRole && newRole && oldRole !== newRole;
          const fueAsignacion = r.operation === 'INSERT' || (!oldRole && newRole);
          if (huboCambio || fueAsignacion) {
            cambios.push({
              id: r.id,
              accion: huboCambio ? 'Rol cambiado' : 'Rol asignado',
              detalles: huboCambio
                ? `${usuario} cambió de ${oldRole} a ${newRole}`
                : `Se asignó el rol ${newRole} a ${usuario}`,
              tipo: 'rol_asignado',
              usuario,
              fecha: r.timestamp,
              realizado_por,
            });
          }
          continue;
        }

        if (r.table_name === 'users') {
          // Creación y activación/desactivación de usuario
          const usuario = `${nd.first_name ?? od.first_name ?? ''} ${nd.last_name ?? od.last_name ?? ''}`.trim() || nd.email || od.email || 'Usuario';
          if (r.operation === 'INSERT') {
            cambios.push({
              id: r.id,
              accion: 'Usuario creado',
              detalles: `Se creó la cuenta de ${usuario}`,
              tipo: 'usuario_creado',
              usuario,
              fecha: r.timestamp,
              realizado_por,
            });
          }
          if (typeof nd.is_active === 'boolean' && typeof od.is_active === 'boolean' && nd.is_active !== od.is_active) {
            cambios.push({
              id: r.id,
              accion: nd.is_active ? 'Usuario activado' : 'Usuario desactivado',
              detalles: nd.is_active ? `Se activó la cuenta de ${usuario}` : `Se desactivó la cuenta de ${usuario}`,
              tipo: nd.is_active ? 'usuario_activado' : 'usuario_desactivado',
              usuario,
              fecha: r.timestamp,
              realizado_por,
            });
          }
          continue;
        }

        if (r.table_name === 'restaurant_role_configs' || r.table_name === 'role_permissions') {
          // Modificación de permisos (por restaurante o global)
          const roleId = nd.role_id ?? od.role_id;
          const permId = nd.permission_id ?? od.permission_id;
          const granted = typeof nd.granted === 'boolean' ? nd.granted : undefined;
          const roleName = roleId ? roleMap.get(roleId)?.name || roleId : 'Rol';
          const permName = permId ? permMap.get(permId)?.name || permId : 'permiso';
          const usuario = 'Sistema';

          // Si no podemos determinar el cambio exacto, al menos registramos el evento
          const detalles =
            granted === true
              ? `Se otorgó permiso de "${permName}" al rol ${roleName}`
              : granted === false
              ? `Se revocó permiso de "${permName}" al rol ${roleName}`
              : `Se modificó el permiso "${permName}" para el rol ${roleName}`;

          cambios.push({
            id: r.id,
            accion: 'Permiso modificado',
            detalles,
            tipo: 'permiso_modificado',
            usuario,
            fecha: r.timestamp,
            realizado_por,
          });
          continue;
        }
      }

  return { data: cambios, error: null, total: count ?? cambios.length };
    } catch (error) {
      console.error('Error en getHistorialCambios:', error);
  return { data: null, error };
    }
  }

  /**
   * Exportar auditoría como CSV
   */
  static async exportarAuditoria(options?: { startDate?: string; endDate?: string }): Promise<{ data: string | null; error: any }> {
    try {
      const { data: cambios, error } = await this.getHistorialCambios({
        startDate: options?.startDate,
        endDate: options?.endDate,
        page: 1,
        pageSize: 1000, // exportar hasta 1000 eventos del periodo
      });
      
      if (error || !cambios) {
        return { data: null, error };
      }

      // Convertir a CSV
      const headers = ['Fecha', 'Acción', 'Usuario', 'Detalles', 'Realizado por'];
      const csvContent = [
        headers.join(','),
        ...cambios.map(cambio => [
          new Date(cambio.fecha).toLocaleString('es-CO'),
          cambio.accion,
          cambio.usuario,
          `"${cambio.detalles}"`,
          cambio.realizado_por
        ].join(','))
      ].join('\n');

      return { data: csvContent, error: null };
    } catch (error) {
      console.error('Error en exportarAuditoria:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener mapa de nombres de roles para UI
   */
  static getRoleDisplayNames(): Record<string, string> {
    return {
      'propietario': '👔 Propietario',
      'gerente': '👨‍💼 Gerente',
      'cajero': '💰 Cajero',
      'mesero': '🍽️ Mesero',
      'cocinero': '👨‍🍳 Cocinero',
      'administrador': '⚙️ Administrador'
    };
  }

  /**
   * Obtener colores de badges para roles
   */
  static getRoleColors(): Record<string, string> {
    return {
      'propietario': 'bg-purple-100 text-purple-800',
      'gerente': 'bg-blue-100 text-blue-800',
      'cajero': 'bg-green-100 text-green-800',
      'mesero': 'bg-orange-100 text-orange-800',
      'cocinero': 'bg-red-100 text-red-800',
      'administrador': 'bg-gray-100 text-gray-800'
    };
  }

  /**
   * Obtener iconos para módulos de permisos
   */
  static getModuleIcons(): Record<string, string> {
    return {
      'caja': '💰',
      'menu': '📋',
      'ordenes': '🍽️',
      'config': '⚙️',
      'reportes': '📊',
      'mesas': '🪑'
    };
  }
}