import { config } from 'dotenv';
import { Client } from 'discord.js';

// Charger les variables d'environnement pour les tests
config();

// Mock des fonctions Discord.js couramment utilisées
jest.mock('discord.js', () => {
    const original = jest.requireActual('discord.js');
    return {
        ...original,
        Client: jest.fn().mockImplementation(() => ({
            login: jest.fn().mockResolvedValue('token'),
            destroy: jest.fn().mockResolvedValue(undefined),
            on: jest.fn(),
            once: jest.fn(),
            users: {
                fetch: jest.fn()
            },
            guilds: {
                fetch: jest.fn()
            }
        })),
        REST: jest.fn().mockImplementation(() => ({
            setToken: jest.fn().mockReturnThis(),
            put: jest.fn().mockResolvedValue(undefined)
        }))
    };
});

// Configuration globale pour les tests
beforeAll(() => {
    // Réinitialiser tous les mocks avant chaque suite de tests
    jest.clearAllMocks();
});

beforeEach(() => {
    // Réinitialiser les timers simulés avant chaque test
    jest.useFakeTimers();
});

afterEach(() => {
    // Restaurer les timers réels après chaque test
    jest.useRealTimers();
    // Nettoyer les mocks
    jest.clearAllMocks();
});

// Helpers globaux pour les tests
global.createMockClient = () => {
    return new Client({ intents: [] });
};

global.createMockInteraction = (options = {}) => {
    return {
        reply: jest.fn().mockResolvedValue(undefined),
        editReply: jest.fn().mockResolvedValue(undefined),
        deferReply: jest.fn().mockResolvedValue(undefined),
        followUp: jest.fn().mockResolvedValue(undefined),
        options: {
            getSubcommand: jest.fn(),
            getString: jest.fn(),
            getInteger: jest.fn(),
            getBoolean: jest.fn(),
            getUser: jest.fn(),
            getChannel: jest.fn(),
            getRole: jest.fn(),
            ...options
        },
        user: {
            id: 'mockUserId',
            tag: 'mockUser#0001'
        },
        guild: {
            id: 'mockGuildId',
            name: 'Mock Guild'
        },
        channel: {
            id: 'mockChannelId',
            name: 'mock-channel'
        },
        ...options
    };
};

// Types globaux pour les tests
declare global {
    function createMockClient(): Client;
    function createMockInteraction(options?: Record<string, any>): any;
}
