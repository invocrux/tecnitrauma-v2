import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { SignatureUploadComponent } from '../../../profile/components/signature-upload/signature-upload.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideUsers } from '@ng-icons/lucide';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface AppUser {
  id: string;
  email: string;
  full_name: string | null;
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
      </header>

      <div class="usuarios-layout">
        <aside class="usuarios-list">
          <div class="list-header">
            <input
              type="text"
              placeholder="Buscar usuario..."
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
          } @else {
            <div class="no-selection">
              <ng-icon name="lucideUsers" size="48"></ng-icon>
              <p>Seleccione un usuario para ver sus detalles</p>
            </div>
          }

          <div class="providers-card">
            <div class="providers-header">
              <ng-icon name="lucideBuilding2"></ng-icon>
              <div>
                <h2>Proveedores</h2>
                <p>Gestione las firmas de proveedores externos</p>
              </div>
            </div>

            <div class="provider-list">
              @for (provider of providers(); track provider.id) {
                <button
                  type="button"
                  class="provider-pill"
                  [class.active]="selectedProvider()?.id === provider.id"
                  (click)="selectProvider(provider)"
                >
                  {{ provider.nombre }}
                </button>
              } @empty {
                <span class="empty-list">No hay proveedores</span>
              }
            </div>

            @if (selectedProvider()) {
              <div class="signature-section provider-signature-section">
                <h3>Firma de {{ selectedProvider()!.nombre }}</h3>
                <div class="signature-box">
                  <app-signature-upload
                    [providerId]="selectedProvider()!.id"
                  ></app-signature-upload>
                </div>
              </div>
            }
          </div>
        </main>
      </div>
    </div>
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
    }

    .page-header h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
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

  users = signal<AppUser[]>([]);
  providers = signal<Provider[]>([]);
  selectedUser = signal<AppUser | null>(null);
  selectedProvider = signal<Provider | null>(null);
  searchTerm = '';

  filteredUsers = computed(() => {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.users();
    return this.users().filter(u =>
      u.email?.toLowerCase().includes(term) ||
      u.full_name?.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadUsers();
    this.loadProviders();
  }

  async loadUsers(): Promise<void> {
    const { data, error } = await this.supabase.getClient()
      .from('app_users')
      .select('id, email, full_name, role, status, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      this.users.set(data);
    }
  }

  async selectUser(user: AppUser): Promise<void> {
    this.selectedUser.set(user);
  }

  async loadProviders(): Promise<void> {
    const { data, error } = await this.supabase.getClient()
      .from('proveedores')
      .select('id, nombre, estado')
      .eq('estado', 'active')
      .order('nombre');

    if (!error && data) {
      this.providers.set(data);
      this.selectedProvider.set(data[0] || null);
    }
  }

  selectProvider(provider: Provider): void {
    this.selectedProvider.set(provider);
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
