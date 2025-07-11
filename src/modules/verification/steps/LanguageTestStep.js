import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

class LanguageTestStep {
    constructor() {
        this.name = 'Test de Français';
        this.emoji = '🇫🇷';
        this.requiredCorrectAnswers = 3;
        this.totalQuestions = 5;
        
        // Banque de questions coquines plus étendue
        this.questions = [
            {
                question: "Complète cette phrase coquine : \"Je suis très excité(e) de te...\"",
                answers: ["rencontrer", "voir", "toucher", "découvrir"],
                correct: 2 // "toucher" est la réponse la plus osée
            },
            {
                question: "Quel mot français décrit le mieux une soirée torride ?",
                answers: ["Chaud", "Brûlant", "Enflammé", "Sensuel"],
                correct: 3 // "Sensuel"
            },
            {
                question: "Comment dit-on 'I want you' en français de manière séduisante ?",
                answers: ["Je te veux", "J'ai envie de toi", "Tu me fais envie", "Je te désire"],
                correct: 3 // "Je te désire"
            },
            {
                question: "Complète : \"Cette nuit, je vais te faire...\"",
                answers: ["plaisir", "rire", "danser", "voyager"],
                correct: 0 // "plaisir"
            },
            {
                question: "Quel est le synonyme français le plus coquin de 'embrasser' ?",
                answers: ["Bisou", "Bise", "Baiser", "Caresse"],
                correct: 2 // "Baiser"
            },
            {
                question: "Comment appelle-t-on un rendez-vous galant en français ?",
                answers: ["Un meeting", "Un date", "Un rendez-vous", "Une rencontre"],
                correct: 2 // "Un rendez-vous"
            },
            {
                question: "Complète : \"Tu me rends complètement...\"",
                answers: ["heureux", "fou/folle", "triste", "calme"],
                correct: 1 // "fou/folle"
            },
            {
                question: "Quel mot décrit une personne qui aime la séduction ?",
                answers: ["Timide", "Réservé", "Libertin", "Sérieux"],
                correct: 2 // "Libertin"
            }
        ];
        
        // Poème érotique déclenché par le bouton "Je suis Français"
        this.eroticPoem = `
**Ode à la Passion Française** 🌹

*Dans les rues de Paris, sous la lune argentée,*
*Deux âmes se rencontrent, prêtes à s'enflammer.*
*Le français sur leurs lèvres, doux comme du miel,*
*Promettant des caresses sous un ciel éternel.*

*\"Je te désire\" murmure-t-elle à son oreille,*
*Faisant frissonner son corps jusqu'aux orteils.*
*La langue de Molière devient celle de l'amour,*
*Quand les mots deviennent baisers, tour à tour.*

*Ô douce France, terre de volupté,*
*Où chaque phrase est une invitation à aimer !*

💋 *Félicitations, tu maîtrises la langue de l'amour !*
`;
    }
    
    async execute(interaction, personality, userState) {
        // Initialisation de l'état utilisateur pour cette étape
        if (!userState.languageTest) {
            userState.languageTest = {
                currentQuestion: 0,
                correctAnswers: 0,
                askedQuestions: [],
                answers: []
            };
        }
        
        const state = userState.languageTest;
        
        // Si c'est la première interaction, afficher le bouton "Je suis Français"
        if (state.currentQuestion === 0 && state.correctAnswers === 0) {
            return this.createInitialPrompt();
        }
        
        // Si on a déjà posé toutes les questions
        if (state.currentQuestion >= this.totalQuestions) {
            return this.createCompletionResult(state);
        }
        
        // Sélectionner une nouvelle question non posée
        const availableQuestions = this.questions.filter((_, index) => 
            !state.askedQuestions.includes(index)
        );
        
        if (availableQuestions.length === 0) {
            return this.createCompletionResult(state);
        }
        
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const questionIndex = this.questions.indexOf(availableQuestions[randomIndex]);
        const question = this.questions[questionIndex];
        
        state.askedQuestions.push(questionIndex);
        
        return this.createQuestionEmbed(question, questionIndex, state, personality);
    }
    
