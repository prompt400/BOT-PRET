import { createCanvas } from 'canvas';

class CaptchaGenerator {
    constructor() {
        this.themes = {
            soft: {
                emojis: ['🌸', '💕', '🌹', '💖'],
                colors: ['#FFB6C1', '#FFC0CB', '#FF69B4'],
                fonts: ['Arial', 'Comic Sans MS']
            },
            playful: {
                emojis: ['😏', '🔥', '😈', '💋'],
                colors: ['#FF4500', '#DC143C', '#FF6347'],
                fonts: ['Impact', 'Arial Black']
            },
            dominant: {
                emojis: ['👑', '⛓️', '🔥', '🖤'],
                colors: ['#8B0000', '#000000', '#4B0082'],
                fonts: ['Georgia', 'Times New Roman']
            }
        };
    }
    
    async generateEroticCaptcha(personality = 'playful') {
        const theme = this.themes[personality] || this.themes.playful;
        
        // Génération du code captcha
        const code = this.generateCode();
        
        // Canvas pour l'image
        const width = 300;
        const height = 100;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Fond dégradé sensuel
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, theme.colors[0]);
        gradient.addColorStop(1, theme.colors[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Ajout d'emojis décoratifs
        ctx.font = '20px Arial';
        theme.emojis.forEach((emoji, i) => {
            ctx.fillText(emoji, Math.random() * width, Math.random() * height);
        });
        
        // Texte du captcha avec style
        ctx.font = `bold 40px ${theme.fonts[0]}`;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = theme.colors[2];
        ctx.lineWidth = 3;
        
        // Effet de distorsion sensuelle
        const chars = code.split('');
        chars.forEach((char, i) => {
            const x = 50 + (i * 40);
            const y = 60 + Math.sin(i) * 10;
            const rotation = (Math.random() - 0.5) * 0.3;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.strokeText(char, 0, 0);
            ctx.fillText(char, 0, 0);
            ctx.restore();
        });
        
        return {
            image: canvas.toBuffer(),
            code: code
        };
    }
    
    generateCode(length = 6) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }
    
    validateCaptcha(userInput, expectedCode) {
        return userInput.toUpperCase() === expectedCode.toUpperCase();
    }
}

export default CaptchaGenerator;
