import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideAlertCircle, lucidePrinter, lucideSend, lucideSave, lucideTrash2, lucideUpload, lucideX, lucideSearch, lucideWrench } from '@ng-icons/lucide';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ConfirmDeleteModalComponent } from '../../../../shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { ReportListPanelComponent, type ReportListItem } from '../../../../shared/components/report-list-panel/report-list-panel.component';
import { SearchModalComponent, type SearchItem } from '../../../../shared/components/search-modal/search-modal.component';
import { NovedadesCXService } from '../../services/novedades-cx.service';
import { ProfileService } from '../../../profile/services/profile.service';
import { ToastService } from '../../../../core/services/toast.service';
import type { NovedadCXForm, NovedadCX } from '../../utils/interface';

@Component({
  selector: 'app-novedades-cx',
  imports: [FormsModule, NgIconComponent, ButtonComponent, ConfirmDeleteModalComponent, ReportListPanelComponent, SearchModalComponent],
  providers: [provideIcons({ lucideAlertCircle, lucidePrinter, lucideSend, lucideSave, lucideTrash2, lucideUpload, lucideX, lucideSearch, lucideWrench })],
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
              <span class="header-subtitle">{{ estadoGestionLabel() }}</span>
            </div>
          </div>
        </div>

        @if (showEmptyState()) {
          <div class="empty-state">
            <img src="assets/new-reporte.svg" alt="Seleccionar novedad" class="empty-state-img" />
            <p class="empty-state-text">Selecciona una novedad para comenzar<br>o el botón <strong>Nuevo</strong> para crear</p>
          </div>
        } @else {
          <form class="card-body" (ngSubmit)="onSubmit()">
            <section class="form-section">
              <h2 class="section-title">INFORMACIÓN GENERAL</h2>
              <div class="form-grid">
                <div class="form-field">
                  <label for="fechaCirugia">Fecha de Cirugía</label>
                  <input id="fechaCirugia" type="date" [(ngModel)]="form.fecha_cirugia" name="fecha_cirugia" />
                  @if (errors()['fecha_cirugia']) {
                    <span class="field-error">{{ errors()['fecha_cirugia'] }}</span>
                  }
                </div>

                <div class="form-field">
                  <label for="institucion">Institución</label>
                  <input id="institucion" type="text" [(ngModel)]="form.institucion" name="institucion" placeholder="Nombre de la clínica u hospital" />
                </div>

                <div class="form-field full-width">
                  <label for="cirugiaProcedimiento">Cirugía/Procedimiento</label>
                  <input id="cirugiaProcedimiento" type="text" [(ngModel)]="form.cirugia_procedimiento" name="cirugia_procedimiento" placeholder="Procedimiento que se estaba realizando con el equipo" />
                </div>

                <div class="form-field">
                  <label for="numRemision">Número de Remisión</label>
                  <input id="numRemision" type="text" [(ngModel)]="form.num_remision" name="num_remision" placeholder="REM-001" />
                  @if (errors()['num_remision']) {
                    <span class="field-error">{{ errors()['num_remision'] }}</span>
                  }
                </div>

                <div class="form-field">
                  <label for="numCaso">Número de Caso</label>
                  <input id="numCaso" type="text" [(ngModel)]="form.num_caso" name="num_caso" placeholder="CASE-001" />
                </div>

                <div class="form-field">
                  <label for="serial">Serial</label>
                  <div class="search-input-wrapper">
                    <input
                      type="text"
                      [value]="serialDisplay()"
                      placeholder="Seleccionar serial..."
                      readonly
                      class="search-field-input"
                    />
                    <button type="button" class="search-btn" (click)="openSerialModal()">
                      <ng-icon name="lucideSearch" />
                    </button>
                  </div>
                  @if (errors()['serial']) {
                    <span class="field-error">{{ errors()['serial'] }}</span>
                  }
                </div>

                <div class="form-field">
                  <label for="equipo">Equipo</label>
                  <input id="equipo" type="text" [value]="form.set_instrumental" readonly class="readonly-input" />
                </div>

                <div class="form-field">
                  <label for="piezaReportada">Pieza Reportada</label>
                  <div class="search-input-wrapper">
                    <input
                      type="text"
                      [value]="form.pieza_reportada"
                      placeholder="Seleccionar pieza..."
                      readonly
                      class="search-field-input"
                    />
                    <button type="button" class="search-btn" (click)="openPiezaModal()" [disabled]="!form.serial">
                      <ng-icon name="lucideSearch" />
                    </button>
                  </div>
                  @if (errors()['pieza_reportada']) {
                    <span class="field-error">{{ errors()['pieza_reportada'] }}</span>
                  }
                </div>

                <div class="form-field">
                  <label for="referencia">Referencia</label>
                  <input id="referencia" type="text" [value]="form.referencia" readonly class="readonly-input" />
                </div>

                <div class="form-field">
                  <label for="fechaInspeccion">Fecha de Inspección</label>
                  <input id="fechaInspeccion" type="date" [(ngModel)]="form.fecha_inspeccion" name="fecha_inspeccion" />
                  @if (errors()['fecha_inspeccion']) {
                    <span class="field-error">{{ errors()['fecha_inspeccion'] }}</span>
                  }
                </div>
              </div>
            </section>

            <section class="form-section">
              <h2 class="section-title">GESTIÓN</h2>
              <div class="form-grid">
                <div class="form-field">
                  <label for="realizadoPor">Realizado por</label>
                  <select id="realizadoPor" [(ngModel)]="form.realizado_por" name="realizado_por" (ngModelChange)="onRealizadoChange($event)">
                    <option [ngValue]="null">Seleccionar...</option>
                    @for (usuario of service.usuarios(); track usuario.id) {
                      <option [value]="usuario.id">{{ usuario.full_name }}</option>
                    }
                  </select>
                </div>

                <div class="form-field">
                  <label for="proveedor">Proveedor</label>
                  <select id="proveedor" [(ngModel)]="form.proveedor" name="proveedor">
                    <option [ngValue]="null">Seleccionar...</option>
                    @for (proveedor of service.proveedores(); track proveedor.id) {
                      <option [value]="proveedor.nombre">{{ proveedor.nombre }}</option>
                    }
                  </select>
                  @if (errors()['proveedor']) {
                    <span class="field-error">{{ errors()['proveedor'] }}</span>
                  }
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
                  <label>Fotografía de Evidencia</label>
                  @if (evidenciaUrl()) {
                    <div class="evidencia-preview">
                      <img [src]="evidenciaUrl()" alt="Evidencia de la novedad" />
                      <button type="button" class="evidencia-remove" (click)="onQuitarEvidencia()">
                        <ng-icon name="lucideX"></ng-icon>
                        Quitar
                      </button>
                    </div>
                  } @else {
                    <div class="evidencia-upload">
                      <input type="file" accept="image/*" class="evidencia-input" (change)="onEvidenciaSelected($event)" #evidenciaFile />
                      <button type="button" class="evidencia-btn" (click)="evidenciaFile.click()" [disabled]="service.isLoading()">
                        <ng-icon name="lucideUpload"></ng-icon>
                        Adjuntar fotografía
                      </button>
                    </div>
                  }
                </div>

                <div class="form-field full-width">
                  <label for="observaciones">Observaciones</label>
                  <textarea id="observaciones" [(ngModel)]="form.observaciones" name="observaciones" rows="2" placeholder="Observaciones adicionales..."></textarea>
                </div>
              </div>
            </section>

            <div class="form-actions">
              @if (isEditing()) {
                <app-button variant="danger" type="button" (clicked)="onDelete()" [disabled]="service.isLoading()">
                  <ng-icon name="lucideTrash2"></ng-icon>
                  Eliminar
                </app-button>
              }
              <div class="actions-right">
                <app-button variant="primary" type="submit" [loading]="service.isLoading()">
                  <ng-icon name="lucideSave"></ng-icon>
                  {{ isEditing() ? 'Actualizar' : 'Guardar' }}
                </app-button>
                <app-button variant="secondary" type="button" (clicked)="onPrint()">
                  <ng-icon name="lucidePrinter"></ng-icon>
                  Imprimir
                </app-button>
                @if (isEditing()) {
                  <app-button variant="secondary" type="button" (clicked)="onEnviarAMantenimiento()" [loading]="service.isLoading()">
                    <ng-icon name="lucideWrench"></ng-icon>
                    Enviar a Mantenimiento
                  </app-button>
                }
                <app-button variant="tertiary" type="button" (clicked)="onEnviar()">
                  <ng-icon name="lucideSend"></ng-icon>
                  Enviar
                </app-button>
              </div>
            </div>
          </form>
        }
      </div>

      <app-confirm-delete-modal
        [open]="showDeleteModal()"
        [itemName]="selectedNovedad()?.num_remision || ''"
        (confirmed)="onConfirmDelete()"
        (cancelled)="showDeleteModal.set(false)">
      </app-confirm-delete-modal>

      <app-search-modal
        [title]="'Buscar Serial'"
        [placeholder]="'Buscar por serial...'"
        [items]="serialSearchItems()"
        [selectedId]="form.serial"
        [isOpen]="showSerialModal()"
        (itemSelected)="onSerialSelected($event)"
        (closed)="showSerialModal.set(false)">
      </app-search-modal>

      <app-search-modal
        [title]="'Buscar Pieza'"
        [placeholder]="'Buscar por nombre...'"
        [items]="piezaSearchItems()"
        [selectedId]="null"
        [isOpen]="showPiezaModal()"
        (itemSelected)="onPiezaSelected($event)"
        (closed)="showPiezaModal.set(false)">
      </app-search-modal>
    </div>

    <!-- Plantilla utilizada únicamente al imprimir/guardar como PDF -->
    <article class="print-report">
      <header class="print-header">
        <div class="print-meta">
          <div><strong>Código:</strong> FR-TT-018-04</div>
          <div><strong>Versión:</strong> 1</div>
          <div><strong>Vigencia:</strong> 30/09/2026</div>
        </div>
        <div class="print-title">REPORTE DE NOVEDADES CX</div>
        <div class="print-brand"><strong>Tecni<span>trauma</span></strong></div>
      </header>

      <div class="print-section-title">INFORMACIÓN GENERAL</div>
      <div class="print-grid">
        <div><strong>FECHA DE CIRUGÍA:</strong> {{ formatPrintDate(form.fecha_cirugia) }}</div>
        <div><strong>INSTITUCIÓN:</strong> {{ form.institucion || '—' }}</div>
        <div class="print-span-2"><strong>CIRUGÍA/PROCEDIMIENTO:</strong> {{ form.cirugia_procedimiento || '—' }}</div>
        <div><strong>No. REMISIÓN:</strong> {{ form.num_remision || '—' }}</div>
        <div><strong>No. CASO:</strong> {{ form.num_caso || '—' }}</div>
        <div><strong>SERIAL:</strong> {{ form.serial || '—' }}</div>
        <div><strong>EQUIPO:</strong> {{ form.set_instrumental || '—' }}</div>
        <div><strong>PIEZA REPORTADA:</strong> {{ form.pieza_reportada || '—' }}</div>
        <div><strong>REFERENCIA:</strong> {{ form.referencia || '—' }}</div>
        <div><strong>FECHA DE INSPECCIÓN:</strong> {{ formatPrintDate(form.fecha_inspeccion) }}</div>
      </div>

      <div class="print-section-title">DESCRIPCIÓN DE LA NOVEDAD</div>
      <div class="print-text-block">{{ form.descripcion_novedad || ' ' }}</div>

      <div class="print-section-title">TIPO DE FALLA Y ACCIÓN REALIZADA</div>
      <div class="print-grid">
        <div><strong>TIPO DE FALLA:</strong> {{ tipoFallaPrintLabel() }}</div>
        <div><strong>ESTADO DE GESTIÓN:</strong> {{ estadoGestionPrintLabel() }}</div>
      </div>
      <div class="print-text-block">{{ form.descripcion_accion || ' ' }}</div>

      <div class="print-section-title">GESTIÓN</div>
      <div class="print-grid">
        <div><strong>PROVEEDOR:</strong> {{ form.proveedor || '—' }}</div>
        <div><strong>CONTINÚA EN MANTENIMIENTO:</strong> {{ form.continua_mantenimiento ? 'Sí' : 'No' }}</div>
      </div>

      @if (evidenciaUrl()) {
        <div class="print-section-title">EVIDENCIA FOTOGRÁFICA</div>
        <div class="print-evidencia">
          <img [src]="evidenciaUrl()" alt="Evidencia de la novedad" />
        </div>
      }

      <div class="print-section-title">OBSERVACIONES</div>
      <div class="print-text-block print-observations">{{ form.observaciones || ' ' }}</div>

      <div class="print-signatures">
        <div class="print-signature-cell">
          <strong>REALIZADO POR:</strong>
          <div class="print-signature-image">
            @if (realizadoSignatureUrl()) {
              <img [src]="realizadoSignatureUrl()" alt="Firma de quien realiza" />
            }
          </div>
          <div><strong>NOMBRE Y CARGO:</strong> {{ realizadoName() || ' ' }}</div>
          <div><strong>FECHA:</strong> {{ formatPrintDate(form.fecha_inspeccion) }}</div>
        </div>
        <div class="print-signature-cell">
          <strong>REVISADO POR:</strong>
          <div class="print-signature-image"></div>
          <div><strong>NOMBRE Y CARGO:</strong> </div>
          <div><strong>FECHA:</strong> {{ formatPrintDate(form.fecha_inspeccion) }}</div>
        </div>
      </div>
    </article>
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
      flex: 1 1 auto;
      min-width: 0;
      min-height: 0;
      background: #fff;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow-y: auto;
      overflow-x: hidden;
    }

    .page-card:has(.empty-state) {
      display: flex;
      flex-direction: column;
    }

    .card-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      background: #fef2f2;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-icon {
      width: 24px;
      height: 24px;
      color: #dc2626;
    }

    .header-text h1 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
    }

    .header-subtitle {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .empty-state {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      padding: 4rem 2rem;
      text-align: center;
    }

    .empty-state-img {
      width: 50%;
      height: auto;
      opacity: 0.85;
    }

    .empty-state-text {
      font-size: 1rem;
      color: #64748b;
      margin: 0;
      line-height: 1.6;
    }

    .card-body {
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
      grid-template-columns: repeat(2, 1fr);
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

    .search-btn:hover:not(:disabled) {
      background: #f3f4f6;
      color: #374151;
    }

    .search-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    textarea {
      resize: vertical;
      min-height: 60px;
    }

    .field-error {
      font-size: 0.75rem;
      color: #dc2626;
      margin-top: 0.25rem;
    }

    .evidencia-upload {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .evidencia-input {
      display: none;
    }

    .evidencia-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      border: 1px dashed #cbd5e1;
      border-radius: 0.5rem;
      background: #f9fafb;
      color: #475569;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }

    .evidencia-btn:hover:not(:disabled) {
      background: #eff6ff;
      border-color: #3b82f6;
      color: #2563eb;
    }

    .evidencia-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .evidencia-preview {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .evidencia-preview img {
      max-width: 320px;
      max-height: 220px;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      object-fit: contain;
      background: #f9fafb;
    }

    .evidencia-remove {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      border: 1px solid #fecaca;
      border-radius: 0.375rem;
      background: #fef2f2;
      color: #dc2626;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
    }

    .evidencia-remove:hover {
      background: #fee2e2;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .actions-right {
      display: flex;
      gap: 0.5rem;
    }

    .print-report {
      display: none;
    }

    @media print {
      @page {
        size: A4 portrait;
        margin: 10mm;
      }

      :host {
        display: block;
        height: auto;
        padding: 0;
        overflow: visible;
      }

      .page-container,
      app-confirm-delete-modal {
        display: none !important;
      }

      .print-report {
        display: block;
        width: 100%;
        max-width: 190mm;
        min-width: 0;
        margin: 0 auto;
        overflow: hidden;
        color: #111827;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 8.5pt;
        line-height: 1.2;
        box-sizing: border-box;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .print-header {
        display: grid;
        grid-template-columns: 34mm 1fr 42mm;
        width: 100%;
        min-width: 0;
        min-height: 25mm;
        border: 1.5px solid #111827;
      }

      .print-meta {
        display: grid;
        grid-template-rows: repeat(3, 1fr);
        border-right: 1.5px solid #111827;
      }

      .print-meta div {
        display: flex;
        align-items: center;
        padding: 1.5mm;
        border-bottom: 1px solid #111827;
      }

      .print-meta div:last-child {
        border-bottom: 0;
      }

      .print-title {
        display: flex;
        min-width: 0;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 2mm;
        font-size: 13pt;
        font-weight: 700;
        border-right: 1.5px solid #111827;
      }

      .print-brand {
        display: flex;
        min-width: 0;
        overflow: hidden;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #25618b;
        font-size: 12pt;
      }

      .print-brand span {
        color: #4b5563;
      }

      .print-section-title {
        margin-top: 3mm;
        padding: 1.5mm;
        border: 1.2px solid #111827;
        background: #c6d9ee !important;
        text-align: center;
        font-weight: 700;
      }

      .print-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        border-left: 1.2px solid #111827;
        border-top: 1.2px solid #111827;
      }

      .print-grid > div {
        min-width: 0;
        min-height: 8mm;
        padding: 1.5mm;
        border-right: 1.2px solid #111827;
        border-bottom: 1.2px solid #111827;
        overflow-wrap: anywhere;
      }

      .print-grid > div.print-span-2 {
        grid-column: 1 / -1;
      }

      .print-text-block {
        min-height: 22mm;
        padding: 2mm;
        border: 1.2px solid #111827;
        border-top: 0;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .print-observations {
        min-height: 18mm;
      }

      .print-evidencia {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3mm;
        border: 1.2px solid #111827;
        border-top: 0;
      }

      .print-evidencia img {
        max-width: 80mm;
        max-height: 50mm;
        object-fit: contain;
      }

      .print-signatures {
        display: grid;
        grid-template-columns: 1fr 1fr;
        margin-top: 3mm;
        border: 1.2px solid #111827;
      }

      .print-signature-cell {
        min-height: 39mm;
        padding: 2mm;
        border-right: 1.2px solid #111827;
      }

      .print-signature-cell:last-child {
        border-right: 0;
      }

      .print-signature-image {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 19mm;
        margin: 1mm 0;
        border-bottom: 1px solid #111827;
      }

      .print-signature-image img {
        max-width: 48mm;
        max-height: 16mm;
        object-fit: contain;
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
  private profileService = inject(ProfileService);
  private toast = inject(ToastService);

  form: NovedadCXForm = this.emptyForm();
  errors = signal<Record<string, string>>({});
  selectedNovedad = signal<NovedadCX | null>(null);
  showDeleteModal = signal(false);
  showEmptyState = signal(true);
  showSerialModal = signal(false);
  showPiezaModal = signal(false);
  searchTerm = signal('');

  evidenciaUrl = signal('');
  realizadoName = signal('');
  realizadoSignatureUrl = signal('');
  private realizadoLoadId = 0;

  novedadesList = computed<ReportListItem[]>(() => {
    return this.service.novedades().map(n => ({
      id: n.id!,
      num_remision: n.num_remision,
      serial: n.serial,
      estado: n.estado_gestion,
      tipo: n.tipo_falla as any,
      fecha: n.fecha_cirugia,
      enviadoMantenimiento: n.estado === 'enviado_mantenimiento'
    }));
  });

  isEditing = computed(() => this.selectedNovedad() !== null);

  serialSearchItems = computed<SearchItem[]>(() => {
    return this.service.setsInstrumentales().map(s => ({
      id: s.serial,
      label: `${s.serial} - ${s.nombre}`,
      sublabel: s.serial
    }));
  });

  piezaSearchItems = computed<SearchItem[]>(() => {
    return this.service.setPiezas().map(p => ({
      id: p.id,
      label: p.nombre,
      sublabel: `Ref: ${p.referencia}`
    }));
  });

  estadoGestionLabel = computed(() => {
    const novedad = this.selectedNovedad();
    if (!novedad) return 'Nueva novedad';
    const label = this.service.getEstadoGestionLabel(novedad.estado_gestion);
    return novedad.estado === 'enviado_mantenimiento' ? `${label} · Enviada a mantenimiento` : label;
  });

  ngOnInit(): void {
    this.service.loadNovedades();
    this.service.loadOptions();
  }

  private emptyForm(): NovedadCXForm {
    return {
      fecha_cirugia: this.service.getTodayDate(),
      institucion: '',
      cirugia_procedimiento: '',
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

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  onNuevo(): void {
    this.selectedNovedad.set(null);
    this.showEmptyState.set(false);
    this.form = this.emptyForm();
    this.errors.set({});
    this.evidenciaUrl.set('');
    this.realizadoName.set('');
    this.realizadoSignatureUrl.set('');
  }

  onSelect(item: ReportListItem): void {
    const novedad = this.service.novedades().find(n => n.id === String(item.id));
    if (novedad) {
      this.selectedNovedad.set(novedad);
      this.showEmptyState.set(false);
      this.form = this.fromReporte(novedad);
      this.errors.set({});
      void this.loadEvidenciaUrl(novedad.fotografia_evidencia);
      void this.loadRealizadoInfo(novedad.realizado_por);
      if (novedad.serial) {
        const set = this.service.setsInstrumentales().find(s => s.serial === novedad.serial);
        if (set) {
          this.service.loadSetPiezas(set.id);
        }
      }
    }
  }

  serialDisplay(): string {
    if (!this.form.serial) return '';
    return this.form.set_instrumental
      ? `${this.form.serial} - ${this.form.set_instrumental}`
      : this.form.serial;
  }

  openSerialModal(): void {
    this.showSerialModal.set(true);
  }

  onSerialSelected(item: SearchItem): void {
    this.form.serial = item.id as string;
    this.form.pieza_reportada = '';
    this.form.referencia = '';
    const set = this.service.setsInstrumentales().find(s => s.serial === item.id);
    this.form.set_instrumental = set?.nombre || '';
    if (set) {
      this.service.loadSetPiezas(set.id);
    }
    this.showSerialModal.set(false);
  }

  openPiezaModal(): void {
    if (!this.form.serial) return;
    this.showPiezaModal.set(true);
  }

  onPiezaSelected(item: SearchItem): void {
    const pieza = this.service.setPiezas().find(p => p.id === item.id);
    this.form.pieza_reportada = pieza?.nombre || String(item.id);
    this.form.referencia = pieza?.referencia || '';
    this.showPiezaModal.set(false);
  }

  private fromReporte(novedad: NovedadCX): NovedadCXForm {
    return {
      fecha_cirugia: novedad.fecha_cirugia,
      institucion: novedad.institucion || '',
      cirugia_procedimiento: novedad.cirugia_procedimiento || '',
      num_remision: novedad.num_remision,
      num_caso: novedad.num_caso,
      set_instrumental: novedad.set_instrumental,
      serial: novedad.serial,
      pieza_reportada: novedad.pieza_reportada,
      referencia: novedad.referencia || '',
      fecha_inspeccion: novedad.fecha_inspeccion,
      realizado_por: novedad.realizado_por,
      proveedor: novedad.proveedor,
      continua_mantenimiento: novedad.continua_mantenimiento,
      estado_gestion: novedad.estado_gestion,
      descripcion_novedad: novedad.descripcion_novedad,
      tipo_falla: novedad.tipo_falla,
      descripcion_accion: novedad.descripcion_accion || '',
      fotografia_evidencia: novedad.fotografia_evidencia || '',
      observaciones: novedad.observaciones || ''
    };
  }

  onRealizadoChange(userId: string | null): void {
    void this.loadRealizadoInfo(userId);
  }

  private async loadRealizadoInfo(userId: string | null | undefined): Promise<void> {
    const requestId = ++this.realizadoLoadId;
    this.realizadoName.set('');
    this.realizadoSignatureUrl.set('');

    if (!userId) return;

    const usuario = this.service.usuarios().find(u => u.id === userId);
    this.realizadoName.set(usuario?.full_name || '');

    const signature = await this.profileService.getUserSignature(userId);
    if (requestId !== this.realizadoLoadId) return;
    this.realizadoSignatureUrl.set(signature?.firma_url || '');
  }

  private async loadEvidenciaUrl(value: string | null | undefined): Promise<void> {
    if (!value) {
      this.evidenciaUrl.set('');
      return;
    }
    const url = await this.service.getEvidenciaUrl(value);
    this.evidenciaUrl.set(url);
  }

  async onEvidenciaSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const result = await this.service.uploadEvidencia(file);
    if (result) {
      this.form.fotografia_evidencia = result.path;
      this.evidenciaUrl.set(result.url);
    }
    input.value = '';
  }

  onQuitarEvidencia(): void {
    this.form.fotografia_evidencia = '';
    this.evidenciaUrl.set('');
  }

  validate(): boolean {
    const errs: Record<string, string> = {};

    if (!this.form.fecha_cirugia) {
      errs['fecha_cirugia'] = 'La fecha de cirugía es requerida';
    }
    if (!this.form.num_remision.trim()) {
      errs['num_remision'] = 'El número de remisión es requerido';
    }
    if (!this.form.serial.trim()) {
      errs['serial'] = 'El serial es requerido';
    }
    if (!this.form.pieza_reportada.trim()) {
      errs['pieza_reportada'] = 'La pieza reportada es requerida';
    }
    if (!this.form.fecha_inspeccion) {
      errs['fecha_inspeccion'] = 'La fecha de inspección es requerida';
    }
    if (!this.form.proveedor) {
      errs['proveedor'] = 'El proveedor es requerido';
    }
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

    const id = this.selectedNovedad()?.id;
    const success = await this.service.guardar(this.form, id);
    if (success) {
      this.onNuevo();
    }
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
        this.showEmptyState.set(true);
        this.form = this.emptyForm();
        this.evidenciaUrl.set('');
        this.realizadoName.set('');
        this.realizadoSignatureUrl.set('');
      }
    }
  }

  formatPrintDate(value: string | null | undefined): string {
    if (!value) return ' ';
    const [year, month, day] = value.slice(0, 10).split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  tipoFallaPrintLabel(): string {
    return this.form.tipo_falla ? this.service.getTipoFallaLabel(this.form.tipo_falla) : '—';
  }

  estadoGestionPrintLabel(): string {
    return this.service.getEstadoGestionLabel(this.form.estado_gestion);
  }

  onPrint(): void {
    const previousTitle = document.title;
    const reportNumber = this.form.num_remision || 'sin-remision';
    document.title = `Reporte-Novedad-${reportNumber}`;
    document.body.classList.add('printing-novedades');

    const cleanupPrintState = () => {
      document.body.classList.remove('printing-novedades');
      document.title = previousTitle;
    };

    window.addEventListener('afterprint', cleanupPrintState, { once: true });
    window.print();
    window.setTimeout(() => {
      cleanupPrintState();
    }, 1000);
  }

  onEnviar(): void {
    this.toast.info('Funcionalidad en desarrollo');
  }

  async onEnviarAMantenimiento(): Promise<void> {
    const selected = this.selectedNovedad();
    if (!selected?.id) {
      this.toast.error('Primero guarda la novedad o selecciona una de la lista');
      return;
    }
    await this.service.enviarAMantenimiento(selected.id);
  }
}
