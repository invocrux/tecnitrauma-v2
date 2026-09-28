import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { SignatureUploadComponent } from '../../components/signature-upload/signature-upload.component';

@Component({
  selector: 'app-profile',
  imports: [SignatureUploadComponent],
  template: `
    <div class="profile-container">
      <div class="profile-card">
        <div class="card-header">
          <h1>Mi Perfil</h1>
        </div>
        <div class="card-body">
          <section class="user-info">
            <h2>Información del Usuario</h2>
            <div class="info-grid">
              <div class="info-item">
                <label>Email</label>
                <span>{{ auth.session()?.user?.email || 'No disponible' }}</span>
              </div>
              <div class="info-item">
                <label>Nombre</label>
                <span>{{ auth.session()?.user?.user_metadata?.['full_name'] || 'No disponible' }}</span>
              </div>
            </div>
          </section>

          <section class="signature-section">
            <h2>Mi Firma</h2>
            <p class="description">
              Sube tu firma para que aparezca en los reportes de mantenimiento cuando seas asignado como supervisor o técnico.
            </p>
            <app-signature-upload></app-signature-upload>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .profile-card {
      background: #fff;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .card-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      background: #eff6ff;
    }

    .card-header h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e40af;
    }

    .card-body {
      padding: 1.5rem;
    }

    section {
      margin-bottom: 2rem;
    }

    section:last-child {
      margin-bottom: 0;
    }

    h2 {
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 1rem 0;
    }

    .description {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0 0 1rem 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #6b7280;
      text-transform: uppercase;
    }

    .info-item span {
      font-size: 0.875rem;
      color: #374151;
    }

    @media (max-width: 480px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private profileService = inject(ProfileService);

  ngOnInit(): void {
    const userId = this.auth.session()?.user?.id;
    if (userId) {
      this.profileService.getUserSignature(userId);
    }
  }
}
