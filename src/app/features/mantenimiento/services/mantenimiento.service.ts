import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { ToastService } from '../../../core/services/toast.service';
import type {
  MantenimientoReporte,
  MantenimientoForm,
  Proveedor,
  Instrumental,
  Usuario
} from '../utils/interface';

@Injectable({ providedIn: 'root' })
export class MantenimientoService {
  private supabase = inject(SupabaseService);
  private toast = inject(ToastService);

  readonly isLoading = signal(false);
  readonly reportes = signal<MantenimientoReporte[]>([]);
  readonly proveedores = signal<Proveedor[]>([]);
  readonly instrumentales = signal<Instrumental[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly numRemision = signal('');
  readonly numSerial = signal('');

  async loadProveedores(): Promise<void> {
    const { data, error } = await this.supabase.getClient()
      .from('proveedores')
      .select('id, nombre, contacto')
      .order('nombre');

    if (error) {
      this.toast.error('Error cargando proveedores');
      return;
    }
    this.proveedores.set(data || []);
  }

  async loadInstrumentales(): Promise<void> {
    const { data, error } = await this.supabase.getClient()
      .from('sets')
      .select('id, nombre, serial')
      .order('nombre');

    if (error) {
      this.toast.error('Error cargando instrumentales');
      return;
    }
    this.instrumentales.set(data || []);
  }

  async loadUsuarios(): Promise<void> {
    const { data, error } = await this.supabase.getClient()
      .from('usuarios')
      .select('id, email, nombre')
      .order('email');

    if (error) {
      this.toast.error('Error cargando usuarios');
      return;
    }
    this.usuarios.set(data || []);
  }

  async loadOptions(): Promise<void> {
    await Promise.all([
      this.loadProveedores(),
      this.loadInstrumentales(),
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
      proveedor_id: form.proveedor_id,
      set_instrumental_id: form.set_instrumental_id,
      serial: form.serial,
      pieza: form.pieza,
      referencia: form.referencia,
      fecha: form.fecha,
      realizado_por: form.realizado_por,
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
