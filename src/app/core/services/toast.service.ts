import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();
  private nextId = 0;

  success(message: string): void {
    this.addToast(message, 'success');
  }

  error(message: string): void {
    this.addToast(message, 'error');
  }

  warning(message: string): void {
    this.addToast(message, 'warning');
  }

  info(message: string): void {
    this.addToast(message, 'info');
  }

  dismiss(id: number): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }

  private addToast(message: string, type: Toast['type']): void {
    const toast: Toast = { id: this.nextId++, message, type };
    this.toastsSignal.update(toasts => [...toasts, toast]);
    setTimeout(() => this.dismiss(toast.id), 4000);
  }
}
