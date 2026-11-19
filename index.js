import {flipOrRecycleStock, preloadCardImages} from './deck.js';
import { state, getHumanPlayer, startNewGame, startNextRound } from './gameState.js';
import { dom, renderPlayerBoard } from './ui.js';

dom.startBtn.addEventListener('click', async () => {
    dom.startBtn.disabled = true;
    await preloadCardImages();
    dom.startBtn.disabled = false;
    startNewGame();
});


dom.readyBtn.addEventListener('click', () => {
    dom.readyBtn.style.display = 'none';
    startNextRound();
});

dom.stockSlotEl.addEventListener('click', () => {
    if (!state.roundActive) return;
    const human = getHumanPlayer();

    flipOrRecycleStock(human);
    renderPlayerBoard(human);
});
