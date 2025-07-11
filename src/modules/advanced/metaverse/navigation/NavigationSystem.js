/**
 * Système de navigation - Gère le déplacement entre les lieux
 */
class NavigationSystem {
    constructor(locations) {
        this.locations = locations;
        this.currentLocation = 'centralPlace';
    }

    /**
     * Se déplacer vers une nouvelle direction
     * @param {string} direction - La direction choisie (nord, sud, est, ouest)
     * @returns {string} Description de la nouvelle position ou message d'erreur
     */
    move(direction) {
        const currentLocation = this.locations[this.currentLocation];
        const newLocation = currentLocation.move(direction);

        if (newLocation) {
            this.currentLocation = newLocation;
            return this.locations[newLocation].getDescription();
        }

        return "Vous ne pouvez pas aller dans cette direction.";
    }

    /**
     * Obtenir la description du lieu actuel
     * @returns {string} La description du lieu
     */
    getCurrentLocationDescription() {
        return this.locations[this.currentLocation].getDescription();
    }
}

module.exports = NavigationSystem;
