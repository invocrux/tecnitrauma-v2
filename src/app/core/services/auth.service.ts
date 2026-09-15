import { Injectable, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { Session, AuthError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  readonly session = this.supabase.session;
  readonly isAuthenticated = computed(() => this.session() !== null);

  constructor() {
    this.supabase.authChanges((event, session) => {
      this.session.set(session);
    });
  }

  async signIn(email: string, password: string): Promise<{ error: AuthError | null }> {
    const { error } = await this.supabase.getClient().auth.signInWithPassword({
      email,
      password
    });
    return { error };
  }

  async signOut(): Promise<void> {
    await this.supabase.getClient().auth.signOut();
    this.router.navigate(['/auth/login']);
  }

  async getSession(): Promise<Session | null> {
    const { data } = await this.supabase.getClient().auth.getSession();
    this.session.set(data.session);
    return data.session;
  }
}
