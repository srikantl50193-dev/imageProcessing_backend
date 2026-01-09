import { env } from '../utils/env';

export class BackgroundRemovalService {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://sdk.photoroom.com/v1/segment';

  constructor() {
    this.apiKey = env.PHOTOROOM_API_KEY!;
  }

  async removeBackground(imageBuffer: Buffer, filename: string): Promise<Blob> {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const formData = new FormData();
        // Create a Blob from the buffer
        const blob = new Blob([new Uint8Array(imageBuffer)]);
        formData.append('image_file', blob, filename);
        formData.append('size', 'auto');

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout


        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'x-api-key': this.apiKey,
            'User-Agent': 'ImageProcessing-Backend/1.0',
          },
          body: formData,
          signal: controller.signal,
        });


        clearTimeout(timeoutId);

        if (response.ok) {
          return await response.blob();
        }

        // If we get here, it's an error status code
        throw new Error(`Photoroom API returned status ${response.status}`);

      } catch (error: any) {
        lastError = error;
        console.error(`Background removal attempt ${attempt}/${maxRetries} failed:`, error.message);

        // Check if this is a retryable error
        const shouldRetry = this.isRetryableError(error);

        if (!shouldRetry || attempt === maxRetries) {
          // Either not retryable or we've exhausted retries
          return this.handleError(error);
        }

        // Calculate retry delay
        const retryDelay = this.getRetryDelay(error, attempt);
        console.log(`Retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    // If we get here, all retries failed
    throw lastError;
  }

  private isRetryableError(error: any): boolean {
    // For fetch, we need to check the error type differently
    if (error.name === 'AbortError') {
      return true; // Timeout
    }

    if (error.message?.includes('Remove.bg API returned status')) {
      const statusMatch = error.message.match(/status (\d+)/);
      if (statusMatch) {
        const status = parseInt(statusMatch[1], 10);
        const retryableStatuses = [403, 429, 500, 502, 503, 504];
        return retryableStatuses.includes(status);
      }
    }

    // Network errors
    return error.code === 'ECONNABORTED' ||
           error.code === 'ETIMEDOUT' ||
           error.code === 'ENOTFOUND' ||
           error.name === 'TypeError'; // Network errors in fetch
  }

  private getRetryDelay(_error: any, attempt: number): number {
    // For fetch, we don't have easy access to response headers in error cases
    // Just use exponential backoff
    const baseDelay = 2000; // 2 seconds
    return baseDelay * Math.pow(2, attempt - 1);
  }

  private handleError(_error: any): never {
    console.error('Background removal error:', _error.message || _error);

    // Extract status code from error message
    const statusMatch = _error.message.match(/status (\d+)/);
    const status = statusMatch ? parseInt(statusMatch[1], 10) : null;

    if (status === 403) {
      throw new Error('Photoroom API access denied (403). This could be temporary - try again later or check your account at https://www.photoroom.com/api');
    }

    if (status === 402) {
      throw new Error('Photoroom API credits exhausted. Please check your account.');
    }

    if (status === 400) {
      throw new Error('Invalid image format or corrupted image file.');
    }

    if (status === 429) {
      throw new Error('Photoroom API rate limit exceeded. Please try again later.');
    }

    if (_error.name === 'AbortError') {
      throw new Error('Background removal request timed out. Please try again.');
    }

    throw new Error(`Background removal failed: ${_error.message}`);
  }
}