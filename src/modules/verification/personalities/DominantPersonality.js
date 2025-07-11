const BasePersonality = require('./BasePersonality');

class DominantPersonality extends BasePersonality {
    constructor() {
        super();
        this.emojis = ['🔥', '👑', '⛓️', '🖤', '💪', '🗿'];
        this.style = 'autoritaire';
    }
    
    getMessage(type, member, nsfw = false) {
        const username = member?.user?.username || member?.username || 'soumis';
        const isDominant = this.detectDominantUsername(username);
        const isSubmissive = this.detectSubmissiveUsername(username);
        const isCute = this.detectCuteUsername(username);
        const gender = this.detectProbableGender(member);

        // Messages NSFW
        const nsfwMessages = {
            welcome: [
                "Ah, un autre soumis. Prépare-toi pour un monde de contraintes~ 🔥",
                "Nouveau jouet ? Intéressant. Voyons combien de temps tu tiendras... ⛓️",
                "Bienvenue dans mon domaine. Ici, c'est moi qui commande, compris ? 👑",
                "Un autre esclave potentiel... Montres-moi ta valeur. 🖤",
                "Tu entres dans mon territoire. Prépares-toi à obéir ou à souffrir. 🔥",
                "Mmm... Frais et innocent. J'adore briser les nouveaux. 😈",
                "Enfin quelqu'un de nouveau à dresser. Ça faisait longtemps~ ⛓️",
                "Tu oses pénétrer dans mon royaume ? Tu vas apprendre le respect. 👑",
                "Nouveau sujet ? Parfait. J'avais besoin de divertissement. 🔥",
                "Ah... L'odeur de la soumission. Délicieux. 🖤",
                isDominant ? "Un autre dominant ? Nous verrons qui pliera le genou en premier. 🔥" : "Parfait, un soumis naturel. Tu apprendras vite. ⛓️",
                isSubmissive ? "Je sens ta soumission d'ici. Tu seras parfait pour mes jeux. 👑" : "Tu ne sais pas encore que tu es à moi, mais tu l'apprendras. 🔥",
                isCute ? "Aww, si mignon... J'ai hâte de te voir supplier. 😈" : "Cette façade ne durera pas longtemps face à moi. ⛓️",
                gender === 'feminine' ? "Une nouvelle petite chose fragile à briser... Parfait. 👑" : gender === 'masculine' ? "Un nouveau mâle à mettre à genoux. J'adore. 🔥" : "Peu importe qui tu es, tu m'obéiras. ⛓️",
                "Inclines-toi devant ta nouvelle Maîtresse. Maintenant. 👑",
                "Tu crois avoir le choix ? Adorable. Cette illusion disparaitra vite. 🔥",
                "Bienvenue en enfer, chéri. Et je suis ton démon personnel~ 😈",
                "Un nouveau cobaye pour mes expériences... Excitant. ⛓️",
                "Tu sens cette tension ? C'est le pouvoir. Mon pouvoir sur toi. 🖤",
                "Dernier avertissement : ici, tu obéis ou tu souffres. Choisis. 👑"
            ],
            success: [
                "Tu fais bien d'obéir, continue comme ça et je pourrais être clémente... ou pas. 😏",
                "Bon petit esclave. Tu mérites presque une récompense. Presque. 🔥",
                "Voilà qui est mieux. L'obéissance te va si bien~ ⛓️",
                "Tu apprends vite. C'est bien. Continue et je serai... généreuse. 👑",
                "Parfait. C'est exactement comme ça que j'aime mes soumis. 🖤",
                "Mmm... J'adore quand tu obéis si bien. Ça me donne envie de... jouer. 😈",
                "Bravo. Tu commences à comprendre ta place. Sous moi. 🔥",
                "C'est mieux. Mais ne crois pas que cela te sauve de ma colère. ⛓️",
                "Bien. Très bien même. Tu pourrais devenir mon préféré... 👑",
                "Voilà comment j'aime te voir : obéissant et docile. 🖤",
                isSubmissive ? "Tu es né pour ça, n'est-ce pas ? Pour m'obéir... 🔥" : "Tu apprends enfin. Il était temps. ⛓️",
                isDominant ? "Même les dominants plient devant moi. Tu en es la preuve. 👑" : "Voilà un bon petit soumis. Continue ainsi. 🔥",
                "Excellent travail. Tu mérites peut-être une petite... attention. 😈",
                "Je suis presque impressionnée. Presque. Ne relâche pas tes efforts. ⛓️",
                "C'est ainsi que je te veux : obéissant et dévoué. 👑",
                "Tu progresses bien. Bientôt tu seras parfaitement dressé. 🔥",
                "Voilà qui mérite récompense... Mais pas maintenant. Patience. 🖤",
                "Parfaite exécution. Tu deviens un esclave modèle. 😈",
                "C'est bien. Maintenant, voyons si tu peux faire encore mieux... ⛓️",
                "Tu me plais quand tu obéis ainsi. Continue et je serai... indulgente. 👑"
            ],
            error: [
                "C'est intolérable ! Recommence immédiatement, esclave ! ⛓️",
                "INACCEPTABLE ! Tu oses défier mon autorité ?! 🔥",
                "Pathétique. Je devrais te punir pour cette incompétence. 👑",
                "Tu me déçois profondément. La punition sera sévère. 🖤",
                "Comment oses-tu échouer devant moi ?! Reprends-toi ! 🔥",
                "Minable ! Est-ce vraiment le mieux que tu puisses faire ? ⛓️",
                "Tu testes ma patience. C'est dangereux, très dangereux... 😈",
                "Echec lamentable. Tu mérites le fouet pour ça. 👑",
                "Je n'accepte pas l'échec. Recommence ou subis les conséquences. 🔥",
                "Tu veux vraiment voir ma colère ? Continue comme ça... 🖤",
                isSubmissive ? "Même pour un soumis, c'est pathétique. Fais mieux ! ⛓️" : "Tu prétends être fort ? Prouve-le au lieu d'échouer ! 🔥",
                "C'est une insulte à mon intelligence. Corrige ça immédiatement ! 👑",
                "Tu me fais perdre mon temps précieux. Inadmissible ! 😈",
                "Si tu ne peux pas faire mieux, tu ne mérites pas mon attention. 🖤",
                "Lamentable performance. Tu seras puni pour cette médiocrité. ⛓️",
                "Est-ce une blague ? Car je ne ris pas du tout. 🔥",
                "Tu oses me présenter cette... chose ? Recommence ! 👑",
                "Incompétent ! Comment peux-tu être si mauvais ? 😈",
                "C'est tout ? Vraiment ? Ma déception est immense. 🖤",
                "Dernier avertissement avant la punition. Ne me déçois plus ! ⛓️"
            ],
            waiting: [
                "Chaque seconde d'attente te coûtera... cher. 🌶️",
                "Tu me fais attendre ? L'audace... Tu seras puni pour ça. 🔥",
                "Plus tu tardes, plus la punition sera sévère... ⛓️",
                "J'espère que tu as une bonne excuse pour ce retard... 👑",
                "Tic tac... Ma patience a des limites, esclave. 🖤",
                "Tu joues avec le feu en me faisant attendre ainsi... 🔥",
                "Chaque instant perdu augmente ma colère. Prépare-toi. 😈",
                "L'attente me rend... créative pour les punitions. ⛓️",
                "Tu testes ma patience ? Mauvaise idée, très mauvaise idée. 👑",
                "Je compte chaque seconde. Tu me les paieras toutes. 🖤",
                isSubmissive ? "Un soumis ne fait JAMAIS attendre sa Maîtresse ! 🔥" : "Même toi, tu devrais savoir qu'on ne me fait pas attendre. ⛓️",
                "Cette lenteur est-elle intentionnelle ? Tu le regretteras... 😈",
                "J'ai d'autres esclaves plus rapides. Prouve ta valeur ! 👑",
                "Tu gâches mon temps précieux. Impardonnable. 🔥",
                "Dernier avertissement : dépêche-toi ou subis ma fureur. 🖤",
                "L'horloge tourne... contre toi. Hâte-toi ! ⛓️",
                "Tu crois que j'ai toute la journée ? Erreur fatale. 😈",
                "Ma colère monte... Tu ne voudrais pas la voir exploser. 👑",
                "Encore un peu et tu goûteras à ma vraie nature... 🔥",
                "Je perçois ta lenteur comme un affront personnel. Dangereux. 🖤"
            ]
        };

        // Messages SFW 
        const sfwMessages = {
            welcome: [
                "Silence. 👑 Tu es ici pour m'obéir. Compris ? 🔥",
                "Nouveau venu ? Apprends vite : ici, c'est moi qui commande. ⛓️",
                "Bienvenue dans mon royaume. Les règles sont simples : j'ordonne, tu obéis. 👑",
                "Ah, de la chair fraîche. Voyons si tu es digne de mon temps. 🖤",
                "Entre. Mais sache que tu pénètres dans MON domaine. 🔥",
                "Un nouveau sujet ? Intéressant. Montres-moi ta valeur. 🗿",
                "Tu oses entrer ici ? Soit. Mais tu suivras MES règles. ⛓️",
                "Bienvenue. Première leçon : le respect de l'autorité. La mienne. 👑",
                "Nouveau ? Parfait. J'aime former les débutants à ma manière. 🔥",
                "Tu entres dans un monde où je suis la loi. Retiens-le bien. 🖤",
                isDominant ? "Un autre chef ? Nous verrons qui commande vraiment ici. 🔥" : "Parfait, quelqu'un qui sait écouter. Tu iras loin. ⛓️",
                isSubmissive ? "Je sens que tu comprends déjà ta place. Bien. 👑" : "Tu apprendras vite qui est le maître ici. 🔥",
                isCute ? "Mignon. Mais la mignonnerie ne te sauvera pas de mes ordres. 🗿" : "Cette attitude... Il faudra la corriger. ⛓️",
                gender === 'feminine' ? "Une nouvelle recrue. Montres-moi ce que tu vaux. 👑" : gender === 'masculine' ? "Un nouveau soldat ? Tu devras prouver ta valeur. 🔥" : "Peu importe qui tu es, ici tu obéis. ⛓️",
                "Retiens bien : je ne tolère ni l'incompétence ni l'insolence. 👑",
                "Bienvenue sous mon commandement. L'obéissance est ta seule option. 🔥",
                "Tu vas apprendre la discipline. De gré ou de force. 🖤",
                "Premier jour ? Alors écoute bien : mes ordres sont absolus. ⛓️",
                "Entre et prosterne-toi... mentalement. Le respect avant tout. 🗿",
                "Nouvelle recrue ? J'espère que tu es prêt à travailler dur. 👑"
            ],
            success: [
                "Bien. Tu apprends vite. 💪 Continue comme ça et je serai... clémente 👑",
                "Voilà qui est mieux. L'obéissance est récompensée. 🔥",
                "Excellent travail. Tu mérites ma reconnaissance. ⛓️",
                "Parfait. C'est exactement ce que j'attendais de toi. 👑",
                "Tu progresses bien. Continue ainsi et tu iras loin. 🖤",
                "Impressionnant. Tu as su répondre à mes attentes. 🔥",
                "C'est du bon travail. Je suis... satisfaite. 🗿",
                "Voilà comment j'aime voir les choses faites. Efficacement. ⛓️",
                "Bravo. Tu prouves que ma confiance n'était pas mal placée. 👑",
                "Excellent. Tu deviens un élément précieux de mon équipe. 💪",
                isSubmissive ? "Tu excelles dans l'obéissance. Parfait. 🔥" : "Tu apprends à suivre les ordres. C'est bien. ⛓️",
                isDominant ? "Même les leaders doivent savoir obéir. Tu l'as compris. 👑" : "Voilà un bon élément. Continue ainsi. 🔥",
                "Performance remarquable. Tu mérites mes félicitations. 🖤",
                "C'est ainsi que j'aime voir le travail fait. Avec excellence. 🗿",
                "Tu dépasses mes attentes. Intéressant... Très intéressant. ⛓️",
                "Parfaite exécution. Tu es un modèle pour les autres. 👑",
                "Continue comme ça et tu deviendras indispensable. 💪",
                "C'est exactement ce niveau que j'exige. Bien joué. 🔥",
                "Tu prouves ta valeur. Je n'oublie jamais les bons éléments. 🖤",
                "Voilà pourquoi j'ai bien fait de te faire confiance. Excellent. 🗿"
            ],
            error: [
                "INACCEPTABLE ! 🔥 Recommence. Immédiatement. ⛓️",
                "C'est tout ? Pathétique. Je m'attendais à mieux. 👑",
                "Echec lamentable. Reprends-toi immédiatement ! 🖤",
                "Tu me déçois. Corrige cette erreur sur le champ. 🔥",
                "Incompétence flagrante ! Est-ce vraiment ton maximum ? 🗿",
                "Médiocre. Je n'accepte pas la médiocrité. Recommence ! ⛓️",
                "C'est une insulte à mon intelligence. Fais mieux ! 👑",
                "Lamentable. Tu gâches mon temps précieux. 💪",
                "Si c'est ton mieux, nous avons un problème. 🔥",
                "Echec total. Ressaisis-toi avant que je perde patience. 🖤",
                isSubmissive ? "Même pour quelqu'un comme toi, c'est faible. ⛓️" : "Tu prétends être compétent ? Prouve-le ! 🔥",
                "Erreur grossière. Comment as-tu pu échouer ainsi ? 👑",
                "Décevant. Très décevant. J'exige mieux. 🗿",
                "Tu testes ma patience ? Mauvaise stratégie. ⛓️",
                "C'est indigne de mes standards. Corrige ça ! 💪",
                "Nul. Complètement nul. Recommence et fais-le bien. 🔥",
                "Tu me fais honte avec cette performance. Améliore-toi ! 🖤",
                "Est-ce une blague ? Car ce n'est pas drôle du tout. 🗿",
                "Dernier avertissement : fais-le correctement ou pars. ⛓️",
                "Ta nullité me consterne. Dernier essai, ne le gâche pas. 👑"
            ],
            waiting: [
                "Tu oses me faire attendre ?! 👑 Tu seras puni pour ça... 🖤",
                "Chaque seconde perdue est une offense. Dépêche-toi ! 🔥",
                "Ma patience a des limites. Tu les testes dangereusement. ⛓️",
                "L'horloge tourne... et ma colère monte. 👑",
                "Tu joues avec le feu en me faisant attendre. 🗿",
                "Cette lenteur est inacceptable. Accélère ! 💪",
                "Je déteste attendre. Tu le regretteras. 🔥",
                "Tic tac... Mon irritation grandit. 🖤",
                "Tu gâches mon temps. Impardonnable ! 🗿",
                "Plus tu tardes, pire ce sera pour toi. ⛓️",
                isSubmissive ? "Un bon élément ne fait jamais attendre ! 👑" : "Même toi, tu devrais comprendre l'urgence. 🔥",
                "Cette attente est une insulte. Ne la prolonge pas. 💪",
                "J'ai mieux à faire que d'attendre. Presse-toi ! 🖤",
                "Dernier rappel : mon temps est précieux. 🗿",
                "Tu testes ma tolérance ? Elle a ses limites. ⛓️",
                "L'inefficacité me répugne. Sois plus rapide ! 👑",
                "Cette lenteur nuit à ma productivité. Inadmissible. 🔥",
                "Je compte jusqu'à trois. Un... 💪",
                "Ma colère est proportionnelle à ton retard. Médite là-dessus. 🖤",
                "Finissons-en. Ma patience est épuisée. 🗿"
            ]
        };

        const messagePool = nsfw ? nsfwMessages[type] : sfwMessages[type];
        if (!messagePool) return "À genoux. Maintenant. 👑🔥";
        
        return this.adaptMessageToProfile(this.getRandomMessage(messagePool), member);
    }
    
    getEmojis() {
        return this.emojis;
    }
    
    getRandomEmoji() {
        return this.emojis[Math.floor(Math.random() * this.emojis.length)];
    }
}

module.exports = DominantPersonality;
