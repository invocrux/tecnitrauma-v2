import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideWrench, lucidePrinter, lucideSend, lucideSave, lucidePlus, lucideTrash2, lucideSearch } from '@ng-icons/lucide';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ConfirmDeleteModalComponent } from '../../../../shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { ToastService } from '../../../../core/services/toast.service';
import type { MantenimientoForm, MantenimientoReporte } from '../../utils/interface';

@Component({
  selector: 'app-mantenimiento',
  imports: [FormsModule, NgIconComponent, ButtonComponent, ConfirmDeleteModalComponent],
  providers: [provideIcons({ lucideWrench, lucidePrinter, lucideSend, lucideSave, lucidePlus, lucideTrash2, lucideSearch })],
  template: `
    <div class="page-container">
      <!-- List Panel -->
      <aside class="list-panel">
        <div class="list-toolbar">
          <button class="btn-nuevo" (click)="onNuevo()">
            <ng-icon name="lucidePlus"></ng-icon>
            Nuevo
          </button>
        </div>
        <div class="search-box">
          <ng-icon name="lucideSearch" class="search-icon"></ng-icon>
          <input type="text" placeholder="Buscar..." />
        </div>
        <div class="report-list">
          @for (reporte of service.reportes(); track reporte.id) {
            <div 
              class="report-card"
              [class.selected]="selectedReporte()?.id === reporte.id"
              (click)="onSelect(reporte)">
              <div class="report-card-header">
                <span class="card-remision">{{ reporte.num_remision }}</span>
                <span class="badge" [class]="'badge-' + reporte.estado">{{ reporte.estado }}</span>
              </div>
              <div class="report-card-content">
                <span class="card-tipo">{{ getTipoLabel(reporte.tipo) }}</span>
                <span class="card-fecha">{{ reporte.fecha }}</span>
              </div>
            </div>
          }
        </div>
      </aside>

      <!-- Form Panel -->
      <div class="page-card">
        <div class="card-header">
          <div class="header-title">
            <ng-icon name="lucideWrench" class="header-icon"></ng-icon>
            <div class="header-text">
              <h1>Reporte Mantenimiento</h1>
              <span class="header-subtitle">Instrumental Quirúrgico</span>
            </div>
          </div>
        </div>

        <form class="card-body" (ngSubmit)="onSubmit()">
          <!-- Sección 1: Identificación -->
          <section class="form-section">
            <h2 class="section-title">Identificación</h2>
            <div class="form-grid">
              <div class="form-field">
                <label for="tipo">Tipo de mantenimiento</label>
                <select id="tipo" [(ngModel)]="form.tipo" name="tipo">
                  <option [ngValue]="null">Seleccionar...</option>
                  <option value="correctivo">Correctivo</option>
                  <option value="predictivo">Predictivo</option>
                  <option value="preventivo">Preventivo</option>
                </select>
                @if (errors()['tipo']) {
                  <span class="field-error">{{ errors()['tipo'] }}</span>
                }
              </div>

              <div class="form-field">
                <label for="numRemision">N° de remisión</label>
                <input id="numRemision" type="text" [(ngModel)]="form.num_remision" name="num_remision" />
              </div>

              <div class="form-field">
                <label for="proveedor">Proveedor</label>
                <select id="proveedor" [(ngModel)]="form.marca_id" name="marca_id">
                  <option [ngValue]="null">Seleccionar...</option>
                  @for (marca of service.marcas(); track marca.id) {
                    <option [value]="marca.id">{{ marca.nombre }}</option>
                  }
                </select>
              </div>

              <div class="form-field">
                <label for="equipo">Equipo</label>
                <select id="equipo" [(ngModel)]="form.equipo_id" name="equipo_id">
                  <option [ngValue]="null">Seleccionar...</option>
                  @for (equipo of service.equipos(); track equipo.id) {
                    <option [value]="equipo.id">{{ equipo.nombre }}</option>
                  }
                </select>
              </div>

              <div class="form-field">
                <label for="serial">Serial</label>
                <input id="serial" type="text" [(ngModel)]="form.serial" name="serial" />
              </div>
            </div>
          </section>

          <!-- Sección 2: Trabajo -->
          <section class="form-section">
            <h2 class="section-title">Trabajo</h2>
            <div class="form-grid">
              <div class="form-field">
                <label for="pieza">Pieza para mantenimiento</label>
                <input id="pieza" type="text" [(ngModel)]="form.pieza" name="pieza" placeholder="Placa base" />
              </div>

              <div class="form-field">
                <label for="referencia">Referencia</label>
                <input id="referencia" type="text" [(ngModel)]="form.referencia" name="referencia" placeholder="REF-001" />
              </div>

              <div class="form-field">
                <label for="fecha">Fecha de mantenimiento</label>
                <input id="fecha" type="date" [(ngModel)]="form.fecha" name="fecha" />
              </div>

              <div class="form-field full-width">
                <label for="realizadoPor">Realizado por</label>
                <select id="realizadoPor" [(ngModel)]="form.realizado_por" name="realizado_por">
                  <option [ngValue]="null">Seleccionar...</option>
                  @for (user of service.usuarios(); track user.id) {
                    <option [value]="user.id">{{ user.email }}</option>
                  }
                </select>
              </div>
            </div>
          </section>

          <!-- Sección 3: Descripción -->
          <section class="form-section">
            <h2 class="section-title">Descripción</h2>
            <div class="form-grid">
              <div class="form-field full-width">
                <label for="motivo">Motivo de solicitud</label>
                <textarea id="motivo" [(ngModel)]="form.motivo" name="motivo" rows="3" placeholder="Describa el motivo de la solicitud..."></textarea>
              </div>

              <div class="form-field full-width">
                <label for="descripcion">Descripción del mantenimiento</label>
                <textarea id="descripcion" [(ngModel)]="form.descripcion" name="descripcion" rows="4" placeholder="Detalle el trabajo realizado..."></textarea>
                @if (errors()['descripcion']) {
                  <span class="field-error">{{ errors()['descripcion'] }}</span>
                }
              </div>

              <div class="form-field full-width">
                <label for="observaciones">Observaciones</label>
                <textarea id="observaciones" [(ngModel)]="form.observaciones" name="observaciones" rows="2" placeholder="Observaciones adicionales..."></textarea>
              </div>
            </div>
          </section>

          <!-- Acciones -->
          <div class="form-actions">
            @if (isEditing()) {
              <app-button variant="danger" type="button" (clicked)="onDelete()" [disabled]="service.isLoading()">
                <ng-icon name="lucideTrash2"></ng-icon>
                Eliminar
              </app-button>
            }
            <div class="actions-right">
              <app-button variant="primary" type="submit" [loading]="service.isLoading()" [disabled]="service.isLoading()">
                <ng-icon name="lucideSave"></ng-icon>
                Guardar
              </app-button>
              <app-button variant="secondary" type="button" (clicked)="onPrint()">
                <ng-icon name="lucidePrinter"></ng-icon>
                Imprimir
              </app-button>
              <app-button variant="tertiary" type="button" (clicked)="onEnviar()">
                <ng-icon name="lucideSend"></ng-icon>
                Enviar
              </app-button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <app-confirm-delete-modal
      [open]="showDeleteModal()"
      [itemName]="selectedReporte()?.num_remision || ''"
      (confirmed)="onConfirmDelete()"
      (cancelled)="showDeleteModal.set(false)">
    </app-confirm-delete-modal>
  `,
  styles: [`
    :host {
      display: flex;
      gap: 1.5rem;
      height: calc(100vh - 120px);
      padding: 1rem;
      box-sizing: border-box;
      min-height: 0;
      overflow: hidden;
    }

    .page-container {
      display: contents;
    }

    /* List Panel */
    .list-panel {
      width: 320px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .list-toolbar {
      display: flex;
      gap: 0.5rem;
    }

    .btn-nuevo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
    }

    .btn-nuevo:hover {
      background: #1d4ed8;
    }

    .btn-nuevo ng-icon {
      width: 16px;
      height: 16px;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-box .search-icon {
      position: absolute;
      left: 0.75rem;
      width: 16px;
      height: 16px;
      color: #94a3b8;
    }

    .search-box input {
      width: 100%;
      padding: 0.5rem 0.75rem 0.5rem 2.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }

    .search-box input:focus {
      outline: none;
      border-color: #2563eb;
    }

    .report-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .report-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 0.75rem;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .report-card:hover {
      border-color: #2563eb;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .report-card.selected {
      border-color: #2563eb;
      background: #eff6ff;
    }

    .report-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .card-remision {
      font-weight: 600;
      font-size: 0.9375rem;
      color: #1e293b;
    }

    .badge {
      font-size: 0.6875rem;
      font-weight: 500;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      text-transform: capitalize;
    }

    .badge-borrador { background: #e2e8f0; color: #475569; }
    .badge-enviado { background: #dbeafe; color: #1d4ed8; }
    .badge-completado { background: #dcfce7; color: #15803d; }

    .report-card-content {
      display: flex;
      justify-content: space-between;
    }

    .card-tipo {
      font-size: 0.8125rem;
      color: #64748b;
    }

    .card-fecha {
      font-size: 0.8125rem;
      color: #64748b;
    }

    /* Original styles below */
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-card {
      flex: 1 1 auto;
      min-width: 0;
      min-height: 0;
      background: #fff;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow-y: auto;
      overflow-x: hidden;
    }

    .card-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      background: #eff6ff;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-icon {
      width: 24px;
      height: 24px;
      color: #2563eb;
    }

    .header-text {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e40af;
    }

    .header-subtitle {
      font-size: 0.8125rem;
      font-weight: 400;
      color: #64748b;
    }

    .card-body {
      padding: 1.5rem;
    }

    .form-section {
      margin-bottom: 1.5rem;
    }

    .form-section:last-of-type {
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: #64748b;
      margin: 0 0 1rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .form-field.full-width {
      grid-column: 1 / -1;
    }

    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    input, select, textarea {
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      background: #fff;
      color: #374151;
      transition: border-color 0.15s, box-shadow 0.15s;
      font-family: inherit;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    input::placeholder, textarea::placeholder {
      color: #9ca3af;
    }

    textarea {
      resize: vertical;
      min-height: 60px;
    }

    select {
      cursor: pointer;
    }

    .field-error {
      font-size: 0.75rem;
      color: #dc2626;
    }

    .form-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .form-actions .actions-right {
      display: flex;
      gap: 0.5rem;
    }

    .form-actions app-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    ng-icon {
      width: 16px;
      height: 16px;
    }

    @media (max-width: 768px) {
      :host {
        height: auto;
        min-height: calc(100vh - 120px);
        flex-direction: column;
        overflow: auto;
      }

      .list-panel {
        width: 100%;
        flex: 0 0 auto;
        max-height: 13rem;
      }

      .report-list {
        min-height: 0;
      }

      .page-card {
        flex: 1 1 auto;
        width: 100%;
        overflow: visible;
      }

      .form-actions {
        flex-wrap: wrap;
      }

      .form-actions .actions-right {
        flex-wrap: wrap;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }
      .form-field.full-width {
        grid-column: 1;
      }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .form-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class MantenimientoComponent implements OnInit {
  service = inject(MantenimientoService);
  private toast = inject(ToastService);

  form: MantenimientoForm = this.emptyForm();
  errors = signal<Record<string, string>>({});
  selectedReporte = signal<MantenimientoReporte | null>(null);
  showDeleteModal = signal(false);

  isEditing = computed(() => this.selectedReporte() !== null);

  private emptyForm(): MantenimientoForm {
    return {
      tipo: null,
      num_remision: '',
      marca_id: null,
      equipo_id: null,
      serial: '',
      pieza: '',
      referencia: '',
      fecha: this.service.getTodayDate(),
      realizado_por: null,
      motivo: '',
      descripcion: '',
      observaciones: ''
    };
  }

  ngOnInit(): void {
    this.service.loadOptions();
    this.service.loadReportes();
    this.service.loadNumeros();
  }

  getTipoLabel(tipo: string | null): string {
    const labels: Record<string, string> = {
      correctivo: 'Correctivo',
      predictivo: 'Predictivo',
      preventivo: 'Preventivo'
    };
    return tipo ? (labels[tipo] || tipo) : '';
  }

  onSelect(reporte: MantenimientoReporte): void {
    this.selectedReporte.set(reporte);
    this.form = {
      tipo: reporte.tipo,
      num_remision: reporte.num_remision,
      marca_id: reporte.marca_id,
      equipo_id: reporte.equipo_id,
      serial: reporte.serial,
      pieza: reporte.pieza,
      referencia: reporte.referencia,
      fecha: reporte.fecha,
      realizado_por: reporte.realizado_por,
      motivo: reporte.motivo,
      descripcion: reporte.descripcion,
      observaciones: reporte.observaciones
    };
  }

  onNuevo(): void {
    this.selectedReporte.set(null);
    this.form = this.emptyForm();
    this.errors.set({});
  }

  onDelete(): void {
    if (this.selectedReporte()) {
      this.showDeleteModal.set(true);
    }
  }

  async onConfirmDelete(): Promise<void> {
    const reporte = this.selectedReporte();
    if (!reporte || !reporte.id) return;

    const success = await this.service.eliminar(reporte.id);
    if (success) {
      this.showDeleteModal.set(false);
      this.onNuevo();
    }
  }

  validate(): boolean {
    const errs: Record<string, string> = {};

    if (!this.form.tipo) {
      errs['tipo'] = 'El tipo de mantenimiento es requerido';
    }
    if (!this.form.descripcion.trim()) {
      errs['descripcion'] = 'La descripción es requerida';
    }

    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  async onSubmit(): Promise<void> {
    if (!this.validate()) {
      this.toast.error('Por favor complete los campos requeridos');
      return;
    }

    const success = await this.service.guardar(this.form);

    if (success) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.form = this.emptyForm();
    this.errors.set({});
    this.selectedReporte.set(null);
  }

  onPrint(): void {
    window.print();
  }

  onEnviar(): void {
    this.toast.info('Funcionalidad en desarrollo');
  }
}
