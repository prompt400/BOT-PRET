const BasePersonality = require('./BasePersonality');

class SoftPersonality extends BasePersonality {
    constructor() {
        super();
        this.emojis = ['🌸', '💕', '🌹', '💖', '🌷', '💝'];
        this.style = 'douce';
    }
    
    getMessage(type, member, nsfw = false) {
        const username = member?.user?.username || member?.username || 'cher(e)';
        const gender = this.detectProbableGender(member);
        
        const nsfwMessages = {
            welcome: [
                "Bienvenue cher ❤️ Ici, tout est plus doux, même les plaisirs secrets 🌸",
                "Ah, un nouvel invité au paradis de la douceur... Entre. 💖",
                "Ici, on favorise la tendresse et les doux plaisirs... Bienvenue, trésor. 🌷",
                "Tu es enfin là, j'espère que tu es prêt(e) à être choyé(e) comme jamais. 💝",
                "Quel honneur de t'avoir ici... Je sens que cette rencontre sera magique. 🌸",
                "Viens, laisse-moi te montrer un monde où la douceur règne. 💖",
                "Ton arrivée illumine mon cœur. Bienvenue dans notre havre de paix. 🌹",
                "Je t'attendais, mon doux rêveur. Bienvenue. 🌷",
                "Dans cet endroit, l'amour fait loi. Et toi, tu fais partie du rêve... Bienvenue~ 💕",
                "Prêt(e) pour une étreinte de douceur ? C'est mon plaisir de t'accueillir ici... 💖");",
                gender === 'feminine' ? "Une douce présence féminine... Ravie de t'accueillir. 🌸" : gender === 'masculine' ? "Un gentleman ici ? Je suis enchantée, monsieur. 💝" : "Ô enchantement... Ton arrivée promet. Fais comme chez toi ! 🌷",
                "Bienvenue au paradis des câlins veloutés et de la tendresse infinie. 🕊️",
                "Je sens une aubaine de douceur avec ta venue, reposons-nous... ensemble. 🌺",
                "Ta présence adoucit mon monde. Nos aventures commencent ici, ensemble. 🌟",
                "Bonsoir à toi, ange de douceur. Que puis-je faire pour toi aujourd'hui ? 💌",
                "Ici, la tendresse est une langue que nous parlons couramment. Bienvenue. 🌻",
                "Un nouveau sourire parmi nous... Je sens que tu vas embellir nos journées. 💓",
                "Ravi(e) de te rencontrer! Laisse-moi agrémenter ta journée d'une étincelle de douceur. 💖",
                "Que tu apportes avec toi une touche de sérénité... Bienvenue chez toi. 🌸"
            ],
            success: [
                "Oh là là, douce réussite 💝 Continue comme ça et nous pourrions créer de la *magie* ensemble 🌷",
                "Bravo, tu as embellit ma journée avec cette réussite magnifique... Continue ainsi ! 💖",
                "Chaque succès fluidifie les rouages de notre douce relation... Bravo, mon cher. 🌸",
                "Ton succès brille comme l'éclat d'un diamant, illuminant nos cœurs... Félicitations ! 🌹",
                "Ah, la douce aura de ton succès m'entoure... Encore une réussite méritée. 💕",
                "Mon cœur chante pour toi... Ta réussite est teintée de douceur infinie. 🌺",
                "Un grand merci pour cette réussite inspirante... Tu es impressionnant(e) ! 💖",
                "Dans la douceur du moment, je savoure ton succès éclatant. Félicitations. 🌸",
                "Continue ainsi, car tu fais naître la joie et l'amour autour de toi. 🌺",
                "Bravo ! C'est un pur plaisir d'être témoin de tes succès en or... 🌻",
                gender === 'feminine' ? "Magnifique réussite, belle dame. Vous êtes formidable. 💃" : gender === 'masculine' ? "Bravo, monsieur, votre succès est éclatant ! 🎩" : "Félicitations à toi, architecte de succès ! Aujourd'hui, tu brilles... 😊",
                "Excellence et douceur vont si bien ensemble... Bravo pour ta réussite. 💝",
                "Résultat splendide, digne de tous les éloges... Je suis fière de toi. 😉",
                "Ton succès colore la journée de nuances apaisantes... Splendide, vraiment. 🌷",
                "Entends-tu la mélodie du succès ? Elle accompagne tes efforts brillants. 🌸",
                "Ton succès éclaire mon monde doux de satisfaction sans fin. Bien joué ! 💖",
                "Oh mon dieu, c'est magnifique ! Belle réussite, continue de briller... 🌹",
                "Il n'y a rien que je puisse dire sauf 'superbe travail' à toi. 🌺",
                "Félicitations, animateur de succès... aujourd'hui est une belle journée. 💍",
                "Quel flair pour le succès ! Tu es inspirant et doué(e) d'une belle énergie. 🌻"
            ],
            error: [
                "Pas grave, réessayer est aussi doux que réussir 🌸 Ensemble, tout devient possible 💖",
                "Oh non, mais tu as fait de ton mieux et je suis là pour t'encourager ! 🌷",
                "L'échec n'est qu'une marche vers le succès. Continuons à avancer ensemble. 🌿",
                "Chaque erreur est une leçon bienveillante. Laissons-nous guider par l'expérience. 💌",
                "Ah, un petit contretemps... Mais rien qui ne change ma douce affection pour toi. 💗",
                "Une demi-victoire est toujours une victoire, surtout quand on persévère ! 🌺",
                "Ne t'inquiète pas, car chaque pas en avant est un apprentissage précieux. 🌼",
                "Cette déception est comme une note douce-amère dans notre symphonie... Continuons de jouer. 🎻"
            ],
            waiting: [
                "Je t'attends, mon cher... 🌸 Chaque moment passé à attendre te rend juste plus désirable 🌷",
                "Même dans l'attente, ta présence apaise mon âme... Reste patient. 🌺",
                "Attendre ton retour est une douce mélodie à laquelle je m'accroche... 💘",
                "Dans la quiétude de l'attente, ton souvenir réchauffe mon cœur... Viens vite. 🌿",
                "Chaque seconde d'attente n'est que douceur et le soupir de ton retour est ma récompense... 💝",
                "L'attente fait partie du ballet de la vie. Je suis prête lorsque tu seras là. 💃",
                "Oh, j'ai si hâte de te retrouver... En attendant, ton souvenir illumine mes pensées. 🌸",
                "Cette petite absence rendra nos retrouvailles encore plus douces et précieuses. 💖"
            ]
        };
        
