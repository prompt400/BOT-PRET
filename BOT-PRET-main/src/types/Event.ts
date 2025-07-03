import { ClientEvents } from 'discord.js';
import { BotClient } from '../structures/BotClient.js';

export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (client: BotClient, ...args: ClientEvents[K]) => void | Promise<void>;
}