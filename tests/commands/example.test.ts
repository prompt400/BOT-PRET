import { createMockInteraction } from '../setup';
import { BaseCommand } from '../../src/structures/BaseCommand';
import { CommandContext } from '../../src/types/commands';

describe('Command: Example', () => {
    let command: BaseCommand;

    beforeEach(() => {
        command = new (class extends BaseCommand {
            protected setup(): void {
                this.setName('example').setDescription('A test command');
            }
            protected async executeCommand(_: CommandContext): Promise<void> {}
        })();
    });

    it('should have correct name and description', () => {
        expect(command.data.name).toBe('example');
        expect(command.data.description).toBe('A test command');
    });

    it('should execute without errors', async () => {
        const interaction = createMockInteraction();

        await expect(command.execute(interaction)).resolves.not.toThrow();
    });
});

