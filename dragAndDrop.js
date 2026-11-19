import { removeCardFromZone } from './deck.js';
import { state, getHumanPlayer, executeMoveToCenter, checkRoundEnd } from './gameState.js';
import { dom, renderPlayerBoard } from './ui.js';

let activeDrag = null;

export function getActiveDrag() {
    return activeDrag;
}

export function startPointerDrag(e, imgEl, card, sourceType, slotIndex) {
    if (!state.roundActive || activeDrag) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();

    const rect = imgEl.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    imgEl.style.width = `${rect.width}px`;
    imgEl.style.height = `${rect.height}px`;
    imgEl.style.left = `${rect.left}px`;
    imgEl.style.top = `${rect.top}px`;
    imgEl.classList.add('dragging-active');
    document.body.appendChild(imgEl);

    activeDrag = {
        imgEl,
        card,
        sourceType,
        slotIndex,
        offsetX,
        offsetY,
        startLeft: rect.left,
        startTop: rect.top,
        width: rect.width,
        height: rect.height
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);
}

function cleanupDragListeners() {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerUp);
}

function onPointerMove(e) {
    if (!activeDrag) return;
    if (!state.roundActive) {
        cancelAndReturnDrag();
        return;
    }

    const currentLeft = e.clientX - activeDrag.offsetX;
    const currentTop = e.clientY - activeDrag.offsetY;
    activeDrag.imgEl.style.left = `${currentLeft}px`;
    activeDrag.imgEl.style.top = `${currentTop}px`;

    const centerX = currentLeft + activeDrag.width / 2;
    const centerY = currentTop + activeDrag.height / 2;
    const hitTarget = document.elementFromPoint(centerX, centerY);

    if (!hitTarget) return;

    const human = getHumanPlayer();
    const { card, sourceType, slotIndex } = activeDrag;

    // 1. Instant snap onto an existing valid center pile on contact
    const targetPileEl = hitTarget.closest('.center-pile');
    if (targetPileEl) {
        const pileIndex = parseInt(targetPileEl.dataset.pileIndex, 10);
        const pile = state.centerPiles.at(pileIndex);
        if (pile && !pile.completing && !pile.inFlight && card.suit === pile.suit && card.value === pile.topValue + 1) {
            cleanupDragListeners();
            activeDrag.imgEl.remove();
            activeDrag = null;
            executeMoveToCenter(human, card, sourceType, slotIndex, pileIndex);
            return;
        }
    }

    // 2. Instant snap when an Ace's center enters the center playing area
    const inCenterArea = hitTarget.closest('#center-area');
    if (inCenterArea && card.value === 1) {
        cleanupDragListeners();
        activeDrag.imgEl.remove();
        activeDrag = null;
        executeMoveToCenter(human, card, sourceType, slotIndex, -1);
    }
}

function onPointerUp(e) {
    if (!activeDrag) return;
    cleanupDragListeners();

    if (!state.roundActive) {
        cancelAndReturnDrag();
        return;
    }

    const { imgEl, card, sourceType, slotIndex } = activeDrag;
    const rect = imgEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const human = getHumanPlayer();
    const dropTarget = document.elementFromPoint(centerX, centerY) || document.elementFromPoint(e.clientX, e.clientY);

    const targetSlotEl = dropTarget ? dropTarget.closest('#tableau-slots .card-slot') : null;
    if (targetSlotEl && sourceType !== 'tableau') {
        const targetSlotIndex = parseInt(targetSlotEl.dataset.slot, 10);
        if (human.tableau.at(targetSlotIndex).length === 0) {
            activeDrag = null;
            imgEl.remove();
            removeCardFromZone(human, sourceType, slotIndex);
            human.tableau.at(targetSlotIndex).push(card);
            renderPlayerBoard(human);
            checkRoundEnd(human);
            return;
        }
    }

    cancelAndReturnDrag();
}

export function cancelAndReturnDrag() {
    if (!activeDrag) return;
    cleanupDragListeners();
    const { imgEl, startLeft, startTop } = activeDrag;
    activeDrag = null;

    imgEl.classList.add('returning-card');
    imgEl.style.left = `${startLeft}px`;
    imgEl.style.top = `${startTop}px`;

    setTimeout(() => {
        imgEl.remove();
        const human = getHumanPlayer();
        if (human) renderPlayerBoard(human);
    }, 250);
}

export function animateBotCard(botId, card, targetIndex, onComplete) {
    const botBox = document.getElementById(`bot-box-${botId}`);
    const startRect = botBox.getBoundingClientRect();

    const targetSlot = dom.centerAreaEl.querySelector(`[data-pile-index="${targetIndex}"]`) || dom.centerAreaEl;
    const endRect = targetSlot.getBoundingClientRect();

    const flyingImg = document.createElement('img');
    flyingImg.src = card.image;
    flyingImg.className = 'flying-card';

    const startX = startRect.left + startRect.width / 2 - 45;
    const startY = startRect.top + startRect.height / 2 - 65;
    const endX = endRect.left;
    const endY = endRect.top;

    flyingImg.style.left = `${startX}px`;
    flyingImg.style.top = `${startY}px`;
    document.body.appendChild(flyingImg);

    flyingImg.getBoundingClientRect();
    flyingImg.style.transform = `translate(${endX - startX}px, ${endY - startY}px)`;

    setTimeout(() => {
        flyingImg.remove();
        onComplete();
    }, 350);
}
