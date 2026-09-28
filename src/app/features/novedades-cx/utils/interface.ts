export type EstadoGestion = 'abierta' | 'en_proceso' | 'cerrada' | 'sin_gestion';
export type TipoFalla = 'mecanica' | 'electrica' | 'software' | 'material' | 'uso_inadecuado' | 'otra';

export interface NovedadCX {
  id?: string;
  fecha_cirugia: string;
  num_remision: string;
  num_caso: string;
  set_instrumental: string;
  serial: string;
  pieza_reportada: string;
  referencia: string;
  fecha_inspeccion: string;
  realizado_por: string | null;
  proveedor: string;
  continua_mantenimiento: boolean;
  estado_gestion: EstadoGestion;
  descripcion_novedad: string;
  tipo_falla: TipoFalla | null;
  descripcion_accion: string;
  fotografia_evidencia: string;
  observaciones: string;
  estado: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface NovedadCXForm {
  fecha_cirugia: string;
  num_remision: string;
  num_caso: string;
  set_instrumental: string;
  serial: string;
  pieza_reportada: string;
  referencia: string;
  fecha_inspeccion: string;
  realizado_por: string | null;
  proveedor: string;
  continua_mantenimiento: boolean;
  estado_gestion: EstadoGestion;
  descripcion_novedad: string;
  tipo_falla: TipoFalla | null;
  descripcion_accion: string;
  fotografia_evidencia: string;
  observaciones: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
}
