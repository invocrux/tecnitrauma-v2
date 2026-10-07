import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { ToastService } from '../../../core/services/toast.service';
import { StorageService } from '../../../core/services/storage.service';
import type { UserSignature } from '../../mantenimiento/utils/interface';

export interface ProviderSignature {
  id: string;
  proveedor_id: string;
  firma_url: string;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private supabase = inject(SupabaseService);
  private toast = inject(ToastService);
  private storage = inject(StorageService);

  readonly isLoading = signal(false);
  readonly signatures = signal<Map<string, UserSignature>>(new Map());
  readonly providerSignatures = signal<Map<string, ProviderSignature>>(new Map());

  async uploadSignature(file: File, userId?: string): Promise<string> {
    const session = this.supabase.session();
    const targetUserId = userId || session?.user?.id;
    if (!targetUserId) {
      throw new Error('No hay sesión activa');
    }

    const bucket = 'signatures';
    const fileName = `${targetUserId}/firma.png`;

    const { data, error } = await this.supabase.getClient().storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: urlData } = this.supabase.getClient().storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async saveUserSignature(firmaUrl: string, userId?: string): Promise<boolean> {
    const session = this.supabase.session();
    const targetUserId = userId || session?.user?.id;
    if (!targetUserId) {
      this.toast.error('No hay sesión activa');
      return false;
    }

    this.isLoading.set(true);

    const { error } = await this.supabase.getClient()
      .from('user_signatures')
      .upsert({
        user_id: targetUserId,
        firma_url: firmaUrl
      });

    this.isLoading.set(false);

    if (error) {
      this.toast.error('Error al guardar firma: ' + error.message);
      return false;
    }

    this.toast.success('Firma guardada correctamente');
    return true;
  }

  async uploadProviderSignature(file: File, providerId: string): Promise<string> {
    const bucket = 'signatures';
    const fileName = `providers/${providerId}/firma.png`;

    const { data, error } = await this.supabase.getClient().storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: urlData } = this.supabase.getClient().storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async saveProviderSignature(firmaUrl: string, providerId: string): Promise<boolean> {
    this.isLoading.set(true);

    const { error } = await this.supabase.getClient()
      .from('provider_signatures')
      .upsert({
        proveedor_id: providerId,
        firma_url: firmaUrl
      });

    this.isLoading.set(false);

    if (error) {
      this.toast.error('Error al guardar firma: ' + error.message);
      return false;
    }

    const newSignatures = new Map(this.providerSignatures());
    newSignatures.set(providerId, {
      id: providerId,
      proveedor_id: providerId,
      firma_url: firmaUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    this.providerSignatures.set(newSignatures);
    this.toast.success('Firma guardada correctamente');
    return true;
  }

  async getProviderSignature(providerId: string): Promise<ProviderSignature | null> {
    if (this.providerSignatures().has(providerId)) {
      return this.providerSignatures().get(providerId) || null;
    }

    const { data, error } = await this.supabase.getClient()
      .from('provider_signatures')
      .select('*')
      .eq('proveedor_id', providerId)
      .maybeSingle();

    if (error) {
      return null;
    }

    if (data) {
      const newSignatures = new Map(this.providerSignatures());
      newSignatures.set(providerId, data);
      this.providerSignatures.set(newSignatures);
    }

    return data || null;
  }

  async getProviderSignatureByName(providerName: string): Promise<ProviderSignature | null> {
    const { data: provider, error } = await this.supabase.getClient()
      .from('proveedores')
      .select('id')
      .ilike('nombre', providerName)
      .maybeSingle();

    if (error || !provider) return null;
    return this.getProviderSignature(provider.id);
  }

  async getUserSignature(userId: string): Promise<UserSignature | null> {
    if (this.signatures().has(userId)) {
      return this.signatures().get(userId) || null;
    }

    const { data, error } = await this.supabase.getClient()
      .from('user_signatures')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return null;
    }

    if (data) {
      const newSignatures = new Map(this.signatures());
      newSignatures.set(userId, data);
      this.signatures.set(newSignatures);
    }

    return data || null;
  }

  async loadSignatures(userIds: string[]): Promise<void> {
    if (userIds.length === 0) return;

    const { data, error } = await this.supabase.getClient()
      .from('user_signatures')
      .select('*')
      .in('user_id', userIds);

    if (error) return;

    const newSignatures = new Map(this.signatures());
    for (const sig of data || []) {
      newSignatures.set(sig.user_id, sig);
    }
    this.signatures.set(newSignatures);
  }

  getSignatureUrl(userId: string): string {
    return this.signatures().get(userId)?.firma_url || '';
  }
}
