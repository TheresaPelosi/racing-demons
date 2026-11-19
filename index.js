import { flipOrRecycleStock } from './deck.js';
import { state, getHumanPlayer, startNewGame, startNextRound } from './gameState.js';
import { dom, renderPlayerBoard } from './ui.js';

dom.startBtn.addEventListener('click', startNewGame);

dom.readyBtn.addEventListener('click', () => {
    dom.readyBtn.style.display = 'none';
    startNextRound();
});

dom.stockSlotEl.addEventListener('click', () => {
    if (!state.roundActive) return;
    const human = getHumanPlayer();
    if (!human) return;

    flipOrRecycleStock(human);
    renderPlayerBoard(human);
});
