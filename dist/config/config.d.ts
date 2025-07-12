import 'dotenv/config';
interface Config {
    bot: {
        token: string;
        clientId: string;
        prefix: string;
        version: string;
    };
    logging: {
        level: string;
        directory: string;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
    database: {
        uri: string;
        options: {
            useNewUrlParser: boolean;
            useUnifiedTopology: boolean;
        };
    };
    intents: string[];
    cooldowns: {
        default: number;
        commands: Record<string, number>;
    };
}
declare const config: Config;
export default config;
