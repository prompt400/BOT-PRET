import { Collection } from 'discord.js';
import { MetricsData } from '../types/logger.js';

export class MetricsService {
    private commandExecutions: Collection<string, number>;
    private responseTimes: Collection<string, number[]>;
    private errors: Collection<string, number>;
    private activeUsers: Set<string>;
    private readonly metricsInterval: NodeJS.Timeout;

    constructor(interval: number = 60000) {
        this.commandExecutions = new Collection();
        this.responseTimes = new Collection();
        this.errors = new Collection();
        this.activeUsers = new Set();

        // Nettoyage périodique des métriques
        this.metricsInterval = setInterval(() => {
            this.cleanupMetrics();
        }, interval);
    }

    public trackCommandExecution(command: string): void {
        const current = this.commandExecutions.get(command) || 0;
        this.commandExecutions.set(command, current + 1);
    }

    public trackResponseTime(command: string, duration: number): void {
        const times = this.responseTimes.get(command) || [];
        times.push(duration);
        this.responseTimes.set(command, times);
    }

    public trackError(component: string): void {
        const current = this.errors.get(component) || 0;
        this.errors.set(component, current + 1);
    }

    public trackActiveUser(userId: string): void {
        this.activeUsers.add(userId);
    }

    public getMetrics(): MetricsData {
        const totalExecutions = Array.from(this.commandExecutions.values())
            .reduce((sum, count) => sum + count, 0);

        const allResponseTimes = Array.from(this.responseTimes.values())
            .flat();

        const averageResponseTime = allResponseTimes.length > 0
            ? allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length
            : 0;

        const totalErrors = Array.from(this.errors.values())
            .reduce((sum, count) => sum + count, 0);

        return {
            commandExecutions: totalExecutions,
            averageResponseTime,
            errorRate: totalErrors / totalExecutions || 0,
            memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
            activeUsers: this.activeUsers.size
        };
    }

    public getCommandMetrics(command: string): {
        executions: number;
        averageResponseTime: number;
        errorRate: number;
    } {
        const executions = this.commandExecutions.get(command) || 0;
        const times = this.responseTimes.get(command) || [];
        const errors = this.errors.get(command) || 0;

        return {
            executions,
            averageResponseTime: times.length > 0
                ? times.reduce((sum, time) => sum + time, 0) / times.length
                : 0,
            errorRate: errors / executions || 0
        };
    }

    private cleanupMetrics(): void {
        // Garder seulement les dernières 24h de données
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

        this.commandExecutions = new Collection();
        this.responseTimes = new Collection();
        this.errors = new Collection();
        this.activeUsers = new Set();
    }

    public dispose(): void {
        clearInterval(this.metricsInterval);
    }
}
