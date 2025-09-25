# 🔄 Realtime Subscriptions - Spoon Platform

Esta implementación agrega **suscripciones en tiempo real** a la plataforma Spoon usando WebSockets de Supabase, eliminando la necesidad de polling y proporcionando actualizaciones instantáneas.

## 🎯 Problema Solucionado

**Antes:** Polling cada 30 segundos → Delay de hasta 30s, consultas innecesarias, UX no responsiva
**Después:** WebSockets realtime → Actualizaciones instantáneas (<1 segundo), eficiente, UX moderna

## 📊 Impacto Esperado

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|---------|
| **Delay máximo** | 30 segundos | <1 segundo | **97% más rápido** |
| **Consultas BD** | Cada 30s por usuario | Solo eventos relevantes | **~99% menos carga** |
| **UX Responsiva** | ❌ No | ✅ Sí | **Experiencia premium** |
| **Escalabilidad** | Limitada | Excelente | **Mejor rendimiento** |

## 🏗️ Arquitectura Implementada

### 1. Hook de Caja Realtime (`useRealtimeCaja`)

```typescript
// 📁 packages/shared/caja/hooks/useRealtimeCaja.ts
const { datosCaja, isConnected, connectionStatus } = useRealtimeCaja(restaurantId);
```

**Suscripciones activas:**
- 📡 `transacciones_caja` - Cambios en transacciones
- 📡 `gastos_caja` - Cambios en gastos
- 📡 `ordenes_mesa` - Cambios en órdenes de mesa
- 📡 `delivery_orders` - Cambios en órdenes de delivery

### 2. Hook de Menú Realtime (`useRealtimeMenu`)

```typescript
// 📁 packages/shared/hooks/menu-dia/useRealtimeMenu.ts
const { menuData, isConnected, connectionStatus } = useRealtimeMenu(restaurantId, menuId);
```

**Suscripciones activas:**
- 📡 `generated_combinations` - Cambios en combinaciones generadas
- 📡 `daily_menu_selections` - Cambios en selecciones del menú

### 3. Integración en Hook Principal (`useCaja`)

```typescript
// 📁 packages/shared/caja/hooks/useCaja.ts
export const useCaja = () => {
  // ✅ REALTIME COMO PRIMERA OPCIÓN
  const { datosCaja: realtimeData, isConnected } = useRealtimeCaja(restaurantId);

  // ✅ FALLBACK A POLLING SI REALTIME FALLA
  useEffect(() => {
    if (!isConnected && restaurantId) {
      const interval = setInterval(async () => {
        // Polling cada 30 segundos
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, restaurantId]);

  // ✅ MÉTRICAS: USAR REALTIME CUANDO DISPONIBLE
  const metricasActuales = useMemo(() => {
    return realtimeData ? realtimeData : metricas;
  }, [realtimeData, metricas]);

  return {
    metricas: metricasActuales,
    isRealtimeConnected: isConnected,
    realtimeStatus: connectionStatus,
    // ... otras props
  };
};
```

## 🔧 Configuración Técnica

### Requisitos de Supabase

**Realtime debe estar habilitado** en tu proyecto Supabase (viene por defecto en proyectos nuevos).

### Políticas RLS

Asegúrate de que las políticas RLS permitan las suscripciones:

```sql
-- Ejemplo para transacciones_caja
ALTER TABLE transacciones_caja ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can subscribe to restaurant transactions"
  ON transacciones_caja FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles
    WHERE restaurant_id = transacciones_caja.restaurant_id
  ));
```

### Manejo de Conexiones

```typescript
// Estados de conexión disponibles
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

// En tus componentes
const { realtimeStatus, isRealtimeConnected } = useCaja();

// Mostrar indicador de conexión
{isRealtimeConnected ? (
  <span className="text-green-500">🟢 Conectado</span>
) : (
  <span className="text-yellow-500">🟡 Sincronizando...</span>
)}
```

## 📱 Uso en Componentes

### En CajaPage

