class PersonalityQuizStep {
    constructor() {
        this.name = 'Quiz de Personnalité';
        this.emoji = '🎭';
        this.questions = [
            {
                question: "Quel est votre style de soirée préféré ?",
                answers: ["Douce et relaxante 🌸", "Pimentée et amusante 🔥", "Autoritaire et intense 👑"],
                mapping: ["SoftPersonality", "PlayfulPersonality", "DominantPersonality"]
            },
            {
                question: "Quel emoji vous décrit le mieux ?",
                answers: ["🌸", "😏", "🔥", "👑"],
                mapping: ["SoftPersonality", "PlayfulPersonality", "DominantPersonality"]
            },
            {
                question: "Votre type de musique préféré ?",
                answers: ["Classique et romantique 💕", "Pop et dynamique 😈", "Rock et puissant 🔥"],
                mapping: ["SoftPersonality", "PlayfulPersonality", "DominantPersonality"]
            }
        ];
    }

    async execute(interaction) {
        // Logique d'exécution du quiz
        const randomQuestion = this.questions[Math.floor(Math.random() * this.questions.length)];
        return {
            question: randomQuestion,
            personalityQuiz: true
        };
    }

    evaluateAnswers(answers) {
        let score = { SoftPersonality: 0, PlayfulPersonality: 0, DominantPersonality: 0 };
        answers.forEach(answerIndex => {
            const personality = this.questions[answerIndex.questionIndex].mapping[answerIndex.answerIndex];
            score[personality]++;
        });

        return Object.keys(score).reduce((a, b) => (score[a] > score[b] ? a : b));
    }
}

export default PersonalityQuizStep;
