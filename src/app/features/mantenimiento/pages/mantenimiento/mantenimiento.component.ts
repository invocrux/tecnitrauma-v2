import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideWrench, lucidePrinter, lucideSend, lucideSave } from '@ng-icons/lucide';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { ToastService } from '../../../../core/services/toast.service';
import type { MantenimientoForm } from '../../utils/interface';

@Component({
  selector: 'app-mantenimiento',
  imports: [FormsModule, NgIconComponent, ButtonComponent],
  providers: [provideIcons({ lucideWrench, lucidePrinter, lucideSend, lucideSave })],
  template: `
    <div class="page-container">
      <div class="page-card">
        <div class="card-header">
          <div class="header-title">
            <ng-icon name="lucideWrench" class="header-icon"></ng-icon>
            <h1>Reporte de Mantenimiento</h1>
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
                <input id="numRemision" type="text" [(ngModel)]="form.num_remision" name="num_remision" placeholder="REM-001" />
              </div>

              <div class="form-field">
                <label for="proveedor">Proveedor</label>
                <select id="proveedor" [(ngModel)]="form.proveedor_id" name="proveedor_id">
                  <option [ngValue]="null">Seleccionar...</option>
                  @for (prov of service.proveedores(); track prov.id) {
                    <option [value]="prov.id">{{ prov.nombre }}</option>
                  }
                </select>
              </div>

              <div class="form-field">
                <label for="setInstrumental">Set / Instrumental</label>
                <select id="setInstrumental" [(ngModel)]="form.set_instrumental_id" name="set_instrumental_id">
                  <option [ngValue]="null">Seleccionar...</option>
                  @for (inst of service.instrumentales(); track inst.id) {
                    <option [value]="inst.id">{{ inst.nombre }}</option>
                  }
                </select>
              </div>

              <div class="form-field">
                <label for="serial">Serial</label>
                <input id="serial" type="text" [(ngModel)]="form.serial" name="serial" placeholder="SN-12345" />
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
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-card {
      background: #fff;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
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

    h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e40af;
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
      gap: 0.375rem;
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
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      background: #fff;
      color: #1e293b;
      transition: all 0.15s;
      font-family: inherit;
      width: 100%;
      box-sizing: border-box;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    input::placeholder, textarea::placeholder {
      color: #94a3b8;
    }

    input:hover, select:hover, textarea:hover {
      border-color: #94a3b8;
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
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
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

  private emptyForm(): MantenimientoForm {
    return {
      tipo: null,
      num_remision: '',
      proveedor_id: null,
      set_instrumental_id: null,
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
  }

  onPrint(): void {
    window.print();
  }

  onEnviar(): void {
    this.toast.info('Funcionalidad en desarrollo');
  }
}
