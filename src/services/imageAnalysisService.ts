export interface ImageAnalysisResult {
    success: boolean;
    data?: {
        text?: string[];
        objects?: DetectedObject[];
        emotions?: EmotionAnalysis;
        colors?: ColorAnalysis;
        faces?: FaceAnalysis;
        quality?: ImageQuality;
        metadata?: ImageMetadata;
    };
    error?: string;
}

export interface DetectedObject {
    name: string;
    confidence: number;
    boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    category: string;
}

export interface EmotionAnalysis {
    primary: string;
    confidence: number;
    emotions: {
        [key: string]: number;
    };
    overall: 'positive' | 'negative' | 'neutral';
}

export interface ColorAnalysis {
    dominant: string;
    palette: string[];
    brightness: number;
    contrast: number;
    saturation: number;
}

export interface FaceAnalysis {
    count: number;
    faces: {
        age?: number;
        gender?: string;
        emotion: string;
        confidence: number;
        landmarks?: number[][];
    }[];
}

export interface ImageQuality {
    resolution: {
        width: number;
        height: number;
    };
    fileSize: number;
    format: string;
    compression: number;
    sharpness: number;
    noise: number;
}

export interface ImageMetadata {
    camera?: string;
    date?: string;
    location?: string;
    tags?: string[];
    description?: string;
    format?: string;
    size?: number;
    lastModified?: string;
}

class ImageAnalysisService {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;

    constructor() {
        this.initializeCanvas();
    }

