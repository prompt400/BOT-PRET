interface CacheOptions {
    ttl?: number; // Time to live in milliseconds
    maxSize?: number; // Maximum number of items in cache
}

interface CacheItem<T> {
    value: T;
    timestamp: number;
}

export class CacheService {
    private cache: Map<string, CacheItem<any>>;
    private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutes
    private readonly maxSize: number;

    constructor(options: CacheOptions = {}) {
        this.cache = new Map();
        this.maxSize = options.maxSize || 1000;
    }

    public async get<T>(key: string, fetchFn?: () => Promise<T>, ttl?: number): Promise<T | null> {
        const item = this.cache.get(key);

        // Si l'item existe et n'est pas expiré
        if (item && Date.now() - item.timestamp < (ttl || this.defaultTTL)) {
            return item.value as T;
        }

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
        // Vérifier la taille maximale
        if (this.cache.size >= this.maxSize) {
            const oldestKey = Array.from(this.cache.entries())
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
            this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    public delete(key: string): void {
        this.cache.delete(key);
    }

    public clear(): void {
        this.cache.clear();
    }

    // Nettoyage périodique des entrées expirées
    public startCleanupInterval(interval: number = 60000): NodeJS.Timeout {
        return setInterval(() => {
            const now = Date.now();
            for (const [key, item] of this.cache.entries()) {
                if (now - item.timestamp >= this.defaultTTL) {
                    this.cache.delete(key);
                }
            }
        }, interval);
    }
}
