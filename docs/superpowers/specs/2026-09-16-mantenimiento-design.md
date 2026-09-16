# SPEC: Reporte de Mantenimiento — TECNITRAUMA V2

**Fecha:** 2026-09-16
**Autor:** Roberto De La Cruz
**Proyecto:** TECNITRAUMA V2
** Tipo:** UI Module

---

## 1. Concept & Vision

Módulo de Reporte de Mantenimiento para gestión de equipos biomédicos y quirúrgicos. Interfaz clínica, limpia y profesional — inspirada en formularios médicos pero con la velocidad y claridad de una app moderna. Una sola vista, sin wizards ni navegación, para entrada de datos rápida.

---

## 2. Design Language

### Aesthetic Direction
Formulario médico profesional — fondo panel azul claro (#EFF6FF), tarjetas blancas, acentos en azul primario (#2563EB). Tipografía Manrope para legibilidad.

### Color Palette
- **Primary:** #2563EB (botones principales, headers)
- **Primary hover:** #1D4ED8
- **Panel bg:** #EFF6FF (fondo de página)
- **Surface:** #FFFFFF (tarjeta del formulario)
- **Border:** #E2E8F0 (campos)
- **Text primary:** #1E40AF (labels, headers)
- **Text secondary:** #64748B (placeholders, hints)
- **Error:** #EF4444
- **Success:** #10B981

### Typography
- **Font:** Manrope (Google Fonts), fallback: system-ui, sans-serif
- **Page title:** 1.25rem, font-weight 600
- **Section labels:** 0.75rem, font-weight 600, uppercase, color secondary
- **Input text:** 0.875rem
- **Buttons:** 0.875rem, font-weight 500

### Spatial System
- Card padding: 1.5rem
- Gap between form sections: 1.5rem
- Gap between fields: 1rem
- Gap between buttons: 0.5rem
- Border radius: 0.5rem (card), 0.375rem (inputs/buttons)

### Motion Philosophy
Transiciones sutiles en hover (0.15s ease). Sin animaciones complejas — velocidad médica.

---

## 3. Layout & Structure

### Page Structure
```
┌─ Page (bg: #EFF6FF, padding: 2rem) ─────────────────────────────┐
│ ┌─ Card (bg: white, shadow, radius 0.5rem) ──────────────────┐ │
│ │ Header: "Reporte de Mantenimiento" + icono ng-icon           │ │
│ │ ─────────────────────────────────────────────────────────── │ │
│ │ SECTION 1: Identificación                                    │ │
│ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │ │
│ │ │Tipo mant. ▼ │ │N° remisión   │ │Proveedor ▼   │        │ │
│ │ └──────────────┘ └──────────────┘ └──────────────┘        │ │
│ │ ┌──────────────┐ ┌──────────────┐                         │ │
│ │ │Set/Instr. ▼ │ │Serial        │                         │ │
│ │ └──────────────┘ └──────────────┘                         │ │
│ │ ───────────────────────────────────────────────────────── │ │
│ │ SECTION 2: Trabajo                                          │ │
│ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │ │
│ │ │Pieza         │ │Referencia    │ │Fecha 📅      │        │ │
│ │ └──────────────┘ └──────────────┘ └──────────────┘        │ │
│ │ ┌─────────────────────────────┐                            │ │
│ │ │Realizado por ▼              │                            │ │
│ │ └─────────────────────────────┘                            │ │
│ │ ───────────────────────────────────────────────────────── │ │
│ │ SECTION 3: Descripción                                     │ │
│ │ ┌─────────────────────────────────────────────────────┐   │ │
│ │ │Motivo de solicitud                                  │   │ │
│ │ └─────────────────────────────────────────────────────┘   │ │
│ │ ┌─────────────────────────────────────────────────────┐   │ │
│ │ │Descripción del mantenimiento                        │   │ │
│ │ │(textarea, altura ~100px)                            │   │ │
│ │ └─────────────────────────────────────────────────────┘   │ │
│ │ ┌─────────────────────────────────────────────────────┐   │ │
│ │ │Observaciones                                        │   │ │
│ │ └─────────────────────────────────────────────────────┘   │ │
│ │ ───────────────────────────────────────────────────────── │ │
│ │ [Guardar] [Imprimir] [Enviar]                           │ │
│ └───────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Grid
- Form fields: grid 3 columnas (auto-fit, min 180px)
- Full width fields: textarea, Realizado por
- Responsive: en móvil pasa a 1 columna

### Responsive Strategy
- Desktop (>1024px): 3 columnas
- Tablet (768-1024px): 2 columnas
- Mobile (<768px): 1 columna

---

## 4. Features & Interactions

### Core Features

1. **Selección de Tipo de Mantenimiento** — Select dropdown
   - Opciones: Correctivo, Predictivo, Preventivo
   - Default: vacío (placeholder "Seleccionar...")

2. **N° de Remisión** — Input texto libre, alfanumérico

3. **Proveedor** — Select dropdown (lista de proveedores de Supabase)

4. **Set / Instrumental** — Select dropdown (lista de instrumentales)

5. **Serial** — Input texto

6. **Pieza para mantenimiento** — Input texto

7. **Referencia** — Input texto

8. **Fecha de mantenimiento** — Date picker, default: hoy

9. **Realizado por** — Select dropdown (lista de técnicos)

10. **Motivo de solicitud** — Textarea

11. **Descripción del mantenimiento** — Textarea (obligatorio)

12. **Observaciones** — Textarea, opcional

### Acciones

13. **Guardar** — Botón primario (#2563EB)
    - Valida campos obligatorios
    - Guarda en Supabase tabla `mantenimiento_reportes`
    - Toast success/error
    - Reset form después de guardar

14. **Imprimir** — Botón secundario (outline)
    - Genera PDF del reporte actual
    - Usa ventana de impresión del navegador

15. **Enviar** — Botón terciario
    - Envía por email / notificación (futuro)
    - Por ahora: toast "Funcionalidad en desarrollo"

### Estados de error
- Campo requerido vacío: borde rojo (#EF4444), mensaje debajo
- Error al guardar: toast rojo con mensaje del servidor
- Network error: toast "Error de conexión"

### Estados vacíos
- Listas (proveedores, técnicos): mensaje "Cargando..." mientras loadng
- Si no hay opciones: "No hay opciones disponibles"

---

## 5. Component Inventory

### FormCard
- Fondo blanco, border-radius 0.5rem, box-shadow sutil
- Padding 1.5rem
- Título con ng-icon (lucideWrench)

### FormSection
- Label uppercase (0.75rem, #64748B, font-weight 600)
- Margin-bottom 1rem
- Separador visual entre secciones (border-top: 1px solid #E2E8F0)

### FormField
- Label (0.75rem, #64748B)
- Input/Select/Textarea (0.875rem, #374151)
- Border: 1px solid #E2E8F0
- Focus: border-color #2563EB, ring 2px #2563EB/20%
- Error: border-color #EF4444

### Button
- **Primary:** bg #2563EB, text white, hover #1D4ED8
- **Secondary:** bg white, border 1px #E2E8F0, text #374151, hover bg #F8FAFC
- **Tertiary:** bg transparent, text #2563EB, hover underline
- Border-radius: 0.375rem
- Padding: 0.625rem 1.25rem
- Font-weight: 500

### Toast
- Posición: top-right
- Success: bg #10B981, text white
- Error: bg #EF4444, text white
- Duración: 4s

---

## 6. Technical Approach

### Stack
- Angular 21 (standalone, signals)
- Supabase (Postgres + Auth)
- @ng-icons/lucide para iconos
- Manrope via Google Fonts

### Route
- Path: `/mantenimiento`
- Lazy-loaded component: `MantenimientoComponent`
- Route added in `app.routes.ts`

### Data Model (Supabase)

**Tabla:** `mantenimiento_reportes`
```sql
id              uuid primary key default gen_random_uuid()
tipo            text not null -- 'correctivo' | 'predictivo' | 'preventivo'
num_remision    text
proveedor_id    uuid references proveedores(id)
set_instrumental_id uuid references sets(id)
serial          text
pieza           text
referencia      text
fecha           date default current_date
realizado_por   uuid references usuarios(id)
motivo          text
descripcion     text not null
observaciones   text
estado          text default 'borrador' -- 'borrador' | 'enviado' | 'completado'
created_at      timestamptz default now()
updated_at      timestamptz default now()
created_by      uuid references auth.users(id)
```

**Tablas de referencia:**
- `proveedores` (id, nombre, contacto)
- `sets` o `instrumentales` (id, nombre, serial)
- `usuarios` (ya existe para auth)

### Component Structure
```
src/app/features/mantenimiento/
├── mantenimiento.component.ts       -- Standalone component
├── mantenimiento.component.html    -- Template
├── mantenimiento.component.css    -- Styles
├── services/
│   └── mantenimiento.service.ts   -- CRUD operations
└── models/
    └── mantenimiento.model.ts    -- TypeScript interfaces
```

### Form Validation
- Campos obligatorios: `tipo`, `descripcion`
- Validación en cliente (signals) + validación en backend (Supabase RLS)

---

## 7. Scope

### In Scope
- Crear componente standalone para `/mantenimiento`
- Formulario con todos los campos listados
- Guardar en Supabase
- Validación básica de obligatorios
- Diseño responsive
- Integración con sidebar existente

### Out of Scope (futuro)
- Edición de reportes existentes
- Historial por equipo
- Firma digital
- Subida de fotos
- Exportar PDF (usar print del navegador por ahora)
- Filtros y búsqueda
