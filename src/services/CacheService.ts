interface CacheOptions {
    ttl?: number; // Time to live in milliseconds
    maxSize?: number; // Maximum number of items in cache
    maxItemSize?: number; // Maximum size per item in bytes
}

interface CacheItem<T> {
    value: T;
    timestamp: number;
    size: number;
}

export class CacheService {
    private cache: Map<string, CacheItem<any>>;
    private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutes
    private readonly maxSize: number;
    private readonly maxItemSize: number;
    private currentSize: number = 0;
    private hits: number = 0;
    private misses: number = 0;
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(options: CacheOptions = {}) {
        this.cache = new Map();
        this.maxSize = options.maxSize || 1000;
        this.maxItemSize = options.maxItemSize || 10 * 1024; // 10KB par défaut
        this.defaultTTL = options.ttl || this.defaultTTL;
    }

    public async get<T>(key: string, fetchFn?: () => Promise<T>, ttl?: number): Promise<T | null> {
        const item = this.cache.get(key);

        // Si l'item existe et n'est pas expiré
        if (item && Date.now() - item.timestamp < (ttl || this.defaultTTL)) {
            this.hits++;
            return item.value as T;
        }
        
        this.misses++;

        // Si pas de fonction de récupération, retourner null
        if (!fetchFn) {
            this.delete(key);
            return null;
        }

        // Récupérer et mettre en cache la nouvelle valeur
        const value = await fetchFn();
        this.set(key, value, ttl);
        return value;
    }

    public set(key: string, value: any, ttl?: number): void {
        // Calculer la taille de l'item
        const itemSize = this.calculateSize(value);
        
        // Vérifier la taille de l'item
        if (itemSize > this.maxItemSize) {
            console.warn(`[Cache] Item trop grand pour le cache: ${key} (${itemSize} bytes)`);
            return;
        }

        // Si l'item existe déjà, libérer son espace
        const existingItem = this.cache.get(key);
        if (existingItem) {
            this.currentSize -= existingItem.size;
        }

        // Vérifier et libérer de l'espace si nécessaire
        while (this.cache.size >= this.maxSize || this.currentSize + itemSize > this.maxSize * 1024) {
            const oldestKey = this.getOldestKey();
            if (oldestKey) {
                this.delete(oldestKey);
            } else {
                break;
            }
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            size: itemSize
        });
        this.currentSize += itemSize;
    }

    private calculateSize(obj: any): number {
        try {
            return JSON.stringify(obj).length;
        } catch {
            return 0;
        }
    }

    private getOldestKey(): string | null {
        let oldestKey: string | null = null;
        let oldestTime = Infinity;

        for (const [key, item] of this.cache.entries()) {
            if (item.timestamp < oldestTime) {
                oldestTime = item.timestamp;
                oldestKey = key;
            }
        }

        return oldestKey;
    }

    public delete(key: string): void {
        const item = this.cache.get(key);
        if (item) {
            this.currentSize -= item.size;
            this.cache.delete(key);
        }
    }

    public clear(): void {
        this.cache.clear();
        this.currentSize = 0;
        this.hits = 0;
        this.misses = 0;
    }

    // Nettoyage périodique des entrées expirées
    public startCleanupInterval(interval: number = 60000): void {
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [key, item] of this.cache.entries()) {
                if (now - item.timestamp >= this.defaultTTL) {
                    this.cache.delete(key);
                }
            }
        }, interval);
    }

    public stopCleanupInterval(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    public getSize(): number {
        return this.cache.size;
    }

    public getStats(): { hits: number; misses: number; hitRate: number; size: number; itemCount: number; memoryUsage: number } {
        const total = this.hits + this.misses;
        return {
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? this.hits / total : 0,
            size: this.cache.size,
            itemCount: this.cache.size,
            memoryUsage: this.currentSize / 1024 // KB
        };
    }
}
