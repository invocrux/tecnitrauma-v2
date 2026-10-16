import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideBarChart3,
  lucideBriefcaseMedical,
  lucideCheck,
  lucideClipboardList,
  lucideClock3,
  lucidePackage,
  lucideShieldAlert,
  lucideTrash2,
  lucideWrench,
  lucideX
} from '@ng-icons/lucide';
import { DashboardService } from './services/dashboard.service';

interface MarcaTotal {
  id: number;
  nombre: string;
  total: number;
}

interface FallaFrecuente {
  nombre: string;
  total: number;
  porcentaje: number;
}

interface EstadoResumen {
  key: string;
  label: string;
  total: number;
  color: string;
  background: string;
}

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgIconComponent],
  providers: [provideIcons({
    lucideAlertTriangle,
    lucideBarChart3,
    lucideBriefcaseMedical,
    lucideCheck,
    lucideClipboardList,
    lucideClock3,
    lucidePackage,
    lucideShieldAlert,
    lucideTrash2,
    lucideWrench,
    lucideX
  })],
  template: `
    <div class="dashboard">
      <section class="kpi-grid" aria-label="Indicadores principales">
        <article class="kpi-card kpi-blue">
          <ng-icon name="lucideBriefcaseMedical" class="kpi-icon" />
          <strong>{{ cardValue(marcaTotal('Tecnitrauma')) }}</strong>
          <span>Equipos Tecnitrauma</span>
        </article>
        <article class="kpi-card kpi-purple">
          <ng-icon name="lucidePackage" class="kpi-icon" />
          <strong>{{ cardValue(marcaTotal('Johnson & Johnson')) }}</strong>
          <span>Equipos Johnson &amp; Johnson</span>
        </article>
        <article class="kpi-card kpi-teal">
          <ng-icon name="lucidePackage" class="kpi-icon" />
          <strong>{{ cardValue(marcaTotal('Smith And Nephew')) }}</strong>
          <span>Equipos Smith And Nephew</span>
        </article>
        <a routerLink="/mantenimiento" class="kpi-card kpi-amber kpi-link">
          <ng-icon name="lucideWrench" class="kpi-icon" />
          <strong>{{ cardValue(totalMantenimientoCorrectivo()) }}</strong>
          <span>Mantenimiento correctivo</span>
        </a>
        <a routerLink="/novedades" class="kpi-card kpi-red kpi-link">
          <ng-icon name="lucideShieldAlert" class="kpi-icon" />
          <strong>{{ cardValue(totalCuarentena()) }}</strong>
          <span>En cuarentena</span>
        </a>
        <a routerLink="/novedades" class="kpi-card kpi-yellow kpi-link">
          <ng-icon name="lucideTrash2" class="kpi-icon" />
          <strong>{{ cardValue(totalDeBaja()) }}</strong>
          <span>Dados de baja</span>
        </a>
      </section>

      <section class="main-grid">
        <article class="panel status-panel">
          <div class="panel-heading">
            <div>
              <h2>Estado de las novedades</h2>
              <p>Distribución actual de la gestión</p>
            </div>
            <ng-icon name="lucideBarChart3" />
          </div>

          <div class="status-content">
            <div class="donut" [style.background]="estadoDonutBackground()" aria-label="Distribución de estados">
              <div class="donut-center">
                <strong>{{ cardValue(totalNovedades()) }}</strong>
                <span>Novedades</span>
              </div>
            </div>
            <div class="legend">
              @for (estado of estadosResumen(); track estado.key) {
                <button type="button" class="legend-row" routerLink="/novedades">
                  <span class="legend-label">
                    <span class="legend-dot" [style.background]="estado.color"></span>
                    {{ estado.label }}
                  </span>
                  <strong>{{ cardValue(estado.total) }}</strong>
                </button>
              }
            </div>
          </div>
        </article>

        <article class="panel recent-panel">
          <div class="panel-heading">
            <div>
              <h2>Novedades recientes</h2>
              <p>Últimos registros reportados</p>
            </div>
            <a routerLink="/novedades" class="view-all">Ver todas <span>→</span></a>
          </div>

          <div class="recent-list">
            @for (novedad of novedadesRecientes(); track novedad.id) {
              <a routerLink="/novedades" class="recent-row">
                <span class="recent-main">
                  <strong>{{ novedad.pieza_reportada || novedad.descripcion_novedad || 'Novedad sin descripción' }}</strong>
                  <small>{{ novedad.serial || 'Sin serial' }} · {{ novedad.proveedor || 'Sin proveedor' }}</small>
                </span>
                <span class="status-pill" [class]="estadoClass(novedad.estado_gestion)">
                  {{ estadoLabel(novedad.estado_gestion) }}
                </span>
              </a>
            } @empty {
              <p class="empty-note">Aún no hay novedades registradas.</p>
            }
          </div>
        </article>
      </section>

      <section class="panel faults-panel">
        <div class="panel-heading">
          <div>
            <h2>Fallas más frecuentes</h2>
            <p>Tipos de falla repetidos en las novedades</p>
          </div>
          <ng-icon name="lucideAlertTriangle" />
        </div>
        <div class="faults-table-wrap">
          <table class="faults-table">
            <thead>
              <tr>
                <th>Tipo de falla</th>
                <th>Frecuencia</th>
                <th class="count-column">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              @for (falla of fallasFrecuentes(); track falla.nombre) {
                <tr>
                  <td>{{ falla.nombre }}</td>
                  <td><div class="fault-bar"><span [style.width.%]="falla.porcentaje"></span></div></td>
                  <td class="count-column"><strong>{{ falla.total }}</strong></td>
                </tr>
              } @empty {
                <tr><td colspan="3" class="empty-cell">Aún no hay fallas registradas.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: `
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      color: #14213d;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 1rem;
    }
    .kpi-card {
      min-height: 116px;
      padding: 1rem 1.1rem;
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 0.75rem;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.45rem;
      text-decoration: none;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .kpi-card strong {
      color: #14213d;
      font-size: 1.6rem;
      line-height: 1;
      font-weight: 800;
    }
    .kpi-card span {
      color: #4d6483;
      font-size: 0.78rem;
      line-height: 1.25;
    }
    .kpi-icon {
      font-size: 1.3rem;
    }
    .kpi-link { cursor: pointer; }
    .kpi-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 14px rgba(30, 64, 175, 0.12);
    }
    .kpi-link:focus-visible,
    .recent-row:focus-visible,
    .legend-row:focus-visible,
    .view-all:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 2px;
    }
    .kpi-blue { background: #eef5ff; }
    .kpi-blue .kpi-icon { color: #2563eb; }
    .kpi-purple { background: #f0f1ff; }
    .kpi-purple .kpi-icon { color: #6d28d9; }
    .kpi-teal { background: #edfbf6; }
    .kpi-teal .kpi-icon { color: #0f9f78; }
    .kpi-amber { background: #fff9e8; }
    .kpi-amber .kpi-icon { color: #b45309; }
    .kpi-red { background: #fff0f1; }
    .kpi-red .kpi-icon { color: #e63963; }
    .kpi-yellow { background: #fffbea; }
    .kpi-yellow .kpi-icon { color: #d97706; }

    .main-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 1.5rem;
    }
    .panel {
      background: #fff;
      border: 1px solid #dbe3ee;
      border-radius: 0.75rem;
      box-shadow: 0 2px 5px rgba(15, 23, 42, 0.08);
      padding: 1.25rem;
    }
    .panel-heading {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .panel-heading h2 {
      margin: 0;
      color: #14213d;
      font-size: 1rem;
      font-weight: 700;
    }
    .panel-heading p {
      margin: 0.3rem 0 0;
      color: #7b8da7;
      font-size: 0.78rem;
    }
    .panel-heading > ng-icon {
      color: #2563eb;
      font-size: 1.25rem;
    }
    .view-all {
      color: #1477d4;
      font-size: 0.78rem;
      text-decoration: none;
      white-space: nowrap;
    }
    .view-all span { font-size: 1rem; }

    .status-content {
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: 2rem;
      min-height: 250px;
    }
    .donut {
      width: 174px;
      height: 174px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
    }
    .donut-center {
      width: 104px;
      height: 104px;
      border-radius: 50%;
      background: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .donut-center strong {
      color: #14213d;
      font-size: 1.35rem;
    }
    .donut-center span {
      color: #7b8da7;
      font-size: 0.7rem;
    }
    .legend {
      min-width: 190px;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .legend-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      width: 100%;
      padding: 0.2rem 0;
      border: 0;
      background: transparent;
      color: #526985;
      font: inherit;
      font-size: 0.8rem;
      cursor: pointer;
      text-align: left;
    }
    .legend-row strong { color: #14213d; }
    .legend-label { display: flex; align-items: center; gap: 0.5rem; }
    .legend-dot { width: 10px; height: 10px; border-radius: 2px; }

    .recent-list { display: flex; flex-direction: column; }
    .recent-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #edf1f6;
      color: inherit;
      text-decoration: none;
    }
    .recent-row:first-child { padding-top: 0; }
    .recent-row:last-child { border-bottom: 0; padding-bottom: 0; }
    .recent-main { min-width: 0; display: flex; flex-direction: column; gap: 0.18rem; }
    .recent-main strong {
      overflow: hidden;
      color: #19345d;
      font-size: 0.88rem;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .recent-main small { color: #8a9ab1; font-size: 0.75rem; }
    .status-pill {
      flex: 0 0 auto;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 700;
    }
    .status-pill.abierta { background: #fff4c7; color: #a16207; }
    .status-pill.en_proceso { background: #dbeafe; color: #1d4ed8; }
    .status-pill.cerrada { background: #d1fae5; color: #047857; }
    .status-pill.sin_gestion { background: #e8edf3; color: #64748b; }
    .status-pill.default { background: #e8edf3; color: #64748b; }

    .faults-panel { padding-bottom: 0.5rem; }
    .faults-table-wrap { overflow-x: auto; }
    .faults-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    .faults-table th {
      padding: 0.7rem 0.5rem;
      background: #f7f9fc;
      color: #6a7d97;
      font-size: 0.72rem;
      font-weight: 700;
      text-align: left;
    }
    .faults-table td {
      padding: 0.8rem 0.5rem;
      border-bottom: 1px solid #edf1f6;
      color: #314b6d;
    }
    .faults-table tbody tr:last-child td { border-bottom: 0; }
    .count-column { text-align: right !important; }
    .count-column strong { color: #14213d; }
    .fault-bar {
      height: 7px;
      min-width: 100px;
      overflow: hidden;
      background: #edf3fb;
      border-radius: 999px;
    }
    .fault-bar span {
      display: block;
      height: 100%;
      background: #3b82f6;
      border-radius: inherit;
    }
    .empty-note, .empty-cell {
      color: #8a9ab1;
      font-size: 0.82rem;
    }
    .empty-note { margin: 0; }
    .empty-cell { padding: 1rem 0.5rem !important; text-align: center; }

    @media (max-width: 1200px) {
      .kpi-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (max-width: 820px) {
      .main-grid { grid-template-columns: 1fr; }
      .status-content { justify-content: center; }
    }
    @media (max-width: 560px) {
      .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
      .kpi-card { min-height: 105px; padding: 0.85rem; }
      .kpi-card strong { font-size: 1.35rem; }
      .status-content { flex-direction: column; gap: 1.25rem; }
      .legend { width: 100%; min-width: 0; }
      .recent-row { align-items: flex-start; flex-direction: column; gap: 0.5rem; }
    }
  `
})
export class DashboardComponent {
  service = inject(DashboardService);

  marcasConTotal = computed<MarcaTotal[]>(() => this.service.marcas().map(marca => ({
    ...marca,
    total: this.service.equipos().filter(equipo => equipo.id_marca === marca.id).length
  })));

  totalMantenimientoCorrectivo = computed(() => this.service.novedades().filter(n => n.continua_mantenimiento).length);
  totalCuarentena = computed(() => this.service.novedades().filter(n => n.cuarentena).length);
  totalDeBaja = computed(() => this.service.novedades().filter(n => n.de_baja).length);
  totalNovedades = computed(() => this.service.novedades().length);

  totalPendientesCerrar = computed(() => this.service.novedades().filter(n => n.estado_gestion === 'abierta').length);
  totalEnProceso = computed(() => this.service.novedades().filter(n => n.estado_gestion === 'en_proceso').length);
  totalSinGestion = computed(() => this.service.novedades().filter(n => n.estado_gestion === 'sin_gestion').length);
  totalCerradas = computed(() => this.service.novedades().filter(n => n.estado_gestion === 'cerrada').length);

  estadosResumen = computed<EstadoResumen[]>(() => [
    { key: 'abierta', label: 'Pendientes por cerrar', total: this.totalPendientesCerrar(), color: '#f59e0b', background: '#fff4c7' },
    { key: 'en_proceso', label: 'En proceso', total: this.totalEnProceso(), color: '#3b82f6', background: '#dbeafe' },
    { key: 'sin_gestion', label: 'Sin gestión', total: this.totalSinGestion(), color: '#94a3b8', background: '#e8edf3' },
    { key: 'cerrada', label: 'Cerradas', total: this.totalCerradas(), color: '#10b981', background: '#d1fae5' }
  ]);

  estadoDonutBackground = computed(() => {
    const estados = this.estadosResumen();
    const total = estados.reduce((sum, estado) => sum + estado.total, 0);
    if (!total) return '#edf1f6';

    let start = 0;
    const segments = estados.map(estado => {
      const end = start + (estado.total / total) * 100;
      const segment = `${estado.color} ${start}% ${end}%`;
      start = end;
      return segment;
    });
    return `conic-gradient(${segments.join(', ')})`;
  });

  novedadesRecientes = computed(() => this.service.novedades().slice(0, 5));

  fallasFrecuentes = computed<FallaFrecuente[]>(() => {
    const counts = new Map<string, number>();
    for (const novedad of this.service.novedades()) {
      const falla = (novedad.tipo_falla || '').trim();
      if (falla) counts.set(falla, (counts.get(falla) || 0) + 1);
    }
    const sorted = [...counts.entries()]
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    const max = sorted[0]?.total || 1;
    return sorted.map(falla => ({ ...falla, porcentaje: Math.round((falla.total / max) * 100) }));
  });

  ngOnInit(): void {
    void this.service.loadDashboardData();
  }

  cardValue(total: number): string | number {
    return this.service.isLoading() ? '—' : total;
  }

  marcaTotal(nombre: string): number {
    const marca = this.marcasConTotal().find(item => item.nombre.toLowerCase() === nombre.toLowerCase());
    return marca?.total || 0;
  }

  estadoLabel(estado: string | null): string {
    return {
      abierta: 'Pendiente',
      en_proceso: 'En proceso',
      cerrada: 'Cerrada',
      sin_gestion: 'Sin gestión'
    }[estado || ''] || 'Sin estado';
  }

  estadoClass(estado: string | null): string {
    return estado && ['abierta', 'en_proceso', 'cerrada', 'sin_gestion'].includes(estado) ? estado : 'default';
  }
}
