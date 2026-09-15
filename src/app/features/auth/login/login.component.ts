import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ButtonComponent, AlertComponent],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>TECNITRAUMA V2</h1>
        <p class="subtitle">Iniciar sesión</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" />
          </div>

          <div class="form-field">
            <label for="password">Contraseña</label>
            <input id="password" type="password" formControlName="password" />
          </div>

          <app-alert [message]="errorMessage()" type="error"></app-alert>

          <app-button 
            type="submit" 
            [loading]="loading()" 
            [disabled]="form.invalid">
            Ingresar
          </app-button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
    }
    .login-card {
      background: #fff;
      padding: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    h1 { margin: 0; font-size: 1.5rem; text-align: center; color: #1e293b; }
    .subtitle { margin: 0.5rem 0 1.5rem; text-align: center; color: #64748b; }
    .form-field { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; color: #475569; }
    input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.375rem;
      font-size: 1rem;
    }
    input:focus { outline: none; border-color: #3b82f6; }
    app-button { width: 100%; margin-top: 0.5rem; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = signal(false);
  errorMessage = signal('');

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.getRawValue();
    const { error } = await this.auth.signIn(email!, password!);

    this.loading.set(false);

    if (error) {
      this.errorMessage.set(error.message);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
