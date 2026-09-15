import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface UploadedFile {
  publicUrl: string;
  path: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private supabase = inject(SupabaseService);

  async uploadImage(file: File, bucket: string): Promise<UploadedFile> {
    const client = this.supabase.getClient();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${bucket}/${fileName}`;

    const { data, error } = await client.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: urlData } = client.storage.from(bucket).getPublicUrl(data.path);
    return {
      publicUrl: urlData.publicUrl,
      path: data.path
    };
  }

  async uploadVideo(file: File, bucket: string): Promise<UploadedFile> {
    return this.uploadImage(file, bucket);
  }

  async deleteFile(path: string, bucket: string): Promise<void> {
    const { error } = await this.supabase.getClient().storage.from(bucket).remove([path]);
    if (error) throw error;
  }

  getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return 'Unknown error';
  }
}
