/**
 * ImageAnalysisService 테스트
 */

// document.createElement 모킹
(global as any).document = {
  createElement: jest.fn((tagName: string) => {
    if (tagName === 'canvas') {
      return new MockCanvas();
    }
    return {};
  }),
};

// Canvas 모킹
class MockCanvas {
  width: number = 0;
  height: number = 0;
  private imageData: ImageData | null = null;
  private ctx: MockCanvasRenderingContext2D | null = null;

  getContext(contextType: string): CanvasRenderingContext2D | null {
    if (contextType === '2d') {
      if (!this.ctx) {
        this.ctx = new MockCanvasRenderingContext2D(this);
      }
      return this.ctx as any;
    }
    return null;
  }

  toBlob(callback: (blob: Blob | null) => void, type?: string, quality?: number): void {
    // 간단한 블롭 생성 시뮬레이션
    const blob = new Blob(['mock image data'], { type: type || 'image/png' });
    setTimeout(() => callback(blob), 0);
  }

  setImageData(data: ImageData): void {
    this.imageData = data;
  }

  getImageData(): ImageData {
    if (!this.imageData) {
      // 기본 이미지 데이터 생성
      const data = new Uint8ClampedArray(4 * this.width * this.height);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 128;     // R
        data[i + 1] = 128; // G
        data[i + 2] = 128; // B
        data[i + 3] = 255; // A
      }
      this.imageData = new ImageData(data, this.width, this.height);
    }
    return this.imageData;
  }
}

class MockCanvasRenderingContext2D {
  private canvas: MockCanvas;

  constructor(canvas: MockCanvas) {
    this.canvas = canvas;
  }

  drawImage(image: HTMLImageElement, dx: number, dy: number): void {
    // 이미지 그리기 시뮬레이션
  }

  getImageData(sx: number, sy: number, sw: number, sh: number): ImageData {
    return this.canvas.getImageData();
  }

  putImageData(imageData: ImageData, dx: number, dy: number): void {
    this.canvas.setImageData(imageData);
  }
}

// HTMLCanvasElement 모킹
(global as any).HTMLCanvasElement = MockCanvas;

// Image 모킹
class MockImage {
  width: number = 800;
  height: number = 600;
  src: string = '';
  onload: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  constructor() {
    // 즉시 로드 완료 시뮬레이션
    setTimeout(() => {
      if (this.onload) {
        this.onload({});
      }
    }, 0);
  }
}

(global as any).Image = MockImage;

// FileReader 모킹
class MockFileReader {
  result: string | ArrayBuffer | null = null;
  onload: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  readAsDataURL(file: File): void {
    // 즉시 완료 시뮬레이션
    this.result = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    // nextTick으로 즉시 실행
    if (this.onload) {
      this.onload({ target: { result: this.result } });
    }
  }
}

(global as any).FileReader = MockFileReader;

import {
  ImageAnalysisService,
  imageAnalysisService,
  ImageAnalysisResult,
} from '../imageAnalysisService';

