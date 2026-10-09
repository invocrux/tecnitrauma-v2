export type EstadoGestion = 'abierta' | 'en_proceso' | 'cerrada' | 'sin_gestion';
export type TipoFalla = string;

export interface NovedadCX {
  id?: string;
  fecha_cirugia: string;
  institucion: string;
  cirugia_procedimiento: string;
  num_remision: string;
  num_caso: string;
  set_instrumental: string;
  serial: string;
  pieza_reportada: string;
  referencia: string;
  fecha_inspeccion: string;
  realizado_por: string | null;
  supervisado_por: string | null;
  proveedor: string;
  continua_mantenimiento: boolean;
  cuarentena: boolean;
  de_baja: boolean;
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
  institucion: string;
  cirugia_procedimiento: string;
  num_remision: string;
  num_caso: string;
  set_instrumental: string;
  serial: string;
  pieza_reportada: string;
  referencia: string;
  fecha_inspeccion: string;
  realizado_por: string | null;
  supervisado_por: string | null;
  proveedor: string;
  continua_mantenimiento: boolean;
  cuarentena: boolean;
  de_baja: boolean;
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
