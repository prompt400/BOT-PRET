import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import EconomySystem from '../modules/economy/EconomySystem.js';
import { COULEURS } from '../constantes/theme.js';
import Logger from '../services/logger.js';

const logger = new Logger('ConvertCommand');

export default {
    data: new SlashCommandBuilder()
        .setName('convert')
        .setDescription('Convertir entre les différentes monnaies')
        .addIntegerOption(option =>
            option.setName('montant')
                .setDescription('Le montant à convertir')
                .setRequired(true)
                .setMinValue(1)
        ),

    async execute(interaction) {
        try {
            const amount = interaction.options.getInteger('montant');
            
            // Récupérer le solde actuel
            const balance = await EconomySystem.getBalance(interaction.user.id);
            
            if (!balance) {
                await interaction.reply({
                    content: '❌ Tu n\'as pas encore de compte économique. Utilise une commande pour en créer un !',
                    ephemeral: true
                });
                return;
            }

            // Créer le menu de sélection
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('convert_currency')
                .setPlaceholder('Choisis la conversion')
                .addOptions([
                    {
                        label: `💋 ${amount} KissCoins → 🔥 ${Math.floor(amount / 100)} FlameTokens`,
                        description: 'Taux: 100 KC = 1 FT',
                        value: 'kiss_to_flame',
                        emoji: '💋'
                    },
                    {
                        label: `🔥 ${amount} FlameTokens → 💎 ${Math.floor(amount / 100)} GemLust`,
                        description: 'Taux: 100 FT = 1 GL',
                        value: 'flame_to_gem',
                        emoji: '🔥'
                    },
                    {
                        label: `💋 ${amount} KissCoins → 💎 ${Math.floor(amount / 10000)} GemLust`,
                        description: 'Taux: 10000 KC = 1 GL',
                        value: 'kiss_to_gem',
                        emoji: '💋'
                    }
                ]);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            // Créer l'embed initial
            const embed = new EmbedBuilder()
                .setTitle('💱 Conversion de Monnaies')
                .setDescription(`Tu souhaites convertir **${amount.toLocaleString()}** unités.\n\nChoisis le type de conversion ci-dessous :`)
                .setColor(COULEURS.PRIMAIRE)
                .addFields(
                    {
                        name: '💰 Ton solde actuel',
                        value: `💋 ${balance.kissCoins.toLocaleString()} KissCoins\n🔥 ${balance.flameTokens.toLocaleString()} FlameTokens\n💎 ${balance.gemLust.toLocaleString()} GemLust`,
                        inline: true
                    },
                    {
                        name: '📊 Taux de conversion',
                        value: '100 💋 = 1 🔥\n100 🔥 = 1 💎\n10000 💋 = 1 💎',
                        inline: true
                    }
                )
                .setFooter({ text: 'La conversion est immédiate et irréversible !' })
                .setTimestamp();

            const response = await interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: true
            });

            // Attendre la sélection
            const collector = response.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                time: 60000,
                max: 1
            });

            collector.on('collect', async i => {
                const [fromType, toType] = i.values[0].split('_to_');
                
                try {
                    // Mapper les types de monnaies
                    const currencyMap = {
                        'kiss': 'kissCoins',
                        'flame': 'flameTokens',
                        'gem': 'gemLust'
                    };
                    
                    const fromCurrency = currencyMap[fromType];
                    const toCurrency = currencyMap[toType];
                    
                    // Effectuer la conversion
                    const result = await EconomySystem.convertCurrency(
                        interaction.user.id,
                        fromCurrency,
                        toCurrency,
                        amount
                    );
                    
                    // Récupérer le nouveau solde
                    const newBalance = await EconomySystem.getBalance(interaction.user.id);
                    
                    // Créer l'embed de confirmation
                    const successEmbed = new EmbedBuilder()
                        .setTitle('✅ Conversion Réussie !')
                        .setDescription(`Tu as converti **${result.cost.toLocaleString()} ${this.getCurrencyName(fromCurrency)}** en **${result.converted.toLocaleString()} ${this.getCurrencyName(toCurrency)}** !`)
                        .setColor(COULEURS.SUCCES)
                        .addFields(
                            {
                                name: '📊 Détails de la transaction',
                                value: `Montant initial: ${result.cost.toLocaleString()}\nTaux appliqué: 1:${result.rate}\nMontant reçu: ${result.converted.toLocaleString()}`,
                                inline: true
                            },
                            {
                                name: '💰 Nouveau solde',
                                value: `💋 ${newBalance.kissCoins.toLocaleString()} KissCoins\n🔥 ${newBalance.flameTokens.toLocaleString()} FlameTokens\n💎 ${newBalance.gemLust.toLocaleString()} GemLust`,
                                inline: true
                            }
                        )
                        .setTimestamp();
                    
                    await i.update({
                        embeds: [successEmbed],
                        components: []
                    });
                    
                } catch (error) {
                    logger.erreur('Erreur lors de la conversion', error);
                    
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Erreur de conversion')
                        .setDescription(error.message || 'Une erreur s\'est produite lors de la conversion.')
                        .setColor(COULEURS.ERREUR);
                    
                    await i.update({
                        embeds: [errorEmbed],
                        components: []
                    });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({
                        content: '⏰ Temps écoulé. Conversion annulée.',
                        embeds: [],
                        components: []
                    });
                }
            });

        } catch (error) {
            logger.erreur('Erreur dans la commande convert', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Erreur')
                .setDescription('Une erreur s\'est produite lors de l\'exécution de la commande.')
                .setColor(COULEURS.ERREUR);
            
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    getCurrencyName(type) {
        const names = {
            'kissCoins': '💋 KissCoins',
            'flameTokens': '🔥 FlameTokens',
            'gemLust': '💎 GemLust'
        };
        return names[type] || type;
    }
};
