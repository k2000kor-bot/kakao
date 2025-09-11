import { EventEmitter } from 'events';

// 인터페이스 정의
export interface CacheEntry<T = any> {
    key: string;
    data: T;
    timestamp: Date;
    expiry: Date;
    access_count: number;
    last_accessed: Date;
    size: number; // bytes
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface CacheStats {
    total_entries: number;
    total_size: number; // bytes
    hit_rate: number; // 0-1
    miss_rate: number; // 0-1
    eviction_count: number;
    memory_usage: number; // MB
    oldest_entry: Date | null;
    newest_entry: Date | null;
    most_accessed_key: string | null;
    cache_efficiency: number; // 0-100
}

export interface CacheConfig {
    max_size: number; // MB
    max_entries: number;
    default_ttl: number; // seconds
    cleanup_interval: number; // seconds
    eviction_policy: 'lru' | 'lfu' | 'ttl' | 'priority';
    compression_enabled: boolean;
    persistence_enabled: boolean;
}

// AI 캐시 관리자 클래스
class AICacheManager extends EventEmitter {
    private cache: Map<string, CacheEntry> = new Map();
    private hitCount: number = 0;
    private missCount: number = 0;
    private evictionCount: number = 0;
    private cleanupInterval: NodeJS.Timeout | null = null;
    private config: CacheConfig;
    private isRunning: boolean = false;

    constructor(config?: Partial<CacheConfig>) {
        super();

        this.config = {
            max_size: 100, // 100MB
            max_entries: 10000,
            default_ttl: 3600, // 1시간
            cleanup_interval: 300, // 5분
            eviction_policy: 'lru',
            compression_enabled: true,
            persistence_enabled: false,
            ...config
        };

        this.startCleanup();
        console.log('🗄️ AI 캐시 관리자가 초기화되었습니다.');
    }

    // 캐시 시작
    public start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startCleanup();
        console.log('🚀 AI 캐시 관리자가 시작되었습니다.');
    }

    // 캐시 중지
    public stop(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.isRunning = false;
        console.log('⏹️ AI 캐시 관리자가 중지되었습니다.');
    }

    // 데이터 저장
    public set<T>(
        key: string,
        data: T,
        options?: {
            ttl?: number;
            tags?: string[];
            priority?: 'low' | 'medium' | 'high' | 'critical';
        }
    ): boolean {
        try {
            const now = new Date();
            const ttl = options?.ttl || this.config.default_ttl;
            const expiry = new Date(now.getTime() + ttl * 1000);
            const serializedData = JSON.stringify(data);
            const size = new Blob([serializedData]).size;

            // 메모리 제한 확인
            if (!this.canStore(size)) {
                this.evictEntries(size);
            }

            const entry: CacheEntry<T> = {
                key,
                data,
                timestamp: now,
                expiry,
                access_count: 0,
                last_accessed: now,
                size,
                tags: options?.tags || [],
                priority: options?.priority || 'medium'
            };

            this.cache.set(key, entry);
            this.emit('cache_set', { key, size, ttl });

            console.log(`💾 캐시 저장: ${key} (${this.formatSize(size)})`);
            return true;
        } catch (error) {
            console.error('캐시 저장 오류:', error);
            return false;
        }
    }

