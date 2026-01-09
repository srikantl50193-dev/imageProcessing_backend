import { ImageMetadata } from '../types';

// Simple in-memory storage for demo purposes
// In production, use a proper database like PostgreSQL, MongoDB, etc.
export class ImageStorageService {
  private images: Map<string, ImageMetadata> = new Map();

  saveImage(metadata: ImageMetadata): void {
    this.images.set(metadata.id, metadata);
  }

  getImage(id: string): ImageMetadata | undefined {
    return this.images.get(id);
  }

  updateImage(id: string, updates: Partial<ImageMetadata>): void {
    const existing = this.images.get(id);
    if (existing) {
      this.images.set(id, { ...existing, ...updates });
    }
  }

  deleteImage(id: string): boolean {
    return this.images.delete(id);
  }

  getAllImages(): ImageMetadata[] {
    return Array.from(this.images.values());
  }
}