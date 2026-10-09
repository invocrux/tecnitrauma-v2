import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { ToastService } from '../../../core/services/toast.service';
import type { NovedadCX, NovedadCXForm } from '../utils/interface';
import type { SetInstrumental, SetPieza } from '../../mantenimiento/utils/interface';

export interface UsuarioOption {
  id: string;
  email: string;
  full_name: string;
}

export interface MarcaOption {
  id: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class NovedadesCXService {
  private supabase = inject(SupabaseService);
  private toast = inject(ToastService);

  readonly isLoading = signal(false);
  readonly novedades = signal<NovedadCX[]>([]);
  readonly usuarios = signal<UsuarioOption[]>([]);
  readonly proveedores = signal<MarcaOption[]>([]);
  readonly setsInstrumentales = signal<SetInstrumental[]>([]);
  readonly setPiezas = signal<SetPieza[]>([]);

  private evidenciaUrls = new Map<string, string>();

  async loadNovedades(): Promise<void> {
    this.isLoading.set(true);
    const { data, error } = await this.supabase.getClient()
      .from('novedades_cx')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.toast.error('Error cargando novedades');
      this.isLoading.set(false);
      return;
    }
    this.novedades.set(data || []);
    this.isLoading.set(false);
  }

  async loadOptions(): Promise<void> {
    await Promise.all([
      this.loadUsuarios(),
      this.loadProveedores(),
      this.loadSetsInstrumentales()
    ]);
  }

  async loadSetsInstrumentales(): Promise<void> {
    const { data, error } = await this.supabase.getClient()
      .from('sets_instrumentales')
      .select('id, serial, nombre')
      .order('serial');

    if (error) {
      this.toast.error('Error cargando sets instrumentales');
      return;
    }
    this.setsInstrumentales.set(data || []);
  }

  async loadSetPiezas(setId?: number): Promise<void> {
    let query = this.supabase.getClient()
      .from('set_piezas')
      .select('id, set_id, nombre, referencia')
      .order('nombre');

    if (setId) {
      query = query.eq('set_id', setId);
    }

    const { data, error } = await query;

    if (error) {
      this.toast.error('Error cargando piezas');
      return;
    }
    this.setPiezas.set(data || []);
  }

  async loadUsuarios(): Promise<void> {
    const { data, error } = await this.supabase.getClient()
      .from('app_users')
      .select('id, email, full_name')
      .order('full_name');

    if (error) {
      this.toast.error('Error cargando usuarios');
      return;
    }
    this.usuarios.set(data || []);
  }

  async loadProveedores(): Promise<void> {
    const { data, error } = await this.supabase.getClient()
      .from('marcas')
      .select('id, nombre')
      .order('nombre');

    if (error) {
      this.toast.error('Error cargando proveedores');
      return;
    }
    this.proveedores.set(data || []);
  }

  async guardar(form: NovedadCXForm, id?: string): Promise<boolean> {
    this.isLoading.set(true);

    const session = this.supabase.session();
    const novedad: Partial<NovedadCX> = {
      fecha_cirugia: form.fecha_cirugia,
      institucion: form.institucion || undefined,
      cirugia_procedimiento: form.cirugia_procedimiento || undefined,
      num_remision: form.num_remision,
      num_caso: form.num_caso,
      set_instrumental: form.set_instrumental,
      serial: form.serial,
      pieza_reportada: form.pieza_reportada,
      referencia: form.referencia || undefined,
      fecha_inspeccion: form.fecha_inspeccion,
      realizado_por: form.realizado_por,
      proveedor: form.proveedor,
      continua_mantenimiento: form.continua_mantenimiento,
      cuarentena: form.cuarentena,
      de_baja: form.de_baja,
      estado_gestion: form.estado_gestion,
      descripcion_novedad: form.descripcion_novedad,
      tipo_falla: form.tipo_falla ?? undefined,
      descripcion_accion: form.descripcion_accion || undefined,
      fotografia_evidencia: form.fotografia_evidencia || undefined,
      observaciones: form.observaciones || undefined
    };

    let error: { message: string } | null = null;
    if (id) {
      const res = await this.supabase.getClient()
        .from('novedades_cx')
        .update(novedad)
        .eq('id', id);
      error = res.error;
    } else {
      const res = await this.supabase.getClient()
        .from('novedades_cx')
        .insert({ ...novedad, estado: 'borrador', created_by: session?.user?.id });
      error = res.error;
    }

    this.isLoading.set(false);

    if (error) {
      this.toast.error('Error al guardar: ' + error.message);
      return false;
    }

    this.toast.success(id ? 'Novedad actualizada correctamente' : 'Novedad guardada correctamente');
    await this.loadNovedades();
    return true;
  }

