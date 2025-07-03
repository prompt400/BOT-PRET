export interface Ticket {
  id: number;
  user_id: string;
  channel_id: string;
  guild_id: string;
  opened_at: Date;
  closed_at?: Date;
  closed_by?: string;
  active: boolean;
  reason?: string;
}

export interface User {
  id: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}

export interface Guild {
  id: string;
  name: string;
  joined_at: Date;
  settings: GuildSettings;
}

export interface GuildSettings {
  prefix?: string;
  ticketCategoryId?: string;
  supportRoleId?: string;
  logChannelId?: string;
  automodEnabled: boolean;
}