    private initializeCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    // 이미지 파일을 Base64로 변환
    private async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Base64 이미지를 Image 객체로 변환
    private async base64ToImage(base64: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = base64;
        });
    }

    // 이미지 품질 분석
    private analyzeImageQuality(img: HTMLImageElement, file: File): ImageQuality {
        if (!this.canvas || !this.ctx) {
            throw new Error('Canvas not initialized');
        }

        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);

        const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        // 선명도 계산 (Laplacian variance)
        let sharpness = 0;
        for (let y = 1; y < img.height - 1; y++) {
            for (let x = 1; x < img.width - 1; x++) {
                const idx = (y * img.width + x) * 4;
                const center = data[idx];
                const neighbors = [
                    data[idx - img.width * 4], // 위
                    data[idx + img.width * 4], // 아래
                    data[idx - 4], // 왼쪽
                    data[idx + 4]  // 오른쪽
                ];

                const laplacian = 4 * center - neighbors.reduce((sum, val) => sum + val, 0);
                sharpness += Math.abs(laplacian);
            }
        }
        sharpness /= (img.width * img.height);

        // 노이즈 계산
        let noise = 0;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            noise += gray;
        }
        noise = Math.sqrt(noise / (data.length / 4));

        return {
            resolution: { width: img.width, height: img.height },
            fileSize: file.size,
            format: file.type,
            compression: 1 - (file.size / (img.width * img.height * 4)),
            sharpness: Math.min(sharpness / 255, 1),
            noise: Math.min(noise / 255, 1)
        };
    }

    // 색상 분석
    private analyzeColors(img: HTMLImageElement): ColorAnalysis {
        if (!this.canvas || !this.ctx) {
            throw new Error('Canvas not initialized');
        }

        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);

        const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        const colorCounts: { [key: string]: number } = {};
        let totalBrightness = 0;
        let totalSaturation = 0;
        let totalContrast = 0;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // 색상 양자화 (16색상으로 단순화)
            const quantizedR = Math.floor(r / 16) * 16;
            const quantizedG = Math.floor(g / 16) * 16;
            const quantizedB = Math.floor(b / 16) * 16;
            const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;

            colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;

            // 밝기 계산
            const brightness = (r + g + b) / 3;
            totalBrightness += brightness;

            // 채도 계산
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max === 0 ? 0 : (max - min) / max;
            totalSaturation += saturation;
        }

        const pixelCount = data.length / 4;
        const avgBrightness = totalBrightness / pixelCount;
        const avgSaturation = totalSaturation / pixelCount;

        // 대비 계산
        const sortedBrightness: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            sortedBrightness.push(brightness);
        }
        sortedBrightness.sort((a, b) => a - b);
        const contrast = (sortedBrightness[sortedBrightness.length - 1] - sortedBrightness[0]) / 255;

        // 주요 색상 추출
        const sortedColors = Object.entries(colorCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([color]) => `rgb(${color})`);

        return {
            dominant: sortedColors[0],
            palette: sortedColors,
            brightness: avgBrightness / 255,
            contrast,
            saturation: avgSaturation
        };
    }

    // OCR 텍스트 추출 (시뮬레이션)
    private async extractText(img: HTMLImageElement): Promise<string[]> {
        // 실제 OCR API 호출 대신 시뮬레이션
        // 실제 구현에서는 Tesseract.js나 Google Vision API 사용
        return new Promise((resolve) => {
            setTimeout(() => {
                // 이미지 크기에 따라 텍스트 존재 여부 추정
                const hasText = img.width > 200 && img.height > 100;
                resolve(hasText ? ['추출된 텍스트 예시', '이미지에서 인식된 텍스트'] : []);
            }, 1000);
        });
    }

    // 객체 감지 (시뮬레이션)
    private async detectObjects(img: HTMLImageElement): Promise<DetectedObject[]> {
        // 실제 객체 감지 API 호출 대신 시뮬레이션
        // 실제 구현에서는 TensorFlow.js나 Google Vision API 사용
        return new Promise((resolve) => {
            setTimeout(() => {
                const objects: DetectedObject[] = [];

                // 이미지 크기에 따라 객체 존재 여부 추정
                if (img.width > 300 && img.height > 300) {
                    objects.push({
                        name: '사람',
                        confidence: 0.85,
                        boundingBox: { x: 100, y: 100, width: 150, height: 200 },
                        category: 'person'
                    });

                    objects.push({
                        name: '컴퓨터',
                        confidence: 0.72,
                        boundingBox: { x: 300, y: 150, width: 100, height: 80 },
                        category: 'electronics'
                    });
                }

                resolve(objects);
            }, 1500);
        });
    }

    // 감정 분석 (시뮬레이션)
    private async analyzeEmotions(img: HTMLImageElement): Promise<EmotionAnalysis> {
        // 실제 감정 분석 API 호출 대신 시뮬레이션
        // 실제 구현에서는 Face API나 감정 분석 모델 사용
        return new Promise((resolve) => {
            setTimeout(() => {
                const emotions = {
                    '기쁨': 0.3,
                    '슬픔': 0.1,
                    '분노': 0.05,
                    '놀람': 0.15,
                    '중립': 0.4
                };

                const primary = Object.entries(emotions)
                    .sort(([, a], [, b]) => b - a)[0][0];

                const overall = emotions['기쁨'] > 0.5 ? 'positive' :
                    emotions['슬픔'] > 0.5 || emotions['분노'] > 0.5 ? 'negative' : 'neutral';

                resolve({
                    primary,
                    confidence: emotions[primary as keyof typeof emotions],
                    emotions,
                    overall
                });
            }, 800);
        });
    }

    // 얼굴 분석 (시뮬레이션)
    private async analyzeFaces(img: HTMLImageElement): Promise<FaceAnalysis> {
        // 실제 얼굴 분석 API 호출 대신 시뮬레이션
        // 실제 구현에서는 Face API나 얼굴 인식 모델 사용
        return new Promise((resolve) => {
            setTimeout(() => {
                const faces = [];

                // 이미지 크기에 따라 얼굴 존재 여부 추정
                if (img.width > 200 && img.height > 200) {
                    faces.push({
                        age: 25,
                        gender: 'female',
                        emotion: '기쁨',
                        confidence: 0.88,
                        landmarks: []
                    });
                }

                resolve({
                    count: faces.length,
                    faces
                });
            }, 1200);
        });
    }

    // 메인 이미지 분석 함수
    async analyzeImage(file: File): Promise<ImageAnalysisResult> {
        try {
            const base64 = await this.fileToBase64(file);
            const img = await this.base64ToImage(base64);

            // 병렬로 모든 분석 실행
            const [
                text,
                objects,
                emotions,
                colors,
                faces,
                quality
            ] = await Promise.all([
                this.extractText(img),
                this.detectObjects(img),
                this.analyzeEmotions(img),
                this.analyzeColors(img),
                this.analyzeFaces(img),
                this.analyzeImageQuality(img, file)
            ]);

            return {
                success: true,
                data: {
                    text,
                    objects,
                    emotions,
                    colors,
                    faces,
                    quality,
                    metadata: {
                        format: file.type,
                        size: file.size,
                        lastModified: new Date(file.lastModified).toISOString()
                    }
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '이미지 분석 중 오류가 발생했습니다.'
            };
        }
    }

    // 이미지 압축 및 최적화
    async optimizeImage(file: File, options: {
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
        format?: 'jpeg' | 'png' | 'webp';
    } = {}): Promise<File> {
        const {
            maxWidth = 1920,
            maxHeight = 1080,
            quality = 0.8,
            format = 'jpeg'
        } = options;

        const base64 = await this.fileToBase64(file);
        const img = await this.base64ToImage(base64);

        // 크기 조정
        const { width, height } = this.calculateAspectRatio(
            img.width, img.height, maxWidth, maxHeight
        );

        if (!this.canvas || !this.ctx) {
            throw new Error('Canvas not initialized');
        }

        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.drawImage(img, 0, 0, width, height);

        return new Promise((resolve) => {
            this.canvas!.toBlob((blob) => {
                if (blob) {
                    const optimizedFile = new File([blob], file.name, {
                        type: `image/${format}`
                    });
                    resolve(optimizedFile);
                } else {
                    throw new Error('이미지 최적화에 실패했습니다.');
                }
            }, `image/${format}`, quality);
        });
    }

    // 종횡비 계산
    private calculateAspectRatio(
        originalWidth: number,
        originalHeight: number,
        maxWidth: number,
        maxHeight: number
    ): { width: number; height: number } {
        const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);

        return {
            width: Math.round(originalWidth * ratio),
            height: Math.round(originalHeight * ratio)
        };
    }

    // 이미지 필터 적용
    applyFilter(img: HTMLImageElement, filter: string): HTMLCanvasElement {
        if (!this.canvas || !this.ctx) {
            throw new Error('Canvas not initialized');
        }

        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);

        const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        switch (filter) {
            case 'grayscale':
                for (let i = 0; i < data.length; i += 4) {
                    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                    data[i] = gray;
                    data[i + 1] = gray;
                    data[i + 2] = gray;
                }
                break;

            case 'sepia':
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                    data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                    data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
                }
                break;

            case 'invert':
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];
                    data[i + 1] = 255 - data[i + 1];
                    data[i + 2] = 255 - data[i + 2];
                }
                break;

            case 'blur':
                // 간단한 블러 효과 (실제로는 더 복잡한 알고리즘 필요)
                const tempData = new Uint8ClampedArray(data);
                for (let y = 1; y < img.height - 1; y++) {
                    for (let x = 1; x < img.width - 1; x++) {
                        const idx = (y * img.width + x) * 4;
                        for (let c = 0; c < 3; c++) {
                            const sum = tempData[idx - img.width * 4 + c] +
                                tempData[idx + img.width * 4 + c] +
                                tempData[idx - 4 + c] +
                                tempData[idx + 4 + c] +
                                tempData[idx + c];
                            data[idx + c] = sum / 5;
                        }
                    }
                }
                break;
        }

        this.ctx.putImageData(imageData, 0, 0);
        return this.canvas;
    }
}

export const imageAnalysisService = new ImageAnalysisService();
