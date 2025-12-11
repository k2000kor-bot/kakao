/**
 * 지연 로딩 이미지 컴포넌트
 * 이미지 최적화 및 lazy loading 지원
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './LazyImage.css';

interface LazyImageProps {
    /**
     * 이미지 소스 URL
     */
    src: string;

    /**
     * 대체 텍스트
     */
    alt: string;

    /**
     * 이미지 너비
     */
    width?: number | string;

    /**
     * 이미지 높이
     */
    height?: number | string;

    /**
     * 플레이스홀더 이미지
     */
    placeholder?: string;

    /**
     * 로딩 중 표시할 컴포넌트
     */
    loadingComponent?: React.ReactNode;

    /**
     * 에러 발생 시 표시할 컴포넌트
     */
    errorComponent?: React.ReactNode;

    /**
     * 이미지 로드 완료 콜백
     */
    onLoad?: () => void;

    /**
     * 이미지 로드 실패 콜백
     */
    onError?: (error: Error) => void;

    /**
     * 클래스명
     */
    className?: string;

    /**
     * 스타일
     */
    style?: React.CSSProperties;

    /**
     * 이미지 품질 (1-100)
     */
    quality?: number;

    /**
     * 반응형 이미지 소스셋
     */
    srcSet?: string;

    /**
     * 이미지 크기 힌트
     */
    sizes?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    width,
    height,
    placeholder,
    loadingComponent,
    errorComponent,
    onLoad,
    onError,
    className = '',
    style,
    quality = 80,
    srcSet,
    sizes,
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer를 사용한 뷰포트 감지
    useEffect(() => {
        if (typeof globalThis === 'undefined' || !('IntersectionObserver' in globalThis)) {
            // IntersectionObserver를 지원하지 않는 환경에서는 즉시 로드
            setIsInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px', // 뷰포트 50px 전에 미리 로드
                threshold: 0.01,
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    // 이미지 로드 핸들러
    const handleLoad = useCallback(() => {
        setIsLoaded(true);
        if (onLoad) {
            onLoad();
        }
    }, [onLoad]);

    // 이미지 에러 핸들러
    const handleError = useCallback(() => {
        setHasError(true);
        const error = new Error(`Failed to load image: ${src}`);
        if (onError) {
            onError(error);
        }
    }, [src, onError]);

    // 이미지 URL 최적화 (WebP 변환 등)
    const optimizedSrc = useMemo(() => {
        // 실제 환경에서는 이미지 최적화 서비스를 사용
        // 예: Cloudinary, Imgix, 또는 자체 이미지 최적화 서버
        if (src.startsWith('http') || src.startsWith('//')) {
            // 외부 이미지는 그대로 사용
            return src;
        }

        // 로컬 이미지는 그대로 사용 (실제로는 빌드 시 최적화)
        return src;
    }, [src]);

    // 에러 상태
    if (hasError) {
        if (errorComponent) {
            return <>{errorComponent}</>;
        }
        return (
            <div
                className={`lazy-image-error ${className}`}
                style={{ width, height, ...style }}
                role="img"
                aria-label={`${alt} 이미지 로드 실패`}
            >
                <span>이미지를 불러올 수 없습니다</span>
            </div>
        );
    }

    // 로딩 상태
    if (!isInView || !isLoaded) {
        return (
            <div
                ref={containerRef}
                className={`lazy-image-container ${className}`}
                style={{ width, height, ...style }}
                role="img"
                aria-label={`${alt} 로딩 중`}
                aria-busy="true"
            >
                {loadingComponent || (
                    <div className="lazy-image-placeholder" aria-hidden="true">
                        {placeholder ? (
                            <img src={placeholder} alt="" aria-hidden="true" />
                        ) : (
                            <div className="lazy-image-skeleton" />
                        )}
                    </div>
                )}
                {isInView && (
                    <img
                        ref={imgRef}
                        src={optimizedSrc}
                        alt={alt}
                        width={width}
                        height={height}
                        srcSet={srcSet}
                        sizes={sizes}
                        onLoad={handleLoad}
                        onError={handleError}
                        className="lazy-image-hidden"
                        loading="lazy"
                        decoding="async"
                        aria-hidden="true"
                    />
                )}
            </div>
        );
    }

    // 로드 완료 상태
    return (
        <div
            ref={containerRef}
            className={`lazy-image-container ${className}`}
            style={{ width, height, ...style }}
        >
            <img
                ref={imgRef}
                src={optimizedSrc}
                alt={alt}
                width={width}
                height={height}
                srcSet={srcSet}
                sizes={sizes}
                className="lazy-image-loaded"
                loading="lazy"
                decoding="async"
            />
        </div>
    );
};

export default LazyImage;
