# Edge Function: Create User

Esta función de Supabase Edge crea usuarios directamente en el sistema Spoon Platform sin requerir invitaciones por email.

## Propósito

Permite a administradores crear usuarios de restaurante directamente a través de una API, asignándoles roles y asociándolos a restaurantes específicos.

## Endpoint

```
POST /functions/v1/create-user
```

## Parámetros de Entrada

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña_segura",
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "+57 300 123 4567",
  "role_id": "uuid-del-rol",
  "restaurant_id": "uuid-del-restaurante",
  "assigned_by": "uuid-del-admin-que-crea"
}
```

## Respuesta Exitosa

```json
{
  "success": true,
  "usuario": {
    "id": "uuid-usuario",
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "usuario@ejemplo.com",
    "role": "user",
    "is_active": true
  },
  "rol": {
    "id": "uuid-role-assignment",
    "user_id": "uuid-usuario",
    "role_id": "uuid-del-rol",
    "restaurant_id": "uuid-del-restaurante",
    "is_active": true
  },
  "auth_user": {
    "id": "uuid-usuario",
    "email": "usuario@ejemplo.com",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

## Validaciones

- **Campos requeridos**: email, password, first_name, last_name, role_id, restaurant_id, assigned_by
- **Email único**: No puede existir otro usuario con el mismo email
- **Rol válido**: El role_id debe existir en la tabla `system_roles`
- **Restaurante válido**: El restaurant_id debe existir en la tabla `restaurants`

## Seguridad

- Solo funciona desde Supabase Edge Functions (admin context)
- Requiere autenticación del administrador que crea el usuario
- Crea usuario en Auth con email confirmado automáticamente
- Asigna RLS automáticamente

## Casos de Uso

1. **Creación directa de empleados**: Administradores pueden crear usuarios sin esperar confirmación de email
2. **Migración de usuarios**: Importar usuarios existentes desde otros sistemas
3. **Creación masiva**: Posibilidad de automatizar creación de múltiples usuarios

## Notas Técnicas

- Usa `supabaseClient.auth.admin.createUser()` para crear usuario en Auth
- Crea registro en tabla `users` con rol 'user'
- Asigna rol específico en tabla `user_roles`
- Incluye limpieza automática si falla alguna parte del proceso
