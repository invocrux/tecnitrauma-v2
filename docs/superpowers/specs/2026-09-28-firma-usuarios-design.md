# Firma de Usuarios — Diseño

**Fecha:** 2026-09-28
**Estado:** Borrador

---

## Resumen

Agregar campos de firma visual al formulario de Mantenimiento:
- **Firma Supervisor** → se muestra cuando se selecciona `supervisado_por`
- **Firma Realizado Por** → se muestra cuando se selecciona `realizado_por`

Las imágenes de firma son cargado por cada usuario desde su PC y se almacenan en Supabase Storage, referenciadas en una tabla `user_signatures`.

---

## Arquitectura de Datos

### Nueva tabla: `user_signatures`

```sql
CREATE TABLE user_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  firma_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all signatures"
  ON user_signatures FOR SELECT USING (true);

CREATE POLICY "Users can insert their own signature"
  ON user_signatures FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signature"
  ON user_signatures FOR UPDATE USING (auth.uid() = user_id);
```

### Supabase Storage

- Bucket: `signatures` (públic读取)
- Path por usuario: `signatures/{user_id}/firma.png`

### Columna en `mantenimiento_reportes`

No se agrega columna. Las firmas se cargan en tiempo real desde `user_signatures` según `realizado_por` y `supervisado_por`.

---

## Modelo de Datos (TypeScript)

```typescript
// interface.ts
export interface UserSignature {
  id: string;
  user_id: string;
  firma_url: string;
  created_at: string;
  updated_at: string;
}
```

---

## Flujo de Carga de Firma

1. El usuario accede a su perfil (nuevo componente `ProfileComponent`)
2. Ve un campo de upload de firma con preview
3. Selecciona imagen PNG/JPG desde su PC (max 2MB, 800x200px recomendado)
4. La imagen se sube a Supabase Storage: `signatures/{user_id}/firma.png`
5. Se inserta/actualiza registro en `user_signatures`

---

## Componentes

### 1. `UserSignatureComponent` (display)

Componente presente en el formulario de Mantenimiento que muestra la firma de un usuario.

**Inputs:**
- `userId: string | null` — ID del usuario seleccionado

**Output visual:**
- Horizontales, lado a lado, cada uno con:
  - Imagen de firma (max 200x80px)
  - Nombre del usuario debajo
- Si no hay firma: placeholder "Sin firma"

### 2. `SignatureUploadComponent` (en Profile)

- Input file aceptar: `image/png, image/jpeg`
- Preview de imagen
- Botón guardar que sube a Storage y guarda URL en `user_signatures`

### 3. `ProfileComponent` (nuevo)

Página simple con:
- Info del usuario (solo lectura)
- `SignatureUploadComponent`
- Vista previa de la firma actual

---

## Template de Mantenimiento

Nueva sección después de "Descripción" → "Observaciones":

```html
<!-- Sección Firmas -->
<section class="form-section">
  <h2 class="section-title">Firmas</h2>
  <div class="signatures-row">
    <div class="signature-box">
      <label>Supervisado por</label>
      <div class="signature-display">
        <img [src]="supervisorSignature()" alt="Firma supervisor" />
        <span class="signature-name">{{ supervisorName() }}</span>
      </div>
    </div>
    <div class="signature-box">
      <label>Realizado por</label>
      <div class="signature-display">
        <img [src]="realizadoSignature()" alt="Firma realizado" />
        <span class="signature-name">{{ realizadoName() }}</span>
      </div>
    </div>
  </div>
</section>
```

**Estilos:**
```css
.signatures-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.signature-box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.signature-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px dashed #e2e8f0;
  border-radius: 0.5rem;
  background: #f9fafb;
}

.signature-display img {
  max-width: 200px;
  max-height: 80px;
  object-fit: contain;
}

.signature-name {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}
```

---

## Servicio

### `MantenimientoService`

Nuevos métodos:

```typescript
// Cargar todas las firmas de una lista de userIds
loadSignatures(userIds: string[]): Promise<void>
getSignature(userId: string): UserSignature | null
signatures = signal<Map<string, UserSignature>>(new Map())
```

### `ProfileService` (nuevo)

```typescript
uploadSignature(file: File): Promise<string>  // URL de la imagen
saveUserSignature(userId: string, firmaUrl: string): Promise<void>
getUserSignature(userId: string): Promise<UserSignature | null>
```

---

## Carga de Firmas en MantenimientoForm

```typescript
// En MantenimientoComponent
// Cuando cambian realizado_por o supervisado_por, recargar firmas
form.get('realizado_por')?.valueChanges
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(userId => this.loadSignature('realizado', userId));

form.get('supervisado_por')?.valueChanges
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(userId => this.loadSignature('supervisor', userId));
```

```typescript
private async loadSignature(type: 'realizado' | 'supervisor', userId: string | null): Promise<void> {
  if (!userId) {
    if (type === 'realizado') this.realizadoSignature.set('');
    else this.supervisorSignature.set('');
    return;
  }

  const signature = this.profileService.getSignature(userId);
  const url = signature?.firma_url || '';
  if (type === 'realizado') this.realizadoSignature.set(url);
  else this.supervisorSignature.set(url);
}
```

---

## Validación de Upload

- Tipos MIME: `image/png`, `image/jpeg`
- Tamaño máximo: 2MB
- Dimensiones recomendadas: max 800x200px
- Conversión a PNG recomendada para consistencia

---

## Pendiente de Clarificar

1. ~~Layout de firma (A: horizontal, B: vertical, C: compacto)~~ → **A (horizontal)**
2. ~~Dónde se almacenan las firmas~~ → **Tabla user_signatures**
3. ~~Cómo se cargan las firmas~~ → **Upload desde PC del usuario**
4. ¿Dónde se encuentra el componente de Profile? (ruta `/perfil` o integrado en navbar)
5. ¿Los usuarios existentes deben cargar su firma antes de usar el sistema?

---

## Orden de Implementación

1. Migration SQL: crear tabla `user_signatures` + Storage bucket
2. Agregar `UserSignature` interface
3. Crear `ProfileService`
4. Crear `SignatureUploadComponent`
5. Crear `ProfileComponent` con ruta `/perfil`
6. Agregar firmas a `MantenimientoComponent` (display)
7. Conectar carga de firmas con valueChanges de `realizado_por` y `supervisado_por`
8. Testing end-to-end
