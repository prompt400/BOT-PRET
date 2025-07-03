export const Constants = {
  Colors: {
    Primary: 0x5865F2,
    Success: 0x57F287,
    Warning: 0xFEE75C,
    Error: 0xED4245,
    Info: 0x00AAFF,
  },
  
  Emojis: {
    Success: '✅',
    Error: '❌',
    Warning: '⚠️',
    Info: 'ℹ️',
    Loading: '⏳',
    Lock: '🔒',
  },
  
  Limits: {
    EmbedDescriptionLength: 4096,
    EmbedFieldValueLength: 1024,
    EmbedFieldNameLength: 256,
    EmbedTitleLength: 256,
    ButtonLabelLength: 80,
    SelectMenuOptionLength: 100,
  },
  
  Timeouts: {
    DatabaseConnection: 5000,
    DiscordAPI: 15000,
    CommandCooldown: 3000,
  },
} as const;
