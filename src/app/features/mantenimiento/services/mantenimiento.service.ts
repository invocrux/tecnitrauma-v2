import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { ToastService } from '../../../core/services/toast.service';
import type {
  MantenimientoReporte,
  MantenimientoForm,
  Marca,
  Equipo,
  Usuario
} from '../utils/interface';

@Injectable({ providedIn: 'root' })
export class MantenimientoService {
  private supabase = inject(SupabaseService);
  private toast = inject(ToastService);

  readonly isLoading = signal(false);
  readonly reportes = signal<MantenimientoReporte[]>([]);
  readonly marcas = signal<Marca[]>([]);
  readonly equipos = signal<Equipo[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly numRemision = signal('');
  readonly numSerial = signal('');

  async loadMarcas(): Promise<void> {
    const { data, error } = await this.supabase.getClient()
      .from('marcas')
      .select('id, nombre')
      .order('nombre');

    if (error) {
      this.toast.error('Error cargando marcas');
      return;
    }
    this.marcas.set(data || []);
  }

  async loadEquipos(): Promise<void> {
    const { data, error } = await this.supabase.getClient()
      .from('equipos')
      .select('id, nombre, serial')
      .order('nombre');

    if (error) {
      this.toast.error('Error cargando equipos');
      return;
    }
    this.equipos.set(data || []);
  }

  async loadUsuarios(): Promise<void> {
    const { data, error } = await this.supabase.getClient()
      .from('app_users')
      .select('id, email, full_name')
      .order('email');

    if (error) {
      this.toast.error('Error cargando usuarios');
      return;
    }
    this.usuarios.set(data || []);
  }

  async loadOptions(): Promise<void> {
    await Promise.all([
      this.loadMarcas(),
      this.loadEquipos(),
      this.loadUsuarios()
    ]);
  }

  async loadReportes(): Promise<void> {
    const { data, error } = await this.supabase.getClient()
      .from('mantenimiento_reportes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.toast.error('Error cargando reportes');
      return;
    }
    this.reportes.set(data || []);
  }

  async loadNumeros(): Promise<void> {
    const client = this.supabase.getClient();
    const { data: remisionData } = await client.rpc('generar_remision');
    this.numRemision.set(remisionData || 'REM-001');

    const { data: serialData } = await client.rpc('generar_serial');
    this.numSerial.set(serialData || 'SN-00000');
  }

  async guardar(form: MantenimientoForm): Promise<boolean> {
    this.isLoading.set(true);

    const session = this.supabase.session();
    const reporte: Partial<MantenimientoReporte> = {
      tipo: form.tipo,
      num_remision: form.num_remision,
      marca_id: form.marca_id,
      equipo_id: form.equipo_id,
      serial: form.serial,
      pieza: form.pieza,
      referencia: form.referencia,
      fecha: form.fecha,
      realizado_por: form.realizado_por,
      supervisado_por: form.supervisado_por,
      motivo: form.motivo,
      descripcion: form.descripcion,
      observaciones: form.observaciones,
      estado: 'borrador',
      created_by: session?.user?.id
    };

    const { error } = await this.supabase.getClient()
      .from('mantenimiento_reportes')
      .insert(reporte);

    this.isLoading.set(false);

    if (error) {
      this.toast.error('Error al guardar: ' + error.message);
      return false;
    }

    this.toast.success('Reporte guardado correctamente');
    await this.loadReportes();
    await this.loadNumeros();
    return true;
  }

  async eliminar(id: string): Promise<boolean> {
    this.isLoading.set(true);
    const { error } = await this.supabase.getClient()
      .from('mantenimiento_reportes')
      .delete()
      .eq('id', id);

    this.isLoading.set(false);

    if (error) {
      this.toast.error('Error al eliminar: ' + error.message);
      return false;
    }

    this.toast.success('Reporte eliminado');
    await this.loadReportes();
    return true;
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
