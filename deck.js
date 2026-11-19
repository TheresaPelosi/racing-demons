import {startPointerDrag} from "./dragAndDrop.js";

const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'];
const RANKS = [
    { name: 'ace', value: 1 },
    { name: '2', value: 2 },
    { name: '3', value: 3 },
    { name: '4', value: 4 },
    { name: '5', value: 5 },
    { name: '6', value: 6 },
    { name: '7', value: 7 },
    { name: '8', value: 8 },
    { name: '9', value: 9 },
    { name: '10', value: 10 },
    { name: 'jack', value: 11 },
    { name: 'queen', value: 12 },
    { name: 'king', value: 13 }
];

export function createDeck(ownerId) {
    const deck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push(new Card(
                `${ownerId}-${rank.name}-${suit}`,
                ownerId,
                suit,
                rank.name,
                rank.value,
                `/images/${rank.name}_of_${suit}.png`
            ));
        }
    }
    return shuffle(deck);
}

// fisher-yates algorithm
export function  shuffle(array) {
    let currentIndex = array.length;

    while (currentIndex !== 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

export function flipOrRecycleStock(player) {
    if (player.stock.length > 0) {
        const flipCount = Math.min(3, player.stock.length);
        for (let i = 0; i < flipCount; i++) {
            player.flipped.push(player.stock.pop());
        }
    } else if (player.flipped.length > 0) {
        const recycled = [...player.flipped];
        const topCard = recycled.pop();
        recycled.unshift(topCard);
        player.stock = recycled.reverse();
        player.flipped = [];
    }
}

export function removeCardFromZone(player, sourceType, slotIndex) {
    if (sourceType === 'demon') {
        player.demonPile.pop();
    } else if (sourceType === 'tableau') {
        player.tableau.at(slotIndex).pop();
        if (player.tableau.at(slotIndex).length === 0 && player.demonPile.length > 0) {
            player.tableau.at(slotIndex).push(player.demonPile.pop());
        }
    } else if (sourceType === 'flipped') {
        player.flipped.pop();
    }
}

export class Card {
    constructor(id, ownerId, suit, rankName, value, image) {
        this.id = id;
        this.ownerId = ownerId;
        this.suit = suit;
        this.rankName = rankName;
        this.value = value;
        this.image = image;
    }

    createCardElement(sourceType, slotIndex) {
        const cardEl = document.createElement('img');
        cardEl.src = this.image;
        cardEl.alt = `${this.rankName} of ${this.suit}`;
        cardEl.className = 'card';
        cardEl.draggable = false;
        cardEl.addEventListener('pointerdown', (e) => startPointerDrag(e, cardEl, this, sourceType, slotIndex));
        return cardEl;
    }
}