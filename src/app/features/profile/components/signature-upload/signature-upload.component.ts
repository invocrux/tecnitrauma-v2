import { Component, inject, signal, OnInit, input, output } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-signature-upload',
  imports: [ButtonComponent],
  template: `
    <div class="signature-upload">
      @if (hasSignature()) {
        <div class="signature-registered">
          <div class="signature-display">
            <img [src]="currentSignatureUrl()" alt="Tu firma" />
          </div>
          <p class="registered-message">Tu firma está registrada</p>
        </div>
      } @else {
        <div class="upload-area" (click)="fileInput.click()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
          <input
            #fileInput
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            (change)="onFileSelected($event)"
            hidden
          />
          @if (previewUrl()) {
            <div class="preview">
              <img [src]="previewUrl()" alt="Vista previa de firma" />
            </div>
          } @else {
            <div class="placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p>Arrastra una imagen o haz click para seleccionar</p>
              <span class="hint">PNG o JPG, máximo 2MB</span>
            </div>
          }
        </div>

        @if (previewUrl()) {
          <div class="actions">
            <app-button variant="secondary" type="button" (clicked)="clearSelection()">
              Cancelar
            </app-button>
            <app-button variant="primary" type="button" (clicked)="upload()" [loading]="service.isLoading()">
              Guardar Firma
            </app-button>
          </div>
        }
      }

      @if (errorMessage()) {
        <p class="error">{{ errorMessage() }}</p>
      }
    </div>
  `,
  styles: [`
    .signature-upload {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .upload-area {
      border: 2px dashed #e2e8f0;
      border-radius: 0.5rem;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s;
      background: #f9fafb;
    }

    .upload-area:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: #6b7280;
    }

    .placeholder svg {
      width: 32px;
      height: 32px;
      color: #9ca3af;
    }

    .placeholder p {
      margin: 0;
      font-size: 0.875rem;
    }

    .hint {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .preview {
      display: flex;
      justify-content: center;
    }

    .preview img {
      max-width: 300px;
      max-height: 120px;
      object-fit: contain;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .error {
      color: #dc2626;
      font-size: 0.75rem;
      margin: 0;
      text-align: center;
    }

    .signature-registered {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .signature-display {
      display: flex;
      justify-content: center;
      padding: 1.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      background: #f9fafb;
    }

    .signature-display img {
      max-width: 300px;
      max-height: 120px;
      object-fit: contain;
    }

    .registered-message {
      margin: 0;
      font-size: 0.875rem;
      color: #059669;
      font-weight: 500;
    }
  `]
})
export class SignatureUploadComponent implements OnInit {
  service = inject(ProfileService);

  userId = input<string | null>(null);
  signatureUploaded = output<{ id: string; user_id: string; firma_url: string }>();

  previewUrl = signal<string>('');
  selectedFile = signal<File | null>(null);
  errorMessage = signal<string>('');

  hasSignature = signal(false);
  currentSignatureUrl = signal<string>('');

  ngOnInit(): void {
    this.loadCurrentSignature();
  }

  private async loadCurrentSignature(): Promise<void> {
    const targetUserId = this.userId();
    const session = this.service['supabase'].session();
    const userId = targetUserId || session?.user?.id;
    if (!userId) return;

    const signature = await this.service.getUserSignature(userId);
    if (signature?.firma_url) {
      this.hasSignature.set(true);
      this.currentSignatureUrl.set(signature.firma_url);
      this.previewUrl.set(signature.firma_url);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleFile(files[0]);
    }
  }

  private handleFile(file: File): void {
    this.errorMessage.set('');

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      this.errorMessage.set('Solo se permiten archivos PNG o JPG');
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.errorMessage.set('El archivo debe ser menor a 2MB');
      return;
    }

    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  clearSelection(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(this.currentSignatureUrl());
  }

  async upload(): Promise<void> {
    const file = this.selectedFile();
    if (!file) return;

    try {
      const targetUserId = this.userId();
      const session = this.service['supabase'].session();
      const userId = targetUserId || session?.user?.id;
      if (!userId) return;

      const url = await this.service.uploadSignature(file, userId);
      const success = await this.service.saveUserSignature(url, userId);
      if (success) {
        this.hasSignature.set(true);
        this.currentSignatureUrl.set(url);
        this.selectedFile.set(null);
        this.previewUrl.set('');
        const signature = await this.service.getUserSignature(userId);
        if (signature) {
          this.signatureUploaded.emit(signature);
        }
      }
    } catch (error) {
      this.errorMessage.set('Error al subir la imagen');
    }
  }
}