        const sfwMessages = {
            welcome: [
                "Bienvenue mon chou 🌸 Je suis ravie de te rencontrer 💕",
                "Quel bonheur de te voir ! Laisse-moi t'accueillir avec un grand sourire. 😊",
                "Ah, un nouvel ange parmi nous... Que la douceur t'accompagne. 💖",
                "Je suis enthousiaste de t'accueillir ici, cher(e) ami(e). Bienvenue chez toi. 🌺",
                "Bienvenue dans ce lieu de réconfort et de tendresse, mon cher. 🕊️",
                "Ta venue égaye mon cœur et je suis impatiente d'apprendre à te connaître. 💕",
                "Je suis honorée de t'avoir ici. Laisse-moi te chérir comme nul autre. 🌷",
                "Que ce jour marque le début d'une douce aventure ensemble... Bienvenue ! 💫",
                "J'ai attendu cette rencontre, l'espoir d'une amitié sincère... Ravie de te rencontrer ! 🌸",
                "Entre dans notre havre de paix, je suis là pour t'accueillir chaleureusement. 😊"
            ],
            success: [
                "C'est parfait mon cœur 💖 Tu as très bien réussi 🌹",
                "Bravissimo ! Ton succès résonne comme une douce symphonie dans mon cœur. 🌺",
                "Fort(e) et brillant(e), c'est ainsi que je te vois. Quel beau travail ! 💪",
                "Chaque réalisation est un tremplin vers d'autres succès encore plus doux... 🌸",
                "Au sommet du succès, je suis là pour te féliciter. Éblouissant ! ⭐",
                "Une prestation incroyable aujourd'hui ! Quel plaisir d'assister à cela... 😊",
                "Bien joué, tu as relevé le défi avec grâce et simplicité. J'adore ! 💖",
                "Ton succès et ta détermination m'inspirent chaque jour... Bravo ! 🌹",
                "Magnifique performance, je savais que tu en étais capable ! Je suis comblée. 🌼"
            ],
            error: [
                "Oh non mon chéri 🌷 Il y a un petit souci... Réessayons ensemble 💕",
                "Il n'y a pas de honte à trébucher. Je crois en toi, essayons encore. 👣",
                "C'est un pas en arrière, mais c'est l'occasion de prendre de l'élan... Courage ! 💪",
                "C'est apprivoisé avec sagesse que l'on surmonte les obstacles, ensemble. 🕊️",
                "Ne crains pas l'échec ; même dans l'adversité, nous triomphons par la douceur. 🌺",
                "Carlons-nous contre l'adversité avec un cœur ouvert et une âme résiliente ✨",
                "Il n'y a pas de véritable échec, seulement des leçons pour demain... 😊"
            ],
            waiting: [
                "Je t'attends avec impatience mon ange 🌸💝",
                "Ton absence me fait languir, mais je suis heureuse de t'espérer avec bienveillance. 💖",
                "Dans l'attente, mon cœur souffle un amour doux et pur, hâte que tu reviennes. 🌹",
                "Ta patience est un cadeau silencieux qui embellit chaque moment d'attente... 🌺",
                "Mon doux, chaque instant passé à t'attendre attise l'ardeur de nos retrouvailles. 💓",
                "La distance éphémère est la complice d'un accueil tendre, prêts pour un retour radieux. 🕊️",
                "Viens, cher ange, l'attente est une tendre danse que je suis prête à accueillir. 💃"   
            ]
        };
        
        const messagePool = nsfw ? nsfwMessages[type] : sfwMessages[type];
        if (!messagePool) return "Je suis là pour toi 💕";
        
        return this.adaptMessageToProfile(this.getRandomMessage(messagePool), member);
    }
    
    getEmojis() {
        return this.emojis;
    }
    
    getRandomEmoji() {
        return this.emojis[Math.floor(Math.random() * this.emojis.length)];
    }
}

module.exports = SoftPersonality;
