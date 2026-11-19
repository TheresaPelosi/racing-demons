export default class Player {
    constructor(id, name, isBot) {
        this.id = id;
        this.name = name;
        this.isBot = isBot;
        this.score = 0;
        this.demonPile = []
        this.tableau = []
        this.stock = []
        this.flipped = []
        this.cardsPlayedThisRound = 0;
    }

    addHand(deck) {
        this.demonPile = deck.splice(0, 13);
        this.tableau = [
            deck.splice(0, 1),
            deck.splice(0, 1),
            deck.splice(0, 1),
            deck.splice(0, 1)
        ];
        this.stock = deck;
        this.flipped = [];
        this.cardsPlayedThisRound = 0;
    }
}