  async eliminar(id: string): Promise<boolean> {
    this.isLoading.set(true);
    const { error } = await this.supabase.getClient()
      .from('novedades_cx')
      .delete()
      .eq('id', id);

    this.isLoading.set(false);

    if (error) {
      this.toast.error('Error al eliminar: ' + error.message);
      return false;
    }

    this.toast.success('Novedad eliminada');
    await this.loadNovedades();
    return true;
  }

  async enviarAMantenimiento(novedadId: string): Promise<boolean> {
    this.isLoading.set(true);
    const client = this.supabase.getClient();

    const { data: novedad, error: novedadError } = await client
      .from('novedades_cx')
      .select('*')
      .eq('id', novedadId)
      .maybeSingle();

    if (novedadError || !novedad) {
      this.isLoading.set(false);
      this.toast.error('No se encontró la novedad');
      return false;
    }

    const { data: yaEnviado } = await client
      .from('mantenimiento_reportes')
      .select('id')
      .eq('novedad_id', novedadId)
      .maybeSingle();

    if (yaEnviado) {
      this.isLoading.set(false);
      this.toast.error('Esta novedad ya fue enviada a mantenimiento');
      return false;
    }

    const { data: marcas } = await client
      .from('marcas')
      .select('id, nombre');
    const marca = (marcas || []).find(m => m.nombre.toLowerCase() === (novedad.proveedor || '').toLowerCase());

    const { data: piezas } = await client
      .from('set_piezas')
      .select('id, nombre, referencia');
    const pieza = (piezas || []).find(p => p.referencia === novedad.referencia && p.nombre === novedad.pieza_reportada)
      || (piezas || []).find(p => p.nombre === novedad.pieza_reportada);

    const { data: remision } = await client.rpc('generar_remision');

    const session = this.supabase.session();
    const { error } = await client
      .from('mantenimiento_reportes')
      .insert({
        tipo: 'correctivo',
        num_remision: remision || novedad.num_remision,
        marca_id: marca?.id ?? null,
        equipo_id: null,
        serial: novedad.serial,
        pieza: pieza ? String(pieza.id) : novedad.pieza_reportada,
        referencia: novedad.referencia,
        fecha: this.getTodayDate(),
        fecha_mantenimiento: null,
        realizado_por: novedad.realizado_por,
        supervisado_por: null,
        motivo: novedad.descripcion_novedad,
        descripcion: novedad.descripcion_accion || '',
        observaciones: novedad.observaciones || '',
        estado: 'pendiente',
        novedad_id: novedadId,
        created_by: session?.user?.id
      });

    this.isLoading.set(false);

    if (error) {
      this.toast.error('Error al enviar a mantenimiento: ' + error.message);
      return false;
    }

    await client
      .from('novedades_cx')
      .update({ estado: 'enviado_mantenimiento' })
      .eq('id', novedadId);

    this.toast.success('Novedad enviada a mantenimiento correctamente');
    await this.loadNovedades();
    return true;
  }

  async uploadEvidencia(file: File): Promise<{ path: string; url: string } | null> {
    const ext = file.name.split('.').pop() || 'png';
    const path = `novedades/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error } = await this.supabase.getClient().storage
      .from('Imagenes')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error || !data) {
      this.toast.error('Error subiendo evidencia: ' + (error?.message || ''));
      return null;
    }

    const url = await this.getEvidenciaUrl(path);
    return url ? { path, url } : null;
  }

  async getEvidenciaUrl(value: string | null | undefined): Promise<string> {
    if (!value) return '';
    if (value.startsWith('http')) return value;
    if (this.evidenciaUrls.has(value)) return this.evidenciaUrls.get(value)!;

    const { data, error } = await this.supabase.getClient().storage
      .from('Imagenes')
      .createSignedUrl(value, 3600);

    if (error || !data) return '';
    this.evidenciaUrls.set(value, data.signedUrl);
    return data.signedUrl;
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getTipoFallaLabel(tipo: string | null): string {
    return tipo || '';
  }

  getEstadoGestionLabel(estado: string): string {
    const labels: Record<string, string> = {
      'abierta': 'Abierta',
      'en_proceso': 'En Proceso',
      'cerrada': 'Cerrada',
      'sin_gestion': 'Sin Gestión'
    };
    return labels[estado] || estado;
  }
}
