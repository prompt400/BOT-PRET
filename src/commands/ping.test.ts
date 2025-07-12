import { ChatInputCommandInteraction } from 'discord.js';
import pingCommand from './ping';

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
      }
    } as unknown as jest.Mocked<ChatInputCommandInteraction>;
  });

  it('should respond with ping information', async () => {
    const mockReply = {
      createdTimestamp: 1625097600100
    };

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