```typescript
// 📁 apps/web/src/app/dashboard/caja/page.tsx
const CajaPage = () => {
  const {
    metricas,
    isRealtimeConnected,
    realtimeStatus,
    procesarPago
  } = useCaja();

  return (
    <div>
      {/* Indicador de conexión realtime */}
      <div className="mb-4">
        {isRealtimeConnected ? (
          <Badge variant="success">🟢 Actualizaciones en tiempo real</Badge>
        ) : (
          <Badge variant="warning">🟡 Sincronizando cada 30s</Badge>
        )}
      </div>

      {/* Métricas actualizadas automáticamente */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader>Balance</CardHeader>
          <CardContent>${metricas.balance}</CardContent>
        </Card>
        {/* ... otras métricas */}
      </div>
    </div>
  );
};
```

### En Menú del Día

```typescript
// 📁 apps/web/src/app/dashboard/menu-del-dia/page.tsx
const MenuDelDiaPage = () => {
  const { menuData, isConnected } = useRealtimeMenu(restaurantId, menuId);

  return (
    <div>
      {isConnected && (
        <div className="mb-4">
          <Badge variant="success">🍽️ Menú actualizado en tiempo real</Badge>
        </div>
      )}

      {/* Combinaciones actualizadas automáticamente */}
      {menuData?.combinations.map(combo => (
        <MenuCombination key={combo.id} combination={combo} />
      ))}
    </div>
  );
};
```

## 🔄 Estados de Conexión

### Estados Disponibles

```typescript
'connecting'    // Estableciendo conexión
'connected'     // Conectado y recibiendo updates
'disconnected'  // Desconectado, usando polling fallback
```

### Manejo de Desconexiones

```typescript
useEffect(() => {
  if (realtimeStatus === 'disconnected') {
    // Mostrar notificación al usuario
    showNotification('Conexión perdida. Usando modo offline.', 'warning');

    // Opcional: intentar reconectar
    setTimeout(() => {
      // El hook se reconecta automáticamente
    }, 5000);
  }
}, [realtimeStatus]);
```

## 🧪 Testing

### Verificar Funcionamiento

1. **Abrir dos pestañas** del mismo restaurante
2. **Realizar una transacción** en una pestaña
3. **Verificar actualización automática** en la otra pestaña

### Logs de Debug

```typescript
// Los hooks imprimen logs útiles en consola:
console.log('🔔 Cambio en transacciones:', payload.eventType, payload.new?.id);
console.log('📡 Estado suscripción:', status);
console.log('🧹 Limpiando suscripciones realtime');
```

## 🚀 Próximos Pasos

### Expansión Sugerida

1. **Más entidades realtime:**
   - Órdenes de mesa completas
   - Inventario de productos
   - Estados de delivery
   - Notificaciones push

2. **Optimizaciones:**
   - Filtrado más granular de eventos
   - Compresión de payloads
   - Offline-first con sync

3. **Monitoreo:**
   - Dashboard de conexiones activas
   - Métricas de rendimiento
   - Alertas de desconexiones

## 🛠️ Troubleshooting

### Problema: No se actualizan los datos

**Solución:**
1. Verificar que RLS permite las suscripciones
2. Revisar logs de consola por errores
3. Confirmar que el `restaurantId` es válido

### Problema: Conexión se pierde frecuentemente

**Solución:**
1. Verificar conectividad a internet
2. Revisar límites de Supabase Realtime
3. Considerar implementar reconexión automática

### Problema: Alto uso de CPU/memoria

**Solución:**
1. Limitar número de suscripciones activas
2. Implementar debounce en actualizaciones
3. Optimizar queries de carga inicial

---

## 🎉 Resultado Final

✅ **Realtime subscriptions implementadas exitosamente**
✅ **Actualizaciones instantáneas en caja y menús**
✅ **Fallback automático a polling**
✅ **Arquitectura escalable y mantenible**
✅ **UX premium para usuarios**

**La plataforma Spoon ahora ofrece una experiencia moderna y responsiva con actualizaciones en tiempo real.**