    // 데이터 조회
    public get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            this.missCount++;
            this.emit('cache_miss', { key });
            return null;
        }

        // 만료 확인
        if (this.isExpired(entry)) {
            this.cache.delete(key);
            this.missCount++;
            this.emit('cache_expired', { key });
            return null;
        }

        // 액세스 정보 업데이트
        entry.access_count++;
        entry.last_accessed = new Date();

        this.hitCount++;
        this.emit('cache_hit', { key, access_count: entry.access_count });

        return entry.data as T;
    }

    // 데이터 삭제
    public delete(key: string): boolean {
        const entry = this.cache.get(key);
        if (entry) {
            this.cache.delete(key);
            this.emit('cache_delete', { key, size: entry.size });
            console.log(`🗑️ 캐시 삭제: ${key}`);
            return true;
        }
        return false;
    }

    // 태그로 삭제
    public deleteByTag(tag: string): number {
        let deletedCount = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.tags.includes(tag)) {
                this.cache.delete(key);
                deletedCount++;
                this.emit('cache_delete', { key, size: entry.size, tag });
            }
        }

        console.log(`🏷️ 태그 '${tag}'로 ${deletedCount}개 항목 삭제`);
        return deletedCount;
    }

    // 캐시 존재 확인
    public has(key: string): boolean {
        const entry = this.cache.get(key);
        return entry !== undefined && !this.isExpired(entry);
    }

    // 캐시 클리어
    public clear(): void {
        const size = this.cache.size;
        this.cache.clear();
        this.hitCount = 0;
        this.missCount = 0;
        this.evictionCount = 0;
        this.emit('cache_cleared', { cleared_entries: size });
        console.log(`🧹 캐시 전체 삭제: ${size}개 항목`);
    }

    // 만료된 항목 정리
    public cleanup(): number {
        let cleanedCount = 0;
        const now = new Date();

        for (const [key, entry] of this.cache.entries()) {
            if (this.isExpired(entry)) {
                this.cache.delete(key);
                cleanedCount++;
                this.emit('cache_expired', { key });
            }
        }

        if (cleanedCount > 0) {
            console.log(`🧽 만료된 캐시 정리: ${cleanedCount}개 항목`);
        }

        return cleanedCount;
    }

    // 캐시 통계
    public getStats(): CacheStats {
        const entries = Array.from(this.cache.values());
        const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
        const totalRequests = this.hitCount + this.missCount;
        const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;
        const missRate = totalRequests > 0 ? this.missCount / totalRequests : 0;

        const timestamps = entries.map(e => e.timestamp);
        const accessCounts = entries.map(e => e.access_count);
        const mostAccessedEntry = entries.reduce((max, entry) =>
            entry.access_count > (max?.access_count || 0) ? entry : max, entries[0] || null);

        return {
            total_entries: this.cache.size,
            total_size: totalSize,
            hit_rate: hitRate,
            miss_rate: missRate,
            eviction_count: this.evictionCount,
            memory_usage: totalSize / (1024 * 1024), // MB
            oldest_entry: timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : null,
            newest_entry: timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : null,
            most_accessed_key: mostAccessedEntry?.key || null,
            cache_efficiency: hitRate * 100
        };
    }

    // 캐시 키 목록
    public getKeys(): string[] {
        return Array.from(this.cache.keys());
    }

    // 태그별 키 목록
    public getKeysByTag(tag: string): string[] {
        const keys: string[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if (entry.tags.includes(tag)) {
                keys.push(key);
            }
        }

        return keys;
    }

    // 캐시 항목 정보
    public getEntryInfo(key: string): CacheEntry | null {
        return this.cache.get(key) || null;
    }

    // 메모리 사용량 확인
    public getMemoryUsage(): { used: number; limit: number; percentage: number } {
        const used = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
        const limit = this.config.max_size * 1024 * 1024; // MB to bytes
        const percentage = (used / limit) * 100;

        return {
            used: used / (1024 * 1024), // MB
            limit: this.config.max_size, // MB
            percentage
        };
    }

    // 캐시 최적화
    public optimize(): void {
        console.log('🔧 캐시 최적화 시작...');

        // 만료된 항목 정리
        const expiredCount = this.cleanup();

        // 메모리 사용량 확인
        const memoryUsage = this.getMemoryUsage();

        if (memoryUsage.percentage > 80) {
            console.log(`⚠️ 메모리 사용량 높음: ${memoryUsage.percentage.toFixed(1)}%`);
            this.evictEntries(0, Math.floor(this.cache.size * 0.2)); // 20% 제거
        }

        // 통계 업데이트
        const stats = this.getStats();
        this.emit('cache_optimized', {
            expired_cleaned: expiredCount,
            memory_usage: memoryUsage,
            stats
        });

        console.log(`✅ 캐시 최적화 완료 - 효율성: ${stats.cache_efficiency.toFixed(1)}%`);
    }

    // 캐시 내보내기 (백업)
    public export(): any {
        const entries: any[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if (!this.isExpired(entry)) {
                entries.push({
                    key,
                    data: entry.data,
                    timestamp: entry.timestamp.toISOString(),
                    expiry: entry.expiry.toISOString(),
                    access_count: entry.access_count,
                    last_accessed: entry.last_accessed.toISOString(),
                    size: entry.size,
                    tags: entry.tags,
                    priority: entry.priority
                });
            }
        }

        return {
            entries,
            stats: this.getStats(),
            config: this.config,
            exported_at: new Date().toISOString()
        };
    }

    // 캐시 가져오기 (복원)
    public import(data: any): boolean {
        try {
            this.clear();

            if (data.entries && Array.isArray(data.entries)) {
                for (const entryData of data.entries) {
                    const entry: CacheEntry = {
                        key: entryData.key,
                        data: entryData.data,
                        timestamp: new Date(entryData.timestamp),
                        expiry: new Date(entryData.expiry),
                        access_count: entryData.access_count || 0,
                        last_accessed: new Date(entryData.last_accessed),
                        size: entryData.size,
                        tags: entryData.tags || [],
                        priority: entryData.priority || 'medium'
                    };

                    if (!this.isExpired(entry)) {
                        this.cache.set(entry.key, entry);
                    }
                }
            }

            console.log(`📥 캐시 가져오기 완료: ${this.cache.size}개 항목`);
            return true;
        } catch (error) {
            console.error('캐시 가져오기 오류:', error);
            return false;
        }
    }

    // 프리워밍 (자주 사용되는 데이터 미리 로드)
    public prewarm(keys: string[], dataLoader: (key: string) => Promise<any>): Promise<number> {
        return new Promise(async (resolve) => {
            let loadedCount = 0;

            for (const key of keys) {
                try {
                    if (!this.has(key)) {
                        const data = await dataLoader(key);
                        if (data !== null && data !== undefined) {
                            this.set(key, data, { priority: 'high', tags: ['prewarmed'] });
                            loadedCount++;
                        }
                    }
                } catch (error) {
                    console.error(`프리워밍 오류 (${key}):`, error);
                }
            }

            console.log(`🔥 캐시 프리워밍 완료: ${loadedCount}개 항목`);
            resolve(loadedCount);
        });
    }

    // 개인 메서드들

    // 만료 확인
    private isExpired(entry: CacheEntry): boolean {
        return new Date() > entry.expiry;
    }

    // 저장 가능 확인
    private canStore(size: number): boolean {
        const currentSize = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
        const maxSize = this.config.max_size * 1024 * 1024; // MB to bytes

        return (currentSize + size) <= maxSize && this.cache.size < this.config.max_entries;
    }

    // 항목 제거
    private evictEntries(requiredSize: number = 0, maxEvictions?: number): void {
        const entries = Array.from(this.cache.entries());
        let evictedSize = 0;
        let evictedCount = 0;
        const maxToEvict = maxEvictions || Math.ceil(entries.length * 0.1); // 기본 10%

        // 정책에 따른 정렬
        switch (this.config.eviction_policy) {
            case 'lru':
                entries.sort(([, a], [, b]) => a.last_accessed.getTime() - b.last_accessed.getTime());
                break;
            case 'lfu':
                entries.sort(([, a], [, b]) => a.access_count - b.access_count);
                break;
            case 'ttl':
                entries.sort(([, a], [, b]) => a.expiry.getTime() - b.expiry.getTime());
                break;
            case 'priority':
                const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
                entries.sort(([, a], [, b]) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;
        }

        // 제거 실행
        for (const [key, entry] of entries) {
            if (evictedCount >= maxToEvict && evictedSize >= requiredSize) break;

            if (entry.priority !== 'critical') {
                this.cache.delete(key);
                evictedSize += entry.size;
                evictedCount++;
                this.evictionCount++;
                this.emit('cache_evicted', { key, size: entry.size, policy: this.config.eviction_policy });
            }
        }

        if (evictedCount > 0) {
            console.log(`🗑️ 캐시 제거: ${evictedCount}개 항목 (${this.formatSize(evictedSize)})`);
        }
    }

    // 정리 작업 시작
    private startCleanup(): void {
        if (this.cleanupInterval) return;

        this.cleanupInterval = setInterval(() => {
            this.cleanup();

            // 메모리 사용량이 높으면 최적화
            const memoryUsage = this.getMemoryUsage();
            if (memoryUsage.percentage > 70) {
                this.optimize();
            }
        }, this.config.cleanup_interval * 1000);
    }

    // 크기 포맷팅
    private formatSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    // 설정 업데이트
    public updateConfig(newConfig: Partial<CacheConfig>): void {
        this.config = { ...this.config, ...newConfig };

        // 정리 간격이 변경되면 재시작
        if (newConfig.cleanup_interval) {
            this.stop();
            this.start();
        }

        this.emit('config_updated', this.config);
        console.log('⚙️ 캐시 설정이 업데이트되었습니다.');
    }

    // 태그로 캐시 무효화
    public invalidateByTag(tag: string): void {
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if (entry.tags.includes(tag)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => {
            this.cache.delete(key);
            this.emit('cache_invalidated', { key, tag });
        });

        if (keysToDelete.length > 0) {
            console.log(`🏷️ 태그 "${tag}"로 ${keysToDelete.length}개 캐시 항목이 무효화되었습니다.`);
        }
    }

    // 서비스 종료
    public shutdown(): void {
        this.stop();
        this.clear();
        console.log('🔌 AI 캐시 관리자가 종료되었습니다.');
    }
}

const aiCacheManager = new AICacheManager();
export default aiCacheManager;
