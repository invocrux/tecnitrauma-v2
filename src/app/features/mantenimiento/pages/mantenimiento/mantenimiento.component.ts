import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideWrench, lucidePrinter, lucideSend, lucideSave, lucideTrash2, lucideSearch } from '@ng-icons/lucide';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ConfirmDeleteModalComponent } from '../../../../shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { ReportListPanelComponent, type ReportListItem } from '../../../../shared/components/report-list-panel/report-list-panel.component';
import { SearchModalComponent, type SearchItem } from '../../../../shared/components/search-modal/search-modal.component';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { ToastService } from '../../../../core/services/toast.service';
import type { MantenimientoReporte } from '../../utils/interface';

@Component({
  selector: 'app-mantenimiento',
  imports: [ReactiveFormsModule, NgIconComponent, ButtonComponent, ConfirmDeleteModalComponent, TitleCasePipe, ReportListPanelComponent, SearchModalComponent],
  providers: [provideIcons({ lucideWrench, lucidePrinter, lucideSend, lucideSave, lucideTrash2, lucideSearch })],
  template: `
    <div class="page-container">
      <!-- List Panel -->
      <app-report-list-panel
        [items]="reportesList()"
        [selectedId]="selectedReporte()?.id ?? null"
        searchPlaceholder="Buscar por N° remisión o serial..."
        [searchTerm]="searchTerm()"
        [isLoading]="service.isLoading()"
        (onNewClicked)="onNuevo()"
        (onItemClicked)="onSelect($event)"
        (onSearchChanged)="onSearch($event)">
      </app-report-list-panel>

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

        <form class="card-body" [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Sección 1: Identificación -->
          <section class="form-section">
            <h2 class="section-title">INFORMACIÓN GENERAL</h2>
            <div class="form-grid">
              <div class="form-field">
                <label for="tipo">Tipo de mantenimiento</label>
                <select id="tipo" formControlName="tipo">
                  <option [ngValue]="null">Seleccionar...</option>
                  <option value="correctivo">Correctivo</option>
                  <option value="predictivo">Predictivo</option>
                  <option value="preventivo">Preventivo</option>
                </select>
                @if (form.get('tipo')?.invalid && form.get('tipo')?.touched) {
                  <span class="field-error">Este campo es obligatorio</span>
                }
              </div>

              <div class="form-field">
                <label for="numRemision">N° de remisión</label>
                <input id="numRemision" type="text" formControlName="num_remision" />
                @if (form.get('num_remision')?.invalid && form.get('num_remision')?.touched) {
                  <span class="field-error">Este campo es obligatorio</span>
                }
              </div>

              <div class="form-field">
                <label for="proveedor">Proveedor</label>
                <select id="proveedor" formControlName="marca_id">
                  <option [ngValue]="null">Seleccionar...</option>
                  @for (marca of service.marcas(); track marca.id) {
                    <option [value]="marca.id">{{ marca.nombre }}</option>
                  }
                </select>
                @if (form.get('marca_id')?.invalid && form.get('marca_id')?.touched) {
                  <span class="field-error">Este campo es obligatorio</span>
                }
              </div>

              <div class="form-field">
                <label for="serial">Serial</label>
                <div class="search-input-wrapper">
                  <input
                    type="text"
                    [value]="selectedSetDisplay()"
                    placeholder="Seleccionar serial..."
                    readonly
                    class="search-field-input"
                  />
                  <button type="button" class="search-btn" (click)="openSerialModal()">
                    <ng-icon name="lucideSearch" />
                  </button>
                </div>
                @if (form.get('serial')?.invalid && form.get('serial')?.touched) {
                  <span class="field-error">Este campo es obligatorio</span>
                }
              </div>

              <div class="form-field">
                <label for="equipo">Equipo</label>
                <input id="equipo" type="text" [value]="selectedSetNombre()" readonly class="readonly-input" />
              </div>
            </div>
          </section>

          <!-- Sección 2: Trabajo -->
          <section class="form-section">
            <h2 class="section-title">Trabajo</h2>
            <div class="form-grid">
              <div class="form-field">
                <label for="pieza">Pieza para mantenimiento</label>
                <div class="search-input-wrapper">
                  <input
                    type="text"
                    [value]="selectedPiezaNombre()"
                    placeholder="Seleccionar pieza..."
                    readonly
                    class="search-field-input"
                  />
                  <button type="button" class="search-btn" (click)="openPiezaModal()" [disabled]="!form.get('serial')?.value">
                    <ng-icon name="lucideSearch" />
                  </button>
                </div>
                @if (form.get('pieza')?.invalid && form.get('pieza')?.touched) {
                  <span class="field-error">Este campo es obligatorio</span>
                }
              </div>

              <div class="form-field">
                <label for="referencia">Referencia</label>
                <input id="referencia" type="text" [value]="selectedPiezaReferencia()" readonly class="readonly-input" />
                @if (form.get('referencia')?.invalid && form.get('referencia')?.touched) {
                  <span class="field-error">Este campo es obligatorio</span>
                }
              </div>

              <div class="form-field">
                <label for="fecha">Fecha de Solicitud para Mantenimiento</label>
                <input id="fecha" type="date" formControlName="fecha" />
                @if (form.get('fecha')?.invalid && form.get('fecha')?.touched) {
                  <span class="field-error">Este campo es obligatorio</span>
                }
              </div>

              <div class="form-row-2">
                <div class="form-field">
                  <label for="realizadoPor">Realizado por</label>
                  <select id="realizadoPor" formControlName="realizado_por">
                    <option [ngValue]="null">Seleccionar...</option>
                    @for (user of service.usuarios(); track user.id) {
                      <option [value]="user.id">{{ (user.full_name || 'Nombre no registrado') | titlecase }}</option>
                    }
                  </select>
                  @if (form.get('realizado_por')?.invalid && form.get('realizado_por')?.touched) {
                    <span class="field-error">Este campo es obligatorio</span>
                  }
                </div>

                <div class="form-field">
                  <label for="supervisadoPor">Supervisado por</label>
                  <select id="supervisadoPor" formControlName="supervisado_por">
                    <option [ngValue]="null">Seleccionar...</option>
                    @for (user of service.usuarios(); track user.id) {
                      <option [value]="user.id">{{ (user.full_name || 'Nombre no registrado') | titlecase }}</option>
                    }
                  </select>
                  @if (form.get('supervisado_por')?.invalid && form.get('supervisado_por')?.touched) {
                    <span class="field-error">Este campo es obligatorio</span>
                  }
                </div>
              </div>
            </div>
          </section>

          <!-- Sección 3: Descripción -->
          <section class="form-section">
            <h2 class="section-title">Descripción</h2>
            <div class="form-grid">
              <div class="form-field full-width">
                <label for="motivo">Motivo de solicitud</label>
                <textarea id="motivo" formControlName="motivo" rows="3" placeholder="Describa el motivo de la solicitud..."></textarea>
                @if (form.get('motivo')?.invalid && form.get('motivo')?.touched) {
                  <span class="field-error">Este campo es obligatorio</span>
                }
              </div>

              <div class="form-field full-width">
                <label for="descripcion">Descripción del mantenimiento</label>
                <textarea id="descripcion" formControlName="descripcion" rows="4" placeholder="Detalle el trabajo realizado..."></textarea>
                @if (form.get('descripcion')?.invalid && form.get('descripcion')?.touched) {
                  <span class="field-error">Este campo es obligatorio</span>
                }
              </div>

              <div class="form-field full-width">
                <label for="observaciones">Observaciones</label>
                <textarea id="observaciones" formControlName="observaciones" rows="2" placeholder="Observaciones adicionales..."></textarea>
                @if (form.get('observaciones')?.invalid && form.get('observaciones')?.touched) {
                  <span class="field-error">Este campo es obligatorio</span>
                }
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
              <app-button variant="primary" type="submit" [loading]="service.isLoading()" [disabled]="form.invalid">
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

    <app-search-modal
      [title]="'Buscar Serial'"
      [placeholder]="'Buscar por serial...'"
      [items]="serialSearchItems()"
      [selectedId]="form.get('serial')?.value"
      [isOpen]="showSerialModal()"
      (itemSelected)="onSerialSelected($event)"
      (closed)="showSerialModal.set(false)">
    </app-search-modal>

    <app-search-modal
      [title]="'Buscar Pieza'"
      [placeholder]="'Buscar por nombre...'"
      [items]="piezaSearchItems()"
      [selectedId]="form.get('pieza')?.value"
      [isOpen]="showPiezaModal()"
      (itemSelected)="onPiezaSelected($event)"
      (closed)="showPiezaModal.set(false)">
    </app-search-modal>
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

    .search-input-wrapper {
      position: relative;
      display: flex;
      gap: 0.5rem;
    }

    .search-field-input {
      flex: 1;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      background: #fff;
      color: #374151;
      cursor: pointer;
      font-family: inherit;
    }

    .search-field-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .readonly-input {
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      background: #f9fafb;
      color: #6b7280;
      font-family: inherit;
    }

    .search-btn {
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      background: #fff;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }

    .search-btn:hover {
      background: #f3f4f6;
      color: #374151;
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
  private fb = inject(FormBuilder);

  form!: FormGroup;
  selectedReporte = signal<MantenimientoReporte | null>(null);
  showDeleteModal = signal(false);
  showSerialModal = signal(false);
  showPiezaModal = signal(false);
  searchTerm = signal('');
  private formChangeTrigger = signal(0);

  reportesList = computed<ReportListItem[]>(() => {
    return this.service.reportes().map(r => ({
      id: r.id!,
      num_remision: r.num_remision,
      serial: r.serial,
      estado: r.estado,
      tipo: r.tipo,
      fecha: r.fecha
    }));
  });

  isEditing = computed(() => this.selectedReporte() !== null);

  serialSearchItems = computed<SearchItem[]>(() => {
    this.formChangeTrigger();
    return this.service.setsInstrumentales().map(s => ({
      id: s.serial,
      label: `${s.serial} - ${s.nombre}`,
      sublabel: s.serial
    }));
  });

  selectedSetDisplay = computed(() => {
    this.formChangeTrigger();
    const serial = this.form.get('serial')?.value;
    if (!serial) return '';
    const set = this.service.setsInstrumentales().find(s => s.serial === serial);
    return set ? `${set.serial} - ${set.nombre}` : '';
  });

  selectedSetNombre = computed(() => {
    this.formChangeTrigger();
    const serial = this.form.get('serial')?.value;
    if (!serial) return '';
    const set = this.service.setsInstrumentales().find(s => s.serial === serial);
    return set?.nombre || '';
  });

  piezaSearchItems = computed<SearchItem[]>(() => {
    this.formChangeTrigger();
    return this.service.setPiezas().map(p => ({
      id: p.id,
      label: p.nombre,
      sublabel: `Ref: ${p.referencia}`
    }));
  });

  selectedPiezaNombre = computed(() => {
    this.formChangeTrigger();
    if (!this.form.get('pieza')?.value) return '';
    const pieza = this.service.setPiezas().find(p => p.id === parseInt(this.form.get('pieza')?.value, 10));
    return pieza?.nombre || '';
  });

  selectedPiezaReferencia = computed(() => {
    this.formChangeTrigger();
    if (!this.form.get('pieza')?.value) return '';
    const pieza = this.service.setPiezas().find(p => p.id === parseInt(this.form.get('pieza')?.value, 10));
    return pieza?.referencia || '';
  });

  private createForm(): FormGroup {
    return this.fb.group({
      tipo: [null, Validators.required],
      num_remision: ['', Validators.required],
      marca_id: [null, Validators.required],
      serial: ['', Validators.required],
      pieza: ['', Validators.required],
      referencia: ['', Validators.required],
      fecha: [this.service.getTodayDate(), Validators.required],
      realizado_por: [null, Validators.required],
      supervisado_por: [null, Validators.required],
      motivo: ['', Validators.required],
      descripcion: ['', Validators.required],
      observaciones: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.form = this.createForm();
    this.service.loadOptions();
    this.service.loadReportes();
    this.service.loadNumeros();
    this.service.loadSetPiezas();
  }

  onSelect(item: ReportListItem): void {
    const reporte = this.service.reportes().find(r => r.id === item.id);
    if (!reporte) return;
    this.selectedReporte.set(reporte);
    this.form.patchValue({
      tipo: reporte.tipo,
      num_remision: reporte.num_remision,
      marca_id: reporte.marca_id,
      serial: reporte.serial,
      pieza: reporte.pieza,
      referencia: reporte.referencia,
      fecha: reporte.fecha,
      realizado_por: reporte.realizado_por,
      supervisado_por: reporte.supervisado_por,
      motivo: reporte.motivo,
      descripcion: reporte.descripcion,
      observaciones: reporte.observaciones
    });
    this.form.markAllAsTouched();
    this.formChangeTrigger.update(v => v + 1);
    if (reporte.serial) {
      const set = this.service.setsInstrumentales().find(s => s.serial === reporte.serial);
      if (set) {
        this.service.loadSetPiezas(set.id);
      }
    }
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  openSerialModal(): void {
    this.showSerialModal.set(true);
  }

  onSerialSelected(item: SearchItem): void {
    this.form.patchValue({ serial: item.id as string, pieza: '', referencia: '' });
    this.formChangeTrigger.update(v => v + 1);
    const set = this.service.setsInstrumentales().find(s => s.serial === item.id);
    if (set) {
      this.service.loadSetPiezas(set.id);
    }
    this.showSerialModal.set(false);
  }

  openPiezaModal(): void {
    this.showPiezaModal.set(true);
  }

  onPiezaSelected(item: SearchItem): void {
    const pieza = this.service.setPiezas().find(p => p.id === item.id);
    this.form.patchValue({ pieza: String(item.id), referencia: pieza?.referencia || '' });
    this.formChangeTrigger.update(v => v + 1);
    this.showPiezaModal.set(false);
  }

  onNuevo(): void {
    this.selectedReporte.set(null);
    this.form = this.createForm();
    this.formChangeTrigger.update(v => v + 1);
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

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Por favor complete los campos requeridos');
      return;
    }

    if (this.form.get('realizado_por')?.value && this.form.get('supervisado_por')?.value &&
        this.form.get('realizado_por')?.value === this.form.get('supervisado_por')?.value) {
      this.toast.error('Supervisado por no puede ser igual a Realizado por');
      return;
    }

    const formValue = this.form.value;
    const success = await this.service.guardar({
      tipo: formValue.tipo,
      num_remision: formValue.num_remision,
      marca_id: formValue.marca_id,
      equipo_id: null,
      serial: formValue.serial,
      pieza: formValue.pieza,
      referencia: formValue.referencia,
      fecha: formValue.fecha,
      realizado_por: formValue.realizado_por,
      supervisado_por: formValue.supervisado_por,
      motivo: formValue.motivo,
      descripcion: formValue.descripcion,
      observaciones: formValue.observaciones
    });

    if (success) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.form = this.createForm();
    this.selectedReporte.set(null);
  }

  onPrint(): void {
    window.print();
  }

  onEnviar(): void {
    this.toast.info('Funcionalidad en desarrollo');
  }
}
