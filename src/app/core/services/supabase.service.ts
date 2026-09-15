import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private client: SupabaseClient;
  readonly session = signal<Session | null>(null);

  constructor() {
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  authChanges(callback: (event: string, session: Session | null) => void): void {
    this.client.auth.onAuthStateChange((event, session) => {
      callback(event as string, session);
    });
  }
}
