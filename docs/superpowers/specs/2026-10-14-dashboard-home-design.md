# Diseño: Home / Panel de Control — 2026-10-14

## Objetivo
Reemplazar el dashboard demo por la portada real de la aplicación con indicadores calculados en vivo.

## Decisiones aprobadas
- **Datos en vivo** desde tablas existentes. Sin tabla nueva, sin vista, sin migraciones.
- **Gestión de equipos** (correctivo / cuarentena / de baja): conteo de `novedades_cx` con los toggles activos (`continua_mantenimiento` / `cuarentena` / `de_baja`).
- **Estado de gestión**: distribución visual de cuatro estados — Pendientes por cerrar = `abierta`, En proceso = `en_proceso`, Sin gestión = `sin_gestion`, Cerradas = `cerrada`.
- **Equipos por marca**: seis tarjetas compactas en la fila superior; tres cuentan `equipos` agrupados por `marcas` y tres cuentan los flags de gestión en `novedades_cx`.
- **Fallas que más repiten**: top 5 de `tipo_falla` en tabla con barras horizontales CSS. Sin librería de charts.
- **Navegación**: tarjetas de gestión, leyenda de estados y novedades recientes son clickeables → `/mantenimiento` o `/novedades`.

## Estructura visual
1. **Fila superior**: seis tarjetas KPI compactas con fondos pastel — tres marcas y tres acciones de gestión.
2. **Paneles centrales** (2 columnas, apiladas en móvil):
   - **Estado de las novedades**: gráfico donut CSS con leyenda para los cuatro estados.
   - **Novedades recientes**: lista de los cinco últimos registros con serial, proveedor y estado.
3. **Panel inferior**: tabla de fallas frecuentes con cantidad y barra proporcional.

## Técnica
- Nuevo `DashboardService` (señales, patrón de `NovedadesCXService`): `Promise.all` de `marcas(id, nombre)`, `equipos(id, id_marca)`, novedades completas para indicadores/listados y `app_users(full_name)` del usuario en sesión.
- `dashboard.component.ts` reescrito por completo (standalone, single-file, signals); métricas como `computed()`.
- Errores de carga → `ToastService` (toasts individuales por consulta).
- Mientras carga: valores en "—".
- Sin dependencias nuevas.
- Seguir la referencia aprobada: tarjetas pastel compactas, paneles blancos con borde/sombra suave, estados en pills y responsive para móvil.

## Archivos
- `docs/superpowers/specs/2026-10-14-dashboard-home-design.md` (este documento)
- `src/app/features/dashboard/services/dashboard.service.ts` (nuevo)
- `src/app/features/dashboard/dashboard.component.ts` (reemplazo completo)

## Fuera de alcance
- RLS deshabilitado en 9 tablas de Supabase (issue de seguridad conocido, tratar aparte).
- Tendencias históricas / series de tiempo.
