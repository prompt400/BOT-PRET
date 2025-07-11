// Gestionnaire des salons Discord
import { CHANNEL_CONFIGS } from './channelConfigs.js';

class ChannelManager {
    constructor(client) {
        this.client = client;
    }

    async createChannels(guild) {
        for (const categoryKey in CHANNEL_CONFIGS) {
            const category = CHANNEL_CONFIGS[categoryKey];
            const categoryChannel = await this._createCategoryIfNeeded(guild, category.name);

            for (const chanConfig of category.channels) {
                await this._createChannelIfNeeded(guild, categoryChannel, chanConfig);
            }
        }
    }

    async _createCategoryIfNeeded(guild, categoryName) {
        let category = guild.channels.cache.find(c => c.name === categoryName && c.type === 'category');

        if (!category) {
            category = await guild.channels.create(categoryName, {
                type: 'category'
            });
            console.log(`✅ Catégorie créée : ${categoryName}`);
        } else {
            console.log(`🟢 Catégorie existante : ${categoryName}`);
        }

        return category;
    }

    async _createChannelIfNeeded(guild, category, chanConfig) {
        const { name, type, topic, nsfw, permissions, features } = chanConfig;
        let channel = guild.channels.cache.find(c => c.name === name && c.parentId === category.id);

        if (!channel) {
            channel = await guild.channels.create(name, {
                type,
                topic,
                nsfw,
                parent: category,
                permissionOverwrites: this._generatePermissions(guild, permissions)
            });
            console.log(`✅ Salon créé : ${name}`);
        } else {
            console.log(`🟢 Salon existant : ${name}`);
        }

        // Attach features if any
        if (features) {
            for (const featureName of features) {
                this._attachFeature(channel, featureName);
            }
        }

        return channel;
    }

    _generatePermissions(guild, permConfig) {
        const permissions = [];
        const roles = guild.roles.cache;

        if (permConfig.everyone) {
            const everyoneRole = roles.find(r => r.name === '@everyone');
            permissions.push({ id: everyoneRole.id, allow: [], deny: [] });
        }

        for (const roleName in permConfig) {
            const config = permConfig[roleName];
            const role = roles.find(r => r.name.toLowerCase() === roleName.toLowerCase());

            if (role) {
                const allow = [];
                const deny = [];

                if (config.view) allow.push('VIEW_CHANNEL'); else deny.push('VIEW_CHANNEL');
                if (config.send) allow.push('SEND_MESSAGES'); else deny.push('SEND_MESSAGES');
                if (config.manage) allow.push('MANAGE_CHANNELS');

                permissions.push({ id: role.id, allow, deny });
            }
        }

        return permissions;
    }

    _attachFeature(channel, featureName) {
        console.log(`🎮 Attaching feature: ${featureName} to ${channel.name}`);
        // Placeholder for feature attachment logic
    }
}

export default ChannelManager;
