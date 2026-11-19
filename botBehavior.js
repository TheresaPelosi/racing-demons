import { shuffle, flipOrRecycleStock } from './deck.js';
import { state, findValidCenterPile, executeMoveToCenter } from './gameState.js';

let botInterval = null;

export function startBots(difficulty) {
    stopBots();
    const speedMs = difficulty === 'easy' ? 2200 : difficulty === 'medium' ? 1400 : 800;

    botInterval = setInterval(() => {
        if (!state.roundActive) return;
        const botIndices = shuffle(Array.of(1, 2, 3));
        for (const idx of botIndices) {
            if (!state.roundActive) break;
            takeBotTurn(state.players.at(idx));
        }
    }, speedMs * ((Math.random() * 0.25) + 0.82));
}

export function stopBots() {
    clearInterval(botInterval);
    botInterval = null;
}

function takeBotTurn(bot) {
    if (bot.demonPile.length > 0) {
        const demonCard = bot.demonPile.at(-1);
        const pileIdx = findValidCenterPile(demonCard);
        if (pileIdx !== null) {
            executeMoveToCenter(bot, demonCard, 'demon', null, pileIdx);
            return;
        }
    }

    for (let i = 0; i < 4; i++) {
        if (bot.tableau.at(i).length > 0) {
            const tabCard = bot.tableau.at(i).at(-1);
            const pileIdx = findValidCenterPile(tabCard);
            if (pileIdx !== null) {
                executeMoveToCenter(bot, tabCard, 'tableau', i, pileIdx);
                return;
            }
        }
    }

    if (bot.flipped.length > 0) {
        const flippedCard = bot.flipped.at(-1);
        const pileIdx = findValidCenterPile(flippedCard);
        if (pileIdx !== null) {
            executeMoveToCenter(bot, flippedCard, 'flipped', null, pileIdx);
            return;
        }
    }

    flipOrRecycleStock(bot);
}