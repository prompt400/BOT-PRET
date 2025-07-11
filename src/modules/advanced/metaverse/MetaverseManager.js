const CentralPlace = require('./locations/CentralPlace');
const PleasureGarden = require('./locations/PleasureGarden');
const EroticCasino = require('./locations/EroticCasino');
const PrivateBeach = require('./locations/PrivateBeach');
const MysteryVilla = require('./locations/MysteryVilla');

/**
 * MetaverseManager gère l'expérience du métaverse
 * Navigation et interaction textuelles sont au cœur du système.
 */
class MetaverseManager {
    constructor() {
        this.locations = {
            centralPlace: new CentralPlace(),
            pleasureGarden: new PleasureGarden(),
            eroticCasino: new EroticCasino(),
            privateBeach: new PrivateBeach(),
            mysteryVilla: new MysteryVilla(),
        };
        this.currentLocation = 'centralPlace';
    }

    /**
     * Explore le métaverse
     * @param {GuildMember} member - Le membre explorant
     * @param {string} locationName - Lieu à visiter
     * @returns {string} Description du lieu
     */
    exploreLocation(member, locationName) {
        if (!this.locations[locationName]) {
            return "Ce lieu n'existe pas dans le métaverse.";
        }
        this.currentLocation = locationName;
        return this.locations[locationName].getDescription();
    }

    /**
     * Gère le déplacement entre les lieux
     * @param {string} direction - Direction de déplacement
     * @returns {string} Nouvelle description du lieu
     */
    move(direction) {
        const newLocation = this.locations[this.currentLocation].move(direction);
        if (newLocation) {
            this.currentLocation = newLocation;
            return this.locations[newLocation].getDescription();
        }
        return "Vous ne pouvez pas aller dans cette direction.";
    }

    /**
     * Achetez une propriété dans le lieu actuel
     * @returns {string} Résultat de l'achat
     */
    buyProperty() {
        return this.locations[this.currentLocation].buyProperty();
    }
}

module.exports = MetaverseManager;
