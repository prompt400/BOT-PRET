const BasePersonality = require('./BasePersonality');

class PlayfulPersonality extends BasePersonality {
    constructor() {
        super();
        this.emojis = ['😏', '🔥', '😈', '💋', '🍑', '🌶️'];
        this.style = 'taquine';
    }
    
    getMessage(type, member, nsfw = false) {
        const username = member?.user?.username || member?.username || 'petit coquin';
        const isCute = this.detectCuteUsername(username);
        const gender = this.detectProbableGender(member);
            
        const nsfwMessages = {
            welcome: [
                "Oh, je sens que toi et moi, on va beaucoup s'amuser~ 🔥",
                "Toi et moi, ça va être chaud... dans tous les sens du terme. 😉",
                "Bienvenue ! Je suis toujours prête à m'amuser un peu. 😏",
                "Oh, un petit nouveau ? J'aime ça. 😈",
                "Prêt à jouer avec le feu ? Car je suis brûlante... 🔥",
                "Ah, quelle jolie surprise... 😊 On va bien s'entendre, je le sens ! 🌶️",
                "Attends, c'est un rêve, c'est ça ? 😍 Un tel délice à nu, j'adoooore~ 🔥",
                "Un(e) nouveau/nouvelle partenaire de jeu ? J'ai hâte. 😋",
                "Tu viens de rejoindre la meilleure équipe. J'espère que tu es prêt(e) ! 😏",
                "Je sens que ça va être drôle... ou osé, qui sait ? 😜",
                isCute ? "Oh, mais tu es trop mignon(ne) ! Allez, montre-moi ce que tu sais faire. 😁❤️" : "Tu sembles fun... Montrons-leur comment on s'amuse ! 🎉",
                gender === 'feminine' ? "Une nouvelle copine ? Génial ! 😍 J'ai tant de choses à te montrer... 💋" : gender === 'masculine' ? "Hey beau gosse ! Prêt à être surpris ? 😏" : "Hey toi ! Peu importe d'où tu viens, ici, l'important c'est de s'éclater ! 🎈",
                "Je peux déjà voir que toi et moi, on va bien se marrer. 😊",
                "N'aie pas peur, je ne mords pas... enfin, pas trop fort. 😜",
                "Ce soir, c'est soirée fun ! 🎉 Et tu es l'invité(e) d'honneur ! 🥳",
                "Soyons fous et imprévisibles, c'est comme ça que je m'entends le mieux avec les autres. 😈",
                "Amical ou malicieux ? Hmmm... pourquoi pas les deux ! 😉",
            ],
            success: [
                "Tu es si doué... continue comme ça, et je pourrais vraiment devenir *amusante* 😏",
                "Je sais que tu es bon(ne), mais fais attention, je pourrais devenir accro. 😇",
                "Oh là là... je suis impressionnée. 👀",
                "Pas mal du tout ! Qui aurait cru que tu serais aussi doué(e) ? 😌",
                "Haha, tu me donnes envie de garder ça pour moi ! 🔥",
                "Tu as définitivement quelque chose de spécial. 😍",
                "Mmm, je dois m'assurer de te garder parmi nous... pour toujours. 😈",
                "Tu es un petit génie ! 🧠 Et en plus, tu me fais rire ! 😆",
                "T'es une machine à réussite ou quoi ?! 💪 Je ne me lasse jamais de te voir faire ! 🙌",
                isCute ? "Oh, mon petit chouchou... Tu assures ! ❤️🥰" : "Encore une victoire, encore un moment fun en perspective. 🎉",
                gender === 'feminine' ? "Je savais que tu allais gérer, entre nous les filles, c'est toujours le cas. 💁" : gender === 'masculine' ? "Bien joué, beau gosse. Tu continues de m'épater, toi ! 💪" : "Encore une fois, t'as prouvé que le fun n'a pas de limites avec toi ! 😊",
                "Y a-t-il quelque chose que tu ne sais pas faire ? 😏",
                "Aussi brillant(e) qu'un(e) étoile... J'adore ça. ⭐",
                "Je suis fan de toi, et crois-moi, peu peuvent m'impressionner. 😎",
                "Je savais que tu pouvais le faire, jamais douté d'une étoile comme toi. 😉",
                "Hey, je pourrais m'habituer à te voir réussir, mais ne deviens pas trop parfait(e) ou tu feras de l'ombre à tout le monde ! 😂",
                "Du fun, des rires, et toi au sommet : c'est comme ça que j'aime mes journées. 😄",
            ],
            error: [
                "Oups ! Tu devras faire un peu mieux que ça pour me convaincre 🌶️",
                "Oh oh... Ça a foiré, mais enlève cet air contrit(e), on va s'en sortir. 😅",
                "J'adore quand tu essaies, même si ça ne marche pas toujours. C'est vraiment mignon ! 😊",
                "On est de nouveau ensemble pour une autre tentative, dis-moi qu'on ne s'ennuie pas ! 😋",
                "Haha, ce n'était pas le bon moment, mais je suis prête pour un autre tour ! 💪",
                "Pas de panique, on apprend en apprenant. 🚀",
                "Ce n'est pas grave, j'aime toujours faire des erreurs, ça rend les choses intéressantes. 🤔"
            ],
            waiting: [
                "Tu me fais languir, coquin ! 🌶️ Peut-être qu'un peu de patience portera ses fruits... 🍑",
                "Prends ton temps... mais pas trop. Je pourrais m'endormir sinon ! 😴",
                "Oh là là, tu es lent(e) comme l'escargot plus paresseux du monde... 🤭",
                "Je pourrais m'ennuyer et me mettre à jouer toute seule ! 😜",
                "Avec toi, j'apprends à aimer la patience, mais ne sois pas trop lent non plus, d'accord ? ❤️🕒",
                "Si tu veux me faire languir, c'est réussi, je suis impatiente là ! 😈",
                "Chaque seconde me rapproche de la tentation de tout faire moi-même. Mais ne me tente pas trop. ☺️"
            ]
        };

        const sfwMessages = {
            welcome: [
                "Oh oh... Qui voilà ? 😏 Un nouveau jouet pour moi ? 🔥",
                "Salut, charmant(e) inconnu(e). Prêt(e) à vivre des aventures inoubliables ? 😘",
                "Je savais que j'avais ressenti quelque chose de spécial aujourd'hui... c'était pour l'arrivée de quelqu'un comme toi ! 😄",
                "Une nouvelle tête ! Et une qui promet d'être drôle en plus. C'est parfait. 😏",
                "Hey, bienvenue ! Je suis l'âme de la fête, mais tu peux être mon bras droit ! 😈",
                "Wouah, salut toi ! Ici, on s'amuse tous les jours, hâte que tu te joignes à nous ! 🤗",
                "Je vois une nouvelle recrue pleine de potentiel là, prêt(e) à me le prouver ? 🌟",
                "On aime rire et s'amuser ici, et on dirait que tu es au bon endroit ! 😊",
                "C'est vrai que la première impression compte... Eh bien, laissez-moi vous dire, tu viens de marquer des points ! 😉",
                "Enthousiasme, charisme et amusement : trois mots importants ici. Bienvenue à bord ! 🎈"
            ],
            success: [
                "Mmm... Tu te débrouilles bien coquin 😈 J'aime ça 💋",
                "Génial ! Je crois que nous formons une équipe de choc ! 💪✨",
                "Ce n'est pas chaque jour que je rencontre quelqu'un d'aussi performant. Tu m'impressionnes ! 😎",
                "J'adore te voir briller. Continue comme ça, superstar ! 🌟",
                "Tu as fait un travail remarquable, continue sur cette lancée ! 👍",
                "Une réussite éclatante, bien joué ! Il faut que j'appelle les autres pour venir voir ça. 🎉",
                "Oh, tu m'as pris par surprise ! C'est génial ce que tu viens de faire. 😊",
                "Je dois dire que tu sais comment relever un défi, je suis émue là. 🥳",
                "Quantité égale entre fun et travail bien fait, c'est tout ce que je demande ! 😄 Continue comme ça."
            ],
            error: [
                "Raté ! 😏 Tu vas devoir faire mieux pour m'impressionner 🔥",
                "Ah, c'est dommage. Ne t'inquiète pas, je suis là pour t'aider à essayer encore ! 💕",
                "Un faux pas, ce n'est rien ! Tout le monde en fait. Et c'est même fun parfois... 😜",
                "Une erreur ici, c'est juste une nouvelle chance d'apprendre, donc prenons cette occasion ! 😌",
                "Ça aurait pu être mieux, mais j'ai confiance que tu vas rapidement rebondir. 💪",
                "L'erreur est humaine, ne baissons pas les bras pour autant ! 😇",
                "Regarde à quel point tu t'améliores, même les erreurs font partie du voyage. 😉"
            ],
            waiting: [
                "Tu me fais attendre exprès ? 😈 J'adore quand tu joues avec mes nerfs 🌶️",
                "On dira que j'apprends la patience grâce à toi... même si elle est rare. 🤔",
                "Oh là là, qu'est-ce qui te retient ainsi ? Je pourrais finir par t'aider si ça continue ! 😅",
                "Attention, je pourrais finir par perdre patience et te chiper ta tâche ! 😆",
                "Hey, dis-moi que tu ne fais pas exprès de me faire attendre pour te faire désirer ? 🌶️",
                "Laisse-moi deviner... quelque chose de brillant t'a distrait, non ? 😂",
                "Je parie que tu préfères me faire languir que de finir ce que tu fais ! Bon... je peux attendre un peu, mais j'ai hâte. 💃"
            ]
        };

        const messagePool = nsfw ? nsfwMessages[type] : sfwMessages[type];
        if (!messagePool) return "Viens jouer avec moi 😏🔥";
            
        return this.adaptMessageToProfile(this.getRandomMessage(messagePool), member);
    }
    
    getEmojis() {
        return this.emojis;
    }
    
    getRandomEmoji() {
        return this.emojis[Math.floor(Math.random() * this.emojis.length)];
    }
}

module.exports = PlayfulPersonality;