    createInitialPrompt() {
        const embed = new EmbedBuilder()
            .setTitle(`${this.emoji} Test de Français - Es-tu vraiment Français(e) ?`)
            .setDescription(
                `Bienvenue mon chou ! 😘\n\n` +
                `Avant de pouvoir accéder à nos salons les plus chauds, ` +
                `tu dois prouver que tu maîtrises la langue de Molière... ` +
                `et surtout celle de l'amour ! 💋\n\n` +
                `**Tu devras répondre correctement à au moins 3 questions sur 5.**\n\n` +
                `Clique sur le bouton ci-dessous pour commencer ! 🔥`
            )
            .setColor(0xFF1493)
            .setFooter({ text: 'Récompense : +10 KissCoins' });
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('language_french_button')
                    .setLabel('🇫🇷 Je suis Français(e) !')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('language_not_french')
                    .setLabel('❌ Je ne suis pas Français(e)')
                    .setStyle(ButtonStyle.Danger)
            );
        
        return {
            embed,
            components: [row],
            type: 'initial'
        };
    }
    
    createQuestionEmbed(question, questionIndex, state, personality) {
        const progressText = `Question ${state.currentQuestion + 1}/${this.totalQuestions} | ` +
                           `✅ ${state.correctAnswers} bonnes réponses`;
        
        const embed = new EmbedBuilder()
            .setTitle(`${this.emoji} ${question.question}`)
            .setDescription(
                `${personality.getMessage('encourage')}\n\n` +
                `Choisis la meilleure réponse ci-dessous :`
            )
            .setColor(0xFF69B4)
            .setFooter({ text: progressText });
        
        const row = new ActionRowBuilder();
        question.answers.forEach((answer, index) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`language_answer_${questionIndex}_${index}`)
                    .setLabel(answer)
                    .setStyle(ButtonStyle.Secondary)
            );
        });
        
        return {
            embed,
            components: [row],
            type: 'question',
            questionIndex,
            state
        };
    }
    
    createCompletionResult(state) {
        const passed = state.correctAnswers >= this.requiredCorrectAnswers;
        
        const embed = new EmbedBuilder()
            .setTitle(passed ? '🎉 Félicitations ! Tu es des nôtres !' : '😔 Dommage...')
            .setDescription(
                passed ? 
                `Bravo mon coquin ! Tu as réussi ${state.correctAnswers}/${this.totalQuestions} questions ! 🔥\n\n` +
                `Tu maîtrises parfaitement la langue française... ` +
                `et surtout celle de la séduction ! 😏\n\n` +
                `**+10 KissCoins** ont été ajoutés à ton compte ! 💋` :
                `Tu n'as eu que ${state.correctAnswers}/${this.totalQuestions} bonnes réponses... 😢\n\n` +
                `Il te faut au moins ${this.requiredCorrectAnswers} bonnes réponses pour continuer.\n\n` +
                `Reviens quand tu maîtriseras mieux le français !`
            )
            .setColor(passed ? 0x00FF00 : 0xFF0000);
        
        return {
            embed,
            components: [],
            type: 'completion',
            passed,
            kissCoinsReward: passed ? 10 : 0
        };
    }
    
    createPoemEmbed() {
        const embed = new EmbedBuilder()
            .setTitle('🌹 Un Français(e) de cœur !')
            .setDescription(this.eroticPoem)
            .setColor(0xFF1493)
            .setThumbnail('https://i.imgur.com/eiffel.png') // Ajouter une image de la Tour Eiffel stylisée
            .setFooter({ text: 'Clique sur "Commencer le test" pour continuer' });
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('language_start_test')
                    .setLabel('📝 Commencer le test')
                    .setStyle(ButtonStyle.Success)
            );
        
        return {
            embed,
            components: [row],
            type: 'poem'
        };
    }
    
    validateAnswer(questionIndex, answerIndex) {
        return this.questions[questionIndex].correct === answerIndex;
    }
    
    processAnswer(userState, questionIndex, answerIndex) {
        const state = userState.languageTest;
        const isCorrect = this.validateAnswer(questionIndex, answerIndex);
        
        if (isCorrect) {
            state.correctAnswers++;
        }
        
        state.answers.push({
            questionIndex,
            answerIndex,
            correct: isCorrect
        });
        
        state.currentQuestion++;
        
        return isCorrect;
    }
}

export default LanguageTestStep;
