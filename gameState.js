import { createDeck, removeCardFromSlot } from './deck.js';
import Player from './player.js'
import { startBots, stopBots } from './botBehavior.js';
import { animateBotCard, cancelAndReturnDrag, getActiveDrag } from './dragAndDrop.js';
import {
    dom,
    renderAll,
    renderCenterPiles,
    updateScoreboard,
    setRoundStartUI,
    setRoundEndUI,
    setGameOverUI
} from './ui.js';

const TOTAL_ROUNDS = 5;

export const state = {
    currentRound: 0,
    roundActive: false,
    centerPiles: [],
    players: []
};

export function getHumanPlayer() {
    return state.players.find(p => !p.isBot);
}

export function startNewGame() {
    state.currentRound = 0;
    state.players = [
        new Player('player', 'You', false),
        new Player('bot1', 'Derek', true),
        new Player('bot2', 'Kiera', true),
        new Player('bot3', 'Tina', true)
    ];
    updateScoreboard(state.players);
    startNextRound();
}

export function startNextRound() {
    state.currentRound++;
    if (state.currentRound > TOTAL_ROUNDS) {
        endGame();
        return;
    }

    state.roundActive = true;
    state.centerPiles = [];
    setRoundStartUI(state.currentRound, TOTAL_ROUNDS);

    state.players.forEach(p => {
        const deck = createDeck(p.id);
        p.addHand(deck);
    });

    renderAll(state);
    startBots(dom.difficultySelectEl.value);
}

export function findValidCenterPile(card) {
    if (card.value === 1) return -1;
    for (let i = 0; i < state.centerPiles.length; i++) {
        const pile = state.centerPiles.at(i);
        if (pile && !pile.completing && !pile.inFlight && pile.suit === card.suit && pile.topValue === card.value - 1) {
            return i;
        }
    }
    return null;
}

export function executeMoveToCenter(player, card, sourceType, slotIndex, pileIndex) {
    removeCardFromSlot(player, sourceType, slotIndex);
    player.cardsPlayedThisRound++;

    let targetIndex = pileIndex;

    if (pileIndex === -1) {
        // card is an ace. Place in the leftmost available slot
        const holeIndex = state.centerPiles.findIndex(p => p === null);
        const newPile = {
            suit: card.suit,
            topValue: 1,
            cards: [card],
            completing: false,
            inFlight: player.isBot
        };

        if (holeIndex !== -1) {
            state.centerPiles[holeIndex] = newPile;
            targetIndex = holeIndex;
        } else {
            state.centerPiles.push(newPile);
            targetIndex = state.centerPiles.length - 1;
        }
    } else if (state.centerPiles.at(pileIndex)) {
        state.centerPiles.at(pileIndex).cards.push(card);
        state.centerPiles.at(pileIndex).topValue = card.value;
        state.centerPiles.at(pileIndex).inFlight = player.isBot;
    }

    renderAll(state);
    checkRoundEnd(player);

    if (player.isBot) {
        animateBotCard(player.id, card, targetIndex, () => {
            if (state.centerPiles.at(targetIndex)) {
                state.centerPiles.at(targetIndex).inFlight = false;
                renderCenterPiles(state.centerPiles);
            }
            handleKingCompletion(card, targetIndex);
        });
    } else {
        handleKingCompletion(card, targetIndex);
    }
}

function handleKingCompletion(card, activeIndex) {
    if (state.roundActive && card.value === 13 && state.centerPiles.at(activeIndex)) {
        const completedPile = state.centerPiles.at(activeIndex);
        completedPile.completing = true;

        const pileEl = dom.centerAreaEl.querySelector(`.center-pile[data-pile-index="${activeIndex}"]`);
        if (pileEl) {
            pileEl.classList.add('fade-out');
        }

        setTimeout(() => {
            if (state.centerPiles.at(activeIndex) === completedPile) {
                state.centerPiles[activeIndex] = null;
                renderCenterPiles(state.centerPiles);
            }
        }, 400);
    }
}

export function checkRoundEnd(player) {
    if (player.demonPile.length === 0) {
        state.roundActive = false;
        stopBots();

        if (getActiveDrag()) {
            cancelAndReturnDrag();
        }

        state.players.forEach(p => {
            p.score += p.cardsPlayedThisRound;
        });

        updateScoreboard(state.players);
        renderAll(state);

        if (state.currentRound < TOTAL_ROUNDS) {
            setRoundEndUI(player.name, state.currentRound);
        } else {
            endGame();
        }
    }
}

function endGame() {
    state.roundActive = false;
    stopBots();

    const sorted = [...state.players].sort((a, b) => b.score - a.score);
    const winner = sorted.at(0);
    setGameOverUI(winner);
}
