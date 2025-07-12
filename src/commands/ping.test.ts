import { ChatInputCommandInteraction } from 'discord.js';
import pingCommand from './ping.js';

describe('Ping Command', () => {
  let mockInteraction: jest.Mocked<ChatInputCommandInteraction>;

  beforeEach(() => {
    mockInteraction = {
      reply: jest.fn(),
      editReply: jest.fn(),
      createdTimestamp: 1625097600000,
      client: {
        ws: {
          ping: 42
        }
      },
      // Ajout des propriétés manquantes requises par InteractionResponse
      id: '123',
      type: 2,
      channel: null,
      guild: null,
      member: null,
      user: null,
      guildId: null,
      channelId: null,
      applicationId: '456',
      token: 'mock-token',
      version: 1,
      appPermissions: null,
      locale: 'fr',
      guildLocale: null
    } as unknown as jest.Mocked<ChatInputCommandInteraction>;
  });

  it('should respond with ping information', async () => {
    const mockReply = {
      createdTimestamp: 1625097600100,
      id: '789',
      type: 2,
      channel: null,
      guild: null,
      member: null,
      user: null,
      guildId: null,
      channelId: null,
      applicationId: '456',
      token: 'mock-token',
      version: 1,
      appPermissions: null,
      locale: 'fr',
      guildLocale: null,
      interaction: mockInteraction,
      client: mockInteraction.client
    } as any;

    mockInteraction.reply.mockResolvedValueOnce(mockReply);

    await pingCommand.execute(mockInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: '🏓 Calcul...',
      fetchReply: true
    });

    expect(mockInteraction.editReply).toHaveBeenCalledWith(
      expect.stringContaining('🏓 Pong!')
    );
  });
});
