import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideAlertCircle, lucidePrinter, lucideSend, lucideSave, lucideTrash2 } from '@ng-icons/lucide';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ConfirmDeleteModalComponent } from '../../../../shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { ReportListPanelComponent, type ReportListItem } from '../../../../shared/components/report-list-panel/report-list-panel.component';
import { NovedadesCXService } from '../../services/novedades-cx.service';
import { ToastService } from '../../../../core/services/toast.service';
import type { NovedadCXForm, NovedadCX } from '../../utils/interface';

@Component({
  selector: 'app-novedades-cx',
  imports: [FormsModule, NgIconComponent, ButtonComponent, ConfirmDeleteModalComponent, ReportListPanelComponent],
  providers: [provideIcons({ lucideAlertCircle, lucidePrinter, lucideSend, lucideSave, lucideTrash2 })],
  template: `
    <div class="page-container">
      <app-report-list-panel
        [items]="novedadesList()"
        [selectedId]="selectedNovedad()?.id ?? null"
        searchPlaceholder="Buscar por N° remisión o serial..."
        [searchTerm]="searchTerm()"
        [isLoading]="service.isLoading()"
        (onNewClicked)="onNuevo()"
        (onItemClicked)="onSelect($event)"
        (onSearchChanged)="onSearch($event)">
      </app-report-list-panel>

      <div class="page-card">
        <div class="card-header">
          <div class="header-title">
            <ng-icon name="lucideAlertCircle" class="header-icon"></ng-icon>
            <div class="header-text">
              <h1>Reporte Novedad CX</h1>
              <span class="header-subtitle">Customer Experience</span>
            </div>
          </div>
        </div>

        <form class="card-body" (ngSubmit)="onSubmit()">
          <section class="form-section">
            <h2 class="section-title">INFORMACIÓN GENERAL</h2>
            <div class="form-grid">
              <div class="form-field">
                <label for="fechaCirugia">Fecha de Cirugía</label>
                <input id="fechaCirugia" type="date" [(ngModel)]="form.fecha_cirugia" name="fecha_cirugia" />
              </div>

              <div class="form-field">
                <label for="numRemision">Número de Remisión</label>
                <input id="numRemision" type="text" [(ngModel)]="form.num_remision" name="num_remision" placeholder="REM-001" />
              </div>

              <div class="form-field">
                <label for="numCaso">Número de Caso</label>
                <input id="numCaso" type="text" [(ngModel)]="form.num_caso" name="num_caso" placeholder="CASE-001" />
              </div>

              <div class="form-field">
                <label for="setInstrumental">Set / Instrumental</label>
                <input id="setInstrumental" type="text" [(ngModel)]="form.set_instrumental" name="set_instrumental" placeholder="Set de林业" />
              </div>

              <div class="form-field">
                <label for="serial">Serial</label>
                <input id="serial" type="text" [(ngModel)]="form.serial" name="serial" placeholder="SN-00000" />
              </div>

              <div class="form-field">
                <label for="piezaReportada">Pieza Reportada</label>
                <input id="piezaReportada" type="text" [(ngModel)]="form.pieza_reportada" name="pieza_reportada" placeholder="Placa base" />
              </div>

              <div class="form-field">
                <label for="referencia">Referencia</label>
                <input id="referencia" type="text" [(ngModel)]="form.referencia" name="referencia" placeholder="REF-001" />
              </div>

              <div class="form-field">
                <label for="fechaInspeccion">Fecha de Inspección</label>
                <input id="fechaInspeccion" type="date" [(ngModel)]="form.fecha_inspeccion" name="fecha_inspeccion" />
              </div>
            </div>
          </section>

          <section class="form-section">
            <h2 class="section-title">GESTIÓN</h2>
            <div class="form-grid">
              <div class="form-field">
                <label for="realizadoPor">Realizado por</label>
                <select id="realizadoPor" [(ngModel)]="form.realizado_por" name="realizado_por">
                  <option [ngValue]="null">Seleccionar...</option>
                </select>
              </div>

              <div class="form-field">
                <label for="proveedor">Proveedor</label>
                <input id="proveedor" type="text" [(ngModel)]="form.proveedor" name="proveedor" placeholder="Nombre del proveedor" />
              </div>

              <div class="form-field">
                <label for="continuaMantenimiento">¿Continúa en Mantenimiento Correctivo?</label>
                <select id="continuaMantenimiento" [(ngModel)]="form.continua_mantenimiento" name="continua_mantenimiento">
                  <option [ngValue]="true">Sí</option>
                  <option [ngValue]="false">No</option>
                </select>
              </div>

              <div class="form-field">
                <label for="estadoGestion">Estado de Gestión</label>
                <select id="estadoGestion" [(ngModel)]="form.estado_gestion" name="estado_gestion">
                  <option value="abierta">Abierta</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="cerrada">Cerrada</option>
                  <option value="sin_gestion">Sin Gestión</option>
                </select>
              </div>
            </div>
          </section>

          <section class="form-section">
            <h2 class="section-title">NOVEDAD Y ACCIÓN</h2>
            <div class="form-grid">
              <div class="form-field full-width">
                <label for="descripcionNovedad">Descripción de la Novedad</label>
                <textarea id="descripcionNovedad" [(ngModel)]="form.descripcion_novedad" name="descripcion_novedad" rows="3" placeholder="Describa la novedad presentada..."></textarea>
                @if (errors()['descripcion_novedad']) {
                  <span class="field-error">{{ errors()['descripcion_novedad'] }}</span>
                }
              </div>

              <div class="form-field">
                <label for="tipoFalla">Tipo de Falla</label>
                <select id="tipoFalla" [(ngModel)]="form.tipo_falla" name="tipo_falla">
                  <option [ngValue]="null">Seleccionar...</option>
                  <option value="mecanica">Mecánica</option>
                  <option value="electrica">Eléctrica</option>
                  <option value="software">Software</option>
                  <option value="material">Material</option>
                  <option value="uso_inadecuado">Uso Inadecuado</option>
                  <option value="otra">Otra</option>
                </select>
              </div>

              <div class="form-field full-width">
                <label for="descripcionAccion">Descripción de la Acción Realizada</label>
                <textarea id="descripcionAccion" [(ngModel)]="form.descripcion_accion" name="descripcion_accion" rows="3" placeholder="Describa la acción realizada..."></textarea>
              </div>
            </div>
          </section>

          <section class="form-section">
            <h2 class="section-title">EVIDENCIA Y OBSERVACIONES</h2>
            <div class="form-grid">
              <div class="form-field full-width">
                <label for="fotografiaEvidencia">Fotografía de Evidencia</label>
                <input id="fotografiaEvidencia" type="text" [(ngModel)]="form.fotografia_evidencia" name="fotografia_evidencia" placeholder="URL de la imagen" />
              </div>

              <div class="form-field full-width">
                <label for="observaciones">Observaciones</label>
                <textarea id="observaciones" [(ngModel)]="form.observaciones" name="observaciones" rows="2" placeholder="Observaciones adicionales..."></textarea>
              </div>
            </div>
          </section>

          <div class="card-footer">
            <app-button
              variant="secondary"
              icon="lucidePrinter"
              type="button"
              (clicked)="onPrint()">
              Imprimir
            </app-button>

            <div class="footer-right">
              @if (isEditing()) {
                <app-button
                  variant="danger"
                  icon="lucideTrash2"
                  type="button"
                  (clicked)="onDelete()">
                  Eliminar
                </app-button>
              }
              <app-button
                variant="secondary"
                icon="lucideSend"
                type="button"
                (clicked)="onEnviar()">
                Enviar
              </app-button>
              <app-button
                variant="primary"
                icon="lucideSave"
                type="submit"
                [loading]="service.isLoading()">
                {{ isEditing() ? 'Actualizar' : 'Guardar' }}
              </app-button>
            </div>
          </div>
        </form>
      </div>

      <app-confirm-delete-modal
        [open]="showDeleteModal()"
        [itemName]="selectedNovedad()?.num_remision || ''"
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

    .page-card {
      flex: 1;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }

    .card-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: #fafafa;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-icon {
      width: 32px;
      height: 32px;
      color: #dc2626;
    }

    .header-text h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
    }

    .header-subtitle {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .card-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }

    .form-section {
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 1rem 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      grid-column: 1 / -1;
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
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    input[readonly] {
      background: #f9fafb;
      cursor: pointer;
    }

    textarea {
      resize: vertical;
      min-height: 60px;
    }

    .field-error {
      font-size: 0.75rem;
      color: #dc2626;
      margin-top: 0.25rem;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      background: #fafafa;
    }

    .footer-right {
      display: flex;
      gap: 0.5rem;
    }

    @media (max-width: 1024px) {
      .form-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class NovedadesCXComponent implements OnInit {
  service = inject(NovedadesCXService);
  private toast = inject(ToastService);

  form: NovedadCXForm = this.emptyForm();
  errors = signal<Record<string, string>>({});
  selectedNovedad = signal<NovedadCX | null>(null);
  showDeleteModal = signal(false);
  searchTerm = signal('');

  novedadesList = computed<ReportListItem[]>(() => {
    return this.service.novedades().map(n => ({
      id: n.id!,
      num_remision: n.num_remision,
      serial: n.serial,
      estado: n.estado_gestion,
      tipo: n.tipo_falla as any,
      fecha: n.fecha_cirugia
    }));
  });

  isEditing = computed(() => this.selectedNovedad() !== null);

  private emptyForm(): NovedadCXForm {
    return {
      fecha_cirugia: this.service.getTodayDate(),
      num_remision: '',
      num_caso: '',
      set_instrumental: '',
      serial: '',
      pieza_reportada: '',
      referencia: '',
      fecha_inspeccion: this.service.getTodayDate(),
      realizado_por: null,
      proveedor: '',
      continua_mantenimiento: false,
      estado_gestion: 'abierta',
      descripcion_novedad: '',
      tipo_falla: null,
      descripcion_accion: '',
      fotografia_evidencia: '',
      observaciones: ''
    };
  }

  ngOnInit(): void {
    this.service.loadNovedades();
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  onNuevo(): void {
    this.selectedNovedad.set(null);
    this.form = this.emptyForm();
    this.errors.set({});
  }

  onSelect(item: ReportListItem): void {
    const novedad = this.service.novedades().find(n => n.id === String(item.id));
    if (novedad) {
      this.selectedNovedad.set(novedad);
      this.form = this.fromReporte(novedad);
      this.errors.set({});
    }
  }

  private fromReporte(novedad: NovedadCX): NovedadCXForm {
    return {
      fecha_cirugia: novedad.fecha_cirugia,
      num_remision: novedad.num_remision,
      num_caso: novedad.num_caso,
      set_instrumental: novedad.set_instrumental,
      serial: novedad.serial,
      pieza_reportada: novedad.pieza_reportada,
      referencia: novedad.referencia,
      fecha_inspeccion: novedad.fecha_inspeccion,
      realizado_por: novedad.realizado_por,
      proveedor: novedad.proveedor,
      continua_mantenimiento: novedad.continua_mantenimiento,
      estado_gestion: novedad.estado_gestion,
      descripcion_novedad: novedad.descripcion_novedad,
      tipo_falla: novedad.tipo_falla,
      descripcion_accion: novedad.descripcion_accion,
      fotografia_evidencia: novedad.fotografia_evidencia,
      observaciones: novedad.observaciones
    };
  }

  validate(): boolean {
    const errs: Record<string, string> = {};

    if (!this.form.descripcion_novedad.trim()) {
      errs['descripcion_novedad'] = 'La descripción de la novedad es requerida';
    }

    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  async onSubmit(): Promise<void> {
    if (!this.validate()) {
      this.toast.error('Por favor complete los campos requeridos');
      return;
    }

    await this.service.guardar(this.form);
    this.form = this.emptyForm();
    this.selectedNovedad.set(null);
  }

  onDelete(): void {
    if (this.selectedNovedad()) {
      this.showDeleteModal.set(true);
    }
  }

  async onConfirmDelete(): Promise<void> {
    const selected = this.selectedNovedad();
    if (selected?.id) {
      const success = await this.service.eliminar(selected.id);
      if (success) {
        this.showDeleteModal.set(false);
        this.selectedNovedad.set(null);
        this.form = this.emptyForm();
      }
    }
  }

  onPrint(): void {
    this.toast.info('Impresión no implementada aún');
  }

  onEnviar(): void {
    this.toast.info('Envío no implementado aún');
  }
}
