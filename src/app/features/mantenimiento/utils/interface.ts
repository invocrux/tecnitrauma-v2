export type TipoMantenimiento = 'correctivo' | 'predictivo' | 'preventivo';
export type EstadoReporte = 'borrador' | 'enviado' | 'completado';

export interface MantenimientoReporte {
  id?: string;
  tipo: TipoMantenimiento | null;
  num_remision: string;
  proveedor_id: string | null;
  set_instrumental_id: string | null;
  serial: string;
  pieza: string;
  referencia: string;
  fecha: string;
  realizado_por: string | null;
  motivo: string;
  descripcion: string;
  observaciones: string;
  estado: EstadoReporte;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto?: string;
}

export interface Instrumental {
  id: string;
  nombre: string;
  serial?: string;
}

export interface Usuario {
  id: string;
  email: string;
  nombre?: string;
}

export interface MantenimientoForm {
  tipo: TipoMantenimiento | null;
  num_remision: string;
  proveedor_id: string | null;
  set_instrumental_id: string | null;
  serial: string;
  pieza: string;
  referencia: string;
  fecha: string;
  realizado_por: string | null;
  motivo: string;
  descripcion: string;
  observaciones: string;
}
