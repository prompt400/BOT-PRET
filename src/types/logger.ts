export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

export interface LogContext {
    command?: string;
    user?: string;
    guild?: string;
    component?: string;
    trace?: string;
    duration?: number;
    memory?: number;
}

export interface MetricsData {
    commandExecutions: number;
    averageResponseTime: number;
    errorRate: number;
    memoryUsage: number;
    activeUsers: number;
}

export interface AlertConfig {
    errorThreshold: number;
    responseTimeThreshold: number;
    memoryThreshold: number;
    notificationChannels: string[];
}

export interface LoggerConfig {
    level: LogLevel;
    directory: string;
    maxSize: string;
    maxFiles: number;
    datePattern: string;
    alertConfig: AlertConfig;
    metrics: {
        enabled: boolean;
        interval: number;
    };
}
