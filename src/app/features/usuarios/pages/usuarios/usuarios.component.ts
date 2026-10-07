import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { SignatureUploadComponent } from '../../../profile/components/signature-upload/signature-upload.component';
import { ProfileService } from '../../../profile/services/profile.service';
import { ToastService } from '../../../../core/services/toast.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideUsers } from '@ng-icons/lucide';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface AppUser {
  id: string;
  email: string;
  full_name: string | null;
  cargo: string | null;
  role: string;
  status: string;
  created_at: string;
}

interface Provider {
  id: string;
  nombre: string;
  estado: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, SignatureUploadComponent, NgIconComponent],
  providers: [provideIcons({ lucideUsers, lucideBuilding2 })],
  template: `
    <div class="usuarios-page">
      <header class="page-header">
        <h1>Usuarios</h1>
        <button type="button" class="btn-nuevo-usuario" (click)="openCreateModal()">
          + Nuevo usuario
        </button>
      </header>

      <div class="usuarios-layout">
        <aside class="usuarios-list">
          <div class="list-header">
            <input
              type="text"
              placeholder="Buscar usuario o proveedor..."
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
              class="search-input"
            />
          </div>
          <div class="list-items">
            @for (user of filteredUsers(); track user.id) {
              <div
                class="list-item"
                [class.active]="selectedUser()?.id === user.id"
                (click)="selectUser(user)"
              >
                <div class="user-avatar">{{ getInitials(user.full_name) }}</div>
                <div class="user-info">
                  <span class="user-name">{{ user.full_name || 'Sin nombre' }}</span>
                  <span class="user-email">{{ user.email }}</span>
                </div>
                <div class="user-role-badge" [class]="'role-' + user.role">{{ user.role }}</div>
              </div>
            } @empty {
              <div class="empty-list">No hay usuarios</div>
            }

            <div class="list-section-title">Proveedores</div>
            @for (provider of filteredProviders(); track provider.id) {
              <div
                class="list-item provider-item"
                [class.active]="selectedProvider()?.id === provider.id"
                (click)="selectProvider(provider)"
              >
                <div class="user-avatar provider-avatar">
                  <ng-icon name="lucideBuilding2"></ng-icon>
                </div>
                <div class="user-info">
                  <span class="user-name">{{ provider.nombre }}</span>
                  <span class="user-email">Proveedor externo</span>
                </div>
                <div class="user-role-badge role-usuario">PROVEEDOR</div>
              </div>
            } @empty {
              <div class="empty-list">No hay proveedores</div>
            }
          </div>
        </aside>

        <main class="user-detail">
          @if (selectedUser()) {
            <div class="detail-card">
              <div class="detail-header">
                <div class="user-avatar-large">{{ getInitials(selectedUser()!.full_name) }}</div>
                <div class="user-header-info">
                  <h2>{{ selectedUser()!.full_name || 'Sin nombre' }}</h2>
                  <span class="user-email">{{ selectedUser()!.email }}</span>
                </div>
              </div>

              <div class="detail-info">
                <div class="info-row">
                  <span class="info-label">Rol</span>
                  <span class="info-value role-badge" [class]="'role-' + selectedUser()!.role">{{ selectedUser()!.role }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Cargo</span>
                  <span class="info-value">{{ selectedUser()!.cargo || '—' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Estado</span>
                  <span class="info-value status-badge" [class]="'status-' + selectedUser()!.status">{{ selectedUser()!.status }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Fecha de registro</span>
                  <span class="info-value">{{ formatDate(selectedUser()!.created_at) }}</span>
                </div>
              </div>

              <div class="signature-section">
                <h3>Firma</h3>
                <div class="signature-box">
                  <app-signature-upload
                    [userId]="selectedUser()!.id"
                  ></app-signature-upload>
                </div>
              </div>
            </div>
          } @else if (selectedProvider()) {
            <div class="detail-card">
              <div class="detail-header">
                <div class="user-avatar-large provider-avatar-large">
                  <ng-icon name="lucideBuilding2"></ng-icon>
                </div>
                <div class="user-header-info">
                  <h2>{{ selectedProvider()!.nombre }}</h2>
                  <span class="user-email">Proveedor externo</span>
                </div>
              </div>

              <div class="detail-info">
                <div class="info-row">
                  <span class="info-label">Tipo</span>
                  <span class="info-value role-badge role-usuario">Proveedor</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Estado</span>
                  <span class="info-value status-badge" [class]="'status-' + selectedProvider()!.estado">{{ selectedProvider()!.estado }}</span>
                </div>
              </div>

              <div class="signature-section">
                <h3>Firma</h3>
                <div class="signature-box">
                  <app-signature-upload
                    [providerId]="selectedProvider()!.id"
                  ></app-signature-upload>
                </div>
              </div>
            </div>
          } @else {
            <div class="no-selection">
              <ng-icon name="lucideUsers" size="48"></ng-icon>
              <p>Seleccione un usuario o proveedor para ver sus detalles</p>
            </div>
          }
        </main>
      </div>
    </div>

    @if (showCreateModal()) {
      <div class="modal-overlay" (click)="closeCreateModal()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Nuevo usuario</h2>
            <button type="button" class="close-btn" (click)="closeCreateModal()">&times;</button>
          </div>

          <div class="modal-body">
            <div class="modal-field">
              <label for="newFullName">Nombre completo</label>
              <input id="newFullName" type="text" [(ngModel)]="newFullName" name="newFullName" placeholder="Ej: Ana María Torres" />
            </div>

            <div class="modal-field">
              <label for="newEmail">Correo electrónico</label>
              <input id="newEmail" type="email" [(ngModel)]="newEmail" name="newEmail" placeholder="ana@tecnitrauma.com.co" />
            </div>

            <div class="modal-field">
              <label for="newPassword">Contraseña</label>
              <input id="newPassword" type="password" [(ngModel)]="newPassword" name="newPassword" placeholder="Mínimo 6 caracteres" />
            </div>

            <div class="modal-field">
              <label for="newCargo">Cargo</label>
              <input id="newCargo" type="text" [(ngModel)]="newCargo" name="newCargo" placeholder="Ej: Técnico de mantenimiento" />
            </div>

            <div class="modal-field">
              <label>Firma (opcional)</label>
              <input type="file" accept="image/png,image/jpeg,image/jpg" (change)="onNewSignatureSelected($event)" #newSigInput class="file-hidden" />
              @if (newSignaturePreview()) {
                <div class="sig-preview">
                  <img [src]="newSignaturePreview()" alt="Vista previa de firma" />
                  <button type="button" class="sig-remove" (click)="clearNewSignature()">Quitar</button>
                </div>
              } @else {
                <button type="button" class="sig-select-btn" (click)="newSigInput.click()">
                  Seleccionar imagen de firma (PNG o JPG, máx 2MB)
                </button>
              }
            </div>

            @if (createError()) {
              <p class="create-error">{{ createError() }}</p>
            }
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" (click)="closeCreateModal()">Cancelar</button>
            <button type="button" class="btn-save" (click)="createNewUser()" [disabled]="creating()">
              {{ creating() ? 'Creando...' : 'Crear usuario' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .usuarios-page {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
    }

    .page-header {
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .page-header h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
    }

    .btn-nuevo-usuario {
      padding: 0.5rem 1rem;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
    }

    .btn-nuevo-usuario:hover {
      background: #1d4ed8;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-container {
      background: white;
      border-radius: 0.75rem;
      width: 100%;
      max-width: 440px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6b7280;
      cursor: pointer;
      line-height: 1;
    }

    .close-btn:hover {
      color: #111827;
    }

    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .modal-field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .modal-field label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .modal-field input[type="text"],
    .modal-field input[type="email"],
    .modal-field input[type="password"] {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .modal-field input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .file-hidden {
      display: none;
    }

    .sig-select-btn {
      padding: 0.75rem;
      border: 2px dashed #e2e8f0;
      border-radius: 0.5rem;
      background: #f9fafb;
      color: #6b7280;
      font-size: 0.875rem;
      cursor: pointer;
      text-align: center;
    }

    .sig-select-btn:hover {
      border-color: #3b82f6;
      background: #eff6ff;
      color: #1d4ed8;
    }

    .sig-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: #f9fafb;
    }

    .sig-preview img {
      max-width: 260px;
      max-height: 110px;
      object-fit: contain;
    }

    .sig-remove {
      padding: 0.25rem 0.75rem;
      border: 1px solid #fecaca;
      border-radius: 0.375rem;
      background: #fef2f2;
      color: #dc2626;
      font-size: 0.8125rem;
      cursor: pointer;
    }

    .sig-remove:hover {
      background: #fee2e2;
    }

    .create-error {
      margin: 0;
      color: #dc2626;
      font-size: 0.8125rem;
      text-align: center;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn-cancel {
      padding: 0.5rem 1rem;
      background: #e2e8f0;
      color: #475569;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-cancel:hover {
      background: #cbd5e1;
    }

    .btn-save {
      padding: 0.5rem 1rem;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-save:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .btn-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .usuarios-layout {
      flex: 1;
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 1.5rem;
      min-height: 0;
    }

    .usuarios-list {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .list-header {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .search-input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .list-items {
      flex: 1;
      overflow-y: auto;
    }

    .list-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
      border-bottom: 1px solid #f3f4f6;
      transition: background-color 0.15s;
    }

    .list-item:hover {
      background: #f9fafb;
    }

    .list-item.active {
      background: #eff6ff;
      border-left: 3px solid #3b82f6;
    }

    .list-section-title {
      padding: 0.875rem 1rem 0.5rem;
      color: #6b7280;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-top: 1px solid #e5e7eb;
      background: #fafafa;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .user-avatar-large {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .provider-avatar,
    .provider-avatar-large {
      background: #2563eb;
    }

    .provider-avatar ng-icon {
      width: 18px;
      height: 18px;
    }

    .provider-avatar-large ng-icon {
      width: 28px;
      height: 28px;
    }

    .user-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 0.75rem;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role-badge {
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      background: #e5e7eb;
      color: #374151;
    }

    .role-super_admin {
      background: #fef3c7;
      color: #92400e;
    }

    .role-admin {
      background: #dbeafe;
      color: #1e40af;
    }

    .role-usuario {
      background: #d1fae5;
      color: #065f46;
    }

    .empty-list {
      padding: 2rem;
      text-align: center;
      color: #6b7280;
    }

    .user-detail {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e5e7eb;
      padding: 1.5rem;
    }

    .no-selection {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      gap: 1rem;
    }

    .no-selection p {
      font-size: 0.875rem;
    }

    .detail-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .detail-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 1.5rem;
    }

    .user-header-info h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 0.25rem 0;
    }

    .user-header-info .user-email {
      display: block;
    }

    .detail-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .info-label {
      font-size: 0.875rem;
      color: #6b7280;
      width: 140px;
    }

    .info-value {
      font-size: 0.875rem;
      color: #111827;
      font-weight: 500;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
    }

    .status-active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-disabled {
      background: #fee2e2;
      color: #991b1b;
    }

    .signature-section {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .signature-section h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 1rem 0;
    }

    .signature-box {
      background: #f9fafb;
      border: 1px dashed #d1d5db;
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .signature-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .signature-display img {
      max-width: 250px;
      max-height: 120px;
      object-fit: contain;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: white;
    }

    .signature-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .signature-empty {
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
      padding: 1rem;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      text-transform: capitalize;
    }

    .providers-card {
      margin-top: 1.5rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      padding: 1.5rem;
    }

    .providers-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      color: #2563eb;
    }

    .providers-header h2 {
      margin: 0;
      color: #111827;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .providers-header p {
      margin: 0.25rem 0 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .provider-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .provider-pill {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 9999px;
      background: #fff;
      color: #374151;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .provider-pill:hover,
    .provider-pill.active {
      border-color: #3b82f6;
      background: #eff6ff;
      color: #1d4ed8;
    }

    .provider-signature-section {
      margin-top: 1rem;
    }
  `]
})
export class UsuariosComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private profileService = inject(ProfileService);
  private toast = inject(ToastService);

  users = signal<AppUser[]>([]);
  providers = signal<Provider[]>([]);
  selectedUser = signal<AppUser | null>(null);
  selectedProvider = signal<Provider | null>(null);
  searchTerm = '';

  showCreateModal = signal(false);
  creating = signal(false);
  createError = signal('');
  newFullName = '';
  newEmail = '';
  newPassword = '';
  newCargo = '';
  newSignatureFile = signal<File | null>(null);
  newSignaturePreview = signal('');

  filteredUsers = computed(() => {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.users();
    return this.users().filter(u =>
      u.email?.toLowerCase().includes(term) ||
      u.full_name?.toLowerCase().includes(term)
    );
  });

  filteredProviders = computed(() => {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.providers();
    return this.providers().filter(provider =>
      provider.nombre.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadUsers();
    this.loadProviders();
  }

  async loadUsers(): Promise<void> {
    const { data, error } = await this.supabase.getClient()
      .from('app_users')
      .select('id, email, full_name, cargo, role, status, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      this.users.set(data);
    }
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
    this.createError.set('');
    this.creating.set(false);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.newFullName = '';
    this.newEmail = '';
    this.newPassword = '';
    this.newCargo = '';
    this.newSignatureFile.set(null);
    this.newSignaturePreview.set('');
    this.createError.set('');
  }

  onNewSignatureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      this.createError.set('La firma debe ser PNG o JPG');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.createError.set('La firma debe ser menor a 2MB');
      return;
    }

    this.createError.set('');
    this.newSignatureFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.newSignaturePreview.set(reader.result as string);
    reader.readAsDataURL(file);
    input.value = '';
  }

  clearNewSignature(): void {
    this.newSignatureFile.set(null);
    this.newSignaturePreview.set('');
  }

  async createNewUser(): Promise<void> {
    this.createError.set('');

    if (!this.newFullName.trim()) {
      this.createError.set('El nombre es obligatorio');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newEmail.trim())) {
      this.createError.set('Ingresa un correo válido');
      return;
    }
    if (this.newPassword.length < 6) {
      this.createError.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!this.newCargo.trim()) {
      this.createError.set('El cargo es obligatorio');
      return;
    }

    this.creating.set(true);

    const { data, error } = await this.supabase.getClient().functions.invoke('create-user', {
      body: {
        email: this.newEmail.trim(),
        password: this.newPassword,
        fullName: this.newFullName.trim(),
        cargo: this.newCargo.trim()
      }
    });

    const responseError = (error as { message?: string } | null)?.message
      || (data as { error?: string } | null)?.error;

    if (responseError) {
      this.createError.set(responseError);
      this.creating.set(false);
      return;
    }

    const userId = (data as { userId?: string } | null)?.userId;

    if (userId && this.newSignatureFile()) {
      try {
        const url = await this.profileService.uploadSignature(this.newSignatureFile()!, userId);
        await this.profileService.saveUserSignature(url, userId);
      } catch {
        this.toast.error('Usuario creado, pero la firma no pudo subirse');
      }
    }

    this.creating.set(false);
    this.closeCreateModal();
    this.toast.success('Usuario creado correctamente');
    await this.loadUsers();
  }

  async selectUser(user: AppUser): Promise<void> {
    this.selectedUser.set(user);
    this.selectedProvider.set(null);
  }

  async loadProviders(): Promise<void> {
    const { data, error } = await this.supabase.getClient()
      .from('proveedores')
      .select('id, nombre, estado')
      .eq('estado', 'active')
      .order('nombre');

    if (!error && data) {
      this.providers.set(data);
    }
  }

  selectProvider(provider: Provider): void {
    this.selectedProvider.set(provider);
    this.selectedUser.set(null);
  }

  onSearch(): void {
    // Computed signal handles filtering automatically
  }

  getInitials(name: string | null): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
