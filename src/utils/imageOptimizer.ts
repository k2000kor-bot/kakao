/**
 * 이미지 최적화 유틸리티
 * 이미지 압축, 형식 변환, 크기 조정 등
 */

export interface ImageOptimizationOptions {
  /**
   * 최대 너비 (픽셀)
   */
  maxWidth?: number;
  
  /**
   * 최대 높이 (픽셀)
   */
  maxHeight?: number;
  
  /**
   * 품질 (0-1)
   */
  quality?: number;
  
  /**
   * 출력 형식
   */
  format?: 'jpeg' | 'png' | 'webp';
  
  /**
   * WebP 지원 여부
   */
  webpSupported?: boolean;
}

/**
 * 이미지 최적화 (클라이언트 사이드)
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'jpeg',
    webpSupported = false,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 비율 유지하며 크기 조정
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height);

        // 형식에 따라 변환
        const mimeType = webpSupported && format === 'webp'
          ? 'image/webp'
          : format === 'png'
          ? 'image/png'
          : 'image/jpeg';

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 이미지 URL에서 최적화된 URL 생성
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  // 실제 환경에서는 이미지 최적화 서비스 API를 사용
  // 예: Cloudinary, Imgix 등
  
  if (originalUrl.startsWith('http') || originalUrl.startsWith('//')) {
    // 외부 이미지 서비스 사용 시
    const params = new URLSearchParams();
    
    if (options.maxWidth) {
      params.append('w', options.maxWidth.toString());
    }
    if (options.maxHeight) {
      params.append('h', options.maxHeight.toString());
    }
    if (options.quality) {
      params.append('q', (options.quality * 100).toString());
    }
    if (options.format === 'webp' && options.webpSupported) {
      params.append('f', 'webp');
    }

    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}${params.toString()}`;
  }

  // 로컬 이미지는 그대로 반환 (빌드 시 최적화)
  return originalUrl;
}

/**
 * WebP 지원 여부 확인
 */
export function isWebPSupported(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * 이미지 크기 계산
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 이미지 파일 크기 확인
 */
export function getImageFileSize(file: File): number {
  return file.size;
}

/**
 * 이미지 압축률 계산
 */
export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  return ((originalSize - compressedSize) / originalSize) * 100;
}