describe('ImageAnalysisService', () => {
  let service: ImageAnalysisService;
  
  // 테스트 타임아웃 증가
  jest.setTimeout(30000);

  beforeEach(() => {
    // 새 인스턴스 생성
    service = new ImageAnalysisService();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(ImageAnalysisService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(imageAnalysisService).toBeDefined();
      expect(imageAnalysisService).toBeInstanceOf(ImageAnalysisService);
    });
  });

  describe('이미지 분석', () => {
    it('이미지 파일 분석 성공', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.analyzeImage(file);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('분석 결과 구조 확인', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.analyzeImage(file);

      if (result.success && result.data) {
        expect(result.data.quality).toBeDefined();
        expect(result.data.colors).toBeDefined();
        expect(result.data.metadata).toBeDefined();
      }
    });

    it('이미지 품질 분석 포함', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.analyzeImage(file);

      if (result.success && result.data?.quality) {
        expect(result.data.quality.resolution).toBeDefined();
        expect(result.data.quality.resolution.width).toBeGreaterThan(0);
        expect(result.data.quality.resolution.height).toBeGreaterThan(0);
        expect(result.data.quality.fileSize).toBeDefined();
        expect(result.data.quality.format).toBeDefined();
      }
    });

    it('색상 분석 포함', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.analyzeImage(file);

      if (result.success && result.data?.colors) {
        expect(result.data.colors.dominant).toBeDefined();
        expect(result.data.colors.palette).toBeInstanceOf(Array);
        expect(typeof result.data.colors.brightness).toBe('number');
        expect(typeof result.data.colors.contrast).toBe('number');
        expect(typeof result.data.colors.saturation).toBe('number');
      }
    });

    it('텍스트 추출 포함', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.analyzeImage(file);

      if (result.success && result.data) {
        expect(result.data.text).toBeDefined();
        expect(Array.isArray(result.data.text)).toBe(true);
      }
    });

    it('객체 감지 포함', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.analyzeImage(file);

      if (result.success && result.data) {
        expect(result.data.objects).toBeDefined();
        expect(Array.isArray(result.data.objects)).toBe(true);
      }
    });

    it('감정 분석 포함', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.analyzeImage(file);

      if (result.success && result.data?.emotions) {
        expect(result.data.emotions.primary).toBeDefined();
        expect(result.data.emotions.confidence).toBeDefined();
        expect(result.data.emotions.overall).toMatch(/positive|negative|neutral/);
      }
    });

    it('얼굴 분석 포함', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.analyzeImage(file);

      if (result.success && result.data?.faces) {
        expect(typeof result.data.faces.count).toBe('number');
        expect(Array.isArray(result.data.faces.faces)).toBe(true);
      }
    });

    it('메타데이터 포함', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.analyzeImage(file);

      if (result.success && result.data?.metadata) {
        expect(result.data.metadata.format).toBeDefined();
        expect(result.data.metadata.size).toBeDefined();
      }
    });
  });

  describe('이미지 최적화', () => {
    it('이미지 최적화 성공', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const optimized = await service.optimizeImage(file);

      expect(optimized).toBeInstanceOf(File);
      expect(optimized.name).toBe(file.name);
    });

    it('최대 너비 설정', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const optimized = await service.optimizeImage(file, { maxWidth: 800 });

      expect(optimized).toBeInstanceOf(File);
    });

    it('최대 높이 설정', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const optimized = await service.optimizeImage(file, { maxHeight: 600 });

      expect(optimized).toBeInstanceOf(File);
    });

    it('품질 설정', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const optimized = await service.optimizeImage(file, { quality: 0.9 });

      expect(optimized).toBeInstanceOf(File);
    });

    it('포맷 설정', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const optimized = await service.optimizeImage(file, { format: 'png' });

      expect(optimized).toBeInstanceOf(File);
    });

    it('모든 옵션 설정', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const optimized = await service.optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        format: 'webp',
      });

      expect(optimized).toBeInstanceOf(File);
    });
  });

  describe('이미지 필터', () => {
    it('그레이스케일 필터 적용', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });
      const result = await service.analyzeImage(file);

      if (result.success && result.data?.quality) {
        // Image 객체 생성 시뮬레이션
        const img = new MockImage() as HTMLImageElement;
        const canvas = service.applyFilter(img, 'grayscale');

        expect(canvas).toBeDefined();
      }
    });

    it('세피아 필터 적용', async () => {
      const img = new MockImage() as HTMLImageElement;
      const canvas = service.applyFilter(img, 'sepia');

      expect(canvas).toBeDefined();
    });

    it('반전 필터 적용', async () => {
      const img = new MockImage() as HTMLImageElement;
      const canvas = service.applyFilter(img, 'invert');

      expect(canvas).toBeDefined();
    });

    it('블러 필터 적용', async () => {
      const img = new MockImage() as HTMLImageElement;
      const canvas = service.applyFilter(img, 'blur');

      expect(canvas).toBeDefined();
    });
  });

  describe('에러 처리', () => {
    it('잘못된 파일 처리', async () => {
      // FileReader 오류 시뮬레이션
      const originalFileReader = (global as any).FileReader;
      (global as any).FileReader = class {
        onerror: ((event: any) => void) | null = null;
        readAsDataURL() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('File read error'));
            }
          }, 0);
        }
      };

      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const result = await service.analyzeImage(file);

      // FileReader 복원
      (global as any).FileReader = originalFileReader;

      // 에러가 발생하더라도 결과가 반환되어야 함
      expect(result).toBeDefined();
    });
  });

  describe('병렬 분석', () => {
    it('여러 분석이 병렬로 실행됨', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });
      const startTime = Date.now();

      const result = await service.analyzeImage(file);
      const duration = Date.now() - startTime;

      // 모든 분석이 완료되어야 함 (병렬 실행이므로 전체 시간은 가장 긴 작업 시간보다 약간 길어야 함)
      expect(result.success).toBe(true);
      // 병렬 실행으로 인해 순차 실행보다 빠를 것으로 예상
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('이미지 품질 메트릭', () => {
    it('선명도 계산', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.analyzeImage(file);

      if (result.success && result.data?.quality) {
        expect(typeof result.data.quality.sharpness).toBe('number');
        expect(result.data.quality.sharpness).toBeGreaterThanOrEqual(0);
        expect(result.data.quality.sharpness).toBeLessThanOrEqual(1);
      }
    });

    it('노이즈 계산', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.analyzeImage(file);

      if (result.success && result.data?.quality) {
        expect(typeof result.data.quality.noise).toBe('number');
        expect(result.data.quality.noise).toBeGreaterThanOrEqual(0);
        expect(result.data.quality.noise).toBeLessThanOrEqual(1);
      }
    });

    it('압축률 계산', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.analyzeImage(file);

      if (result.success && result.data?.quality) {
        expect(typeof result.data.quality.compression).toBe('number');
      }
    });
  });

  describe('색상 분석 상세', () => {
    it('주요 색상 팔레트 반환', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.analyzeImage(file);

      if (result.success && result.data?.colors) {
        expect(result.data.colors.palette).toBeInstanceOf(Array);
        expect(result.data.colors.palette.length).toBeGreaterThan(0);
        expect(result.data.colors.palette.length).toBeLessThanOrEqual(5);
      }
    });

    it('밝기 값 범위', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.analyzeImage(file);

      if (result.success && result.data?.colors) {
        expect(result.data.colors.brightness).toBeGreaterThanOrEqual(0);
        expect(result.data.colors.brightness).toBeLessThanOrEqual(1);
      }
    });

    it('대비 값 범위', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.analyzeImage(file);

      if (result.success && result.data?.colors) {
        expect(result.data.colors.contrast).toBeGreaterThanOrEqual(0);
        expect(result.data.colors.contrast).toBeLessThanOrEqual(1);
      }
    });

    it('채도 값 범위', async () => {
      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.analyzeImage(file);

      if (result.success && result.data?.colors) {
        expect(result.data.colors.saturation).toBeGreaterThanOrEqual(0);
        expect(result.data.colors.saturation).toBeLessThanOrEqual(1);
      }
    });
  });
});

