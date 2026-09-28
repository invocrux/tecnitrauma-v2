import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { ToastService } from '../../../core/services/toast.service';
import type { NovedadCX, NovedadCXForm } from '../utils/interface';

@Injectable({ providedIn: 'root' })
export class NovedadesCXService {
  private supabase = inject(SupabaseService);
  private toast = inject(ToastService);

  readonly isLoading = signal(false);
  readonly novedades = signal<NovedadCX[]>([]);

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

  async guardar(form: NovedadCXForm): Promise<boolean> {
    this.isLoading.set(true);

    const session = this.supabase.session();
    const novedad: Partial<NovedadCX> = {
      fecha_cirugia: form.fecha_cirugia,
      num_remision: form.num_remision,
      num_caso: form.num_caso,
      set_instrumental: form.set_instrumental,
      serial: form.serial,
      pieza_reportada: form.pieza_reportada,
      referencia: form.referencia,
      fecha_inspeccion: form.fecha_inspeccion,
      realizado_por: form.realizado_por,
      proveedor: form.proveedor,
      continua_mantenimiento: form.continua_mantenimiento,
      estado_gestion: form.estado_gestion,
      descripcion_novedad: form.descripcion_novedad,
      tipo_falla: form.tipo_falla,
      descripcion_accion: form.descripcion_accion,
      fotografia_evidencia: form.fotografia_evidencia,
      observaciones: form.observaciones,
      estado: 'borrador',
      created_by: session?.user?.id
    };

    const { error } = await this.supabase.getClient()
      .from('novedades_cx')
      .insert(novedad);

    this.isLoading.set(false);

    if (error) {
      this.toast.error('Error al guardar: ' + error.message);
      return false;
    }

    this.toast.success('Novedad guardada correctamente');
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

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getTipoFallaLabel(tipo: string | null): string {
    const labels: Record<string, string> = {
      'mecanica': 'Mecánica',
      'electrica': 'Eléctrica',
      'software': 'Software',
      'material': 'Material',
      'uso_inadecuado': 'Uso Inadecuado',
      'otra': 'Otra'
    };
    return tipo ? (labels[tipo] || tipo) : '';
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
