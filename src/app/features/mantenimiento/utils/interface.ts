export type TipoMantenimiento = 'correctivo' | 'predictivo' | 'preventivo';
export type EstadoReporte = 'borrador' | 'enviado' | 'completado' | 'pendiente';

export interface MantenimientoReporte {
  id?: string;
  tipo: TipoMantenimiento | null;
  num_remision: string;
  marca_id: number | null;
  equipo_id: number | null;
  serial: string;
  pieza: string;
  referencia: string;
  fecha: string;
  fecha_mantenimiento?: string | null;
  realizado_por: string | null;
  supervisado_por: string | null;
  motivo: string;
  descripcion: string;
  observaciones: string;
  estado: EstadoReporte;
  novedad_id?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface Marca {
  id: number;
  nombre: string;
}

export interface Equipo {
  id: number;
  nombre: string;
  serial?: string;
}

export interface Usuario {
  id: string;
  email: string;
  full_name?: string;
}

export interface SetInstrumental {
  id: number;
  serial: string;
  nombre: string;
}

export interface SetPieza {
  id: number;
  set_id: number;
  nombre: string;
  referencia: string;
}

export interface MantenimientoForm {
  tipo: TipoMantenimiento | null;
  num_remision: string;
  marca_id: number | null;
  equipo_id: number | null;
  serial: string;
  pieza: string;
  referencia: string;
  fecha: string;
  fecha_mantenimiento?: string | null;
  realizado_por: string | null;
  supervisado_por: string | null;
  motivo: string;
  descripcion: string;
  observaciones: string;
}

export interface UserSignature {
  id: string;
  user_id: string;
  firma_url: string;
  created_at: string;
  updated_at: string;
}
