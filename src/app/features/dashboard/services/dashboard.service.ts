import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { ToastService } from '../../../core/services/toast.service';

export interface DashboardMarca {
  id: number;
  nombre: string;
}

export interface DashboardEquipo {
  id: number;
  id_marca: number | null;
}

export interface DashboardNovedad {
  id: string;
  estado_gestion: string | null;
  cuarentena: boolean | null;
  de_baja: boolean | null;
  continua_mantenimiento: boolean | null;
  tipo_falla: string | null;
  descripcion_novedad: string | null;
  fecha_inspeccion: string | null;
  serial: string | null;
  pieza_reportada: string | null;
  proveedor: string | null;
  created_at: string | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private supabase = inject(SupabaseService);
  private toast = inject(ToastService);

  readonly isLoading = signal(false);
  readonly marcas = signal<DashboardMarca[]>([]);
  readonly equipos = signal<DashboardEquipo[]>([]);
  readonly novedades = signal<DashboardNovedad[]>([]);
  readonly userName = signal('');

  async loadDashboardData(): Promise<void> {
    this.isLoading.set(true);
    const client = this.supabase.getClient();
    const session = this.supabase.session();

    const [marcasRes, equiposRes, novedadesRes, usuarioRes] = await Promise.all([
      client.from('marcas').select('id, nombre').order('id'),
      client.from('equipos').select('id, id_marca'),
      client.from('novedades_cx')
        .select('id, estado_gestion, cuarentena, de_baja, continua_mantenimiento, tipo_falla, descripcion_novedad, fecha_inspeccion, serial, pieza_reportada, proveedor, created_at')
        .order('created_at', { ascending: false }),
      session?.user?.id
        ? client.from('app_users').select('full_name').eq('id', session.user.id).maybeSingle()
        : Promise.resolve({ data: null, error: null })
    ]);

    if (marcasRes.error) {
      this.toast.error('Error cargando marcas: ' + marcasRes.error.message);
    } else {
      this.marcas.set(marcasRes.data || []);
    }

    if (equiposRes.error) {
      this.toast.error('Error cargando equipos: ' + equiposRes.error.message);
    } else {
      this.equipos.set(equiposRes.data || []);
    }

    if (novedadesRes.error) {
      this.toast.error('Error cargando novedades: ' + novedadesRes.error.message);
    } else {
      this.novedades.set(novedadesRes.data || []);
    }

    this.userName.set(usuarioRes.data?.full_name || '');

    this.isLoading.set(false);
  }
}
