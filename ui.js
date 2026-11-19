import { getActiveDrag } from './dragAndDrop.js';

export const dom = {
    controlsEl: document.querySelector('.controls'),
    botStatusBarEl: document.querySelector('.bot-status-bar'),
    startBtn: document.getElementById('start-btn'),
    readyBtn: document.getElementById('ready-btn'),
    difficultySelectEl: document.getElementById('difficulty'),
    roundInfoEl: document.getElementById('round-info'),
    scoreboardEl: document.getElementById('scoreboard'),
    messageBannerEl: document.getElementById('message-banner'),
    centerAreaEl: document.getElementById('center-area'),
    playerAreaEl: document.getElementById('player-area'),
    demonSlotEl: document.getElementById('demon-slot'),
    demonCountEl: document.getElementById('demon-count'),
    tableauSlotsEl: document.getElementById('tableau-slots'),
    stockSlotEl: document.getElementById('stock-slot'),
    flippedSlotEl: document.getElementById('flipped-slot')
};

export function setRoundStartUI(currentRound, totalRounds) {
    dom.controlsEl.style.visibility = 'hidden';
    dom.scoreboardEl.style.visibility = 'visible';
    dom.botStatusBarEl.style.display = 'flex';
    dom.startBtn.disabled = true;
    dom.difficultySelectEl.disabled = true;
    dom.readyBtn.style.display = 'none';
    dom.playerAreaEl.classList.remove('round-ended');
    dom.roundInfoEl.textContent = `Round: ${currentRound} / ${totalRounds}`;
    dom.roundInfoEl.style.visibility = 'visible';
}

export function setRoundEndUI(winnerName, currentRound) {
    dom.playerAreaEl.classList.add('round-ended');
    dom.messageBannerEl.textContent = `${winnerName} is out! Click "Ready" for Round ${currentRound + 1}.`;
    dom.readyBtn.style.display = 'inline-block';
}

export function setGameOverUI(winner) {
    dom.controlsEl.style.visibility = 'visible';
    dom.startBtn.disabled = false;
    dom.difficultySelectEl.disabled = false;
    dom.readyBtn.style.display = 'none';
    dom.playerAreaEl.classList.add('round-ended');
    dom.messageBannerEl.textContent = `Game Over! ${winner.name} wins with ${winner.score} points!`;
}

export function renderAll(state) {
    renderCenterPiles(state.centerPiles);
    const human = state.players.find(p => p.id === 'player');
    if (human) renderPlayerBoard(human);
    renderBotStatus(state.players);
}

export function updateScoreboard(players) {
    players.forEach(p => {
        document.getElementById(`score-${p.id}`).textContent = String(p.score);
    });
}

export function renderBotStatus(players) {
    for (let i = 1; i <= 3; i++) {
        const bot = players.at(i);
        if (bot) {
            document.getElementById(`bot${i}-demon`).textContent = String(bot.demonPile.length);
        }
    }
}

export function renderCenterPiles(centerPiles) {
    dom.centerAreaEl.innerHTML = '';

    if (centerPiles.length === 0) {
        dom.centerAreaEl.innerHTML = '<div class="center-placeholder">Drag Aces here to start center piles</div>';
        return;
    }

    centerPiles.forEach((pile, index) => {
        if (pile === null) {
            const holeDiv = document.createElement('div');
            holeDiv.className = 'center-hole';
            holeDiv.dataset.pileIndex = String(index);
            dom.centerAreaEl.appendChild(holeDiv);
            return;
        }

        if (pile.inFlight && pile.cards.length === 1) {
            const landingHole = document.createElement('div');
            landingHole.className = 'center-hole';
            landingHole.dataset.pileIndex = String(index);
            dom.centerAreaEl.appendChild(landingHole);
            return;
        }

        const pileDiv = document.createElement('div');
        pileDiv.className = 'center-pile';
        if (pile.completing) pileDiv.classList.add('fade-out');
        pileDiv.dataset.pileIndex = String(index);

        const displayCard = pile.inFlight && pile.cards.length > 1
            ? pile.cards.at(-2)
            : pile.cards.at(-1);

        const img = document.createElement('img');
        img.src = displayCard.image;
        img.alt = `${displayCard.rankName} of ${displayCard.suit}`;
        img.className = 'card';
        img.draggable = false;

        pileDiv.appendChild(img);
        dom.centerAreaEl.appendChild(pileDiv);
    });
}

export function renderPlayerBoard(human) {
    if (!human || !human.demonPile) return;

    const activeDrag = getActiveDrag();
    const draggedCardId = activeDrag ? activeDrag.card.id : null;

    // Demon Pile
    dom.demonSlotEl.innerHTML = '';
    dom.demonCountEl.textContent = String(human.demonPile.length);
    if (human.demonPile.length > 0) {
        const topDemon = human.demonPile.at(-1);
        const isTopDragged = topDemon.id === draggedCardId;

        if (human.demonPile.length > 1) {
            const underDemon = human.demonPile.at(-2);
            const underImg = document.createElement('img');
            underImg.src = underDemon.image;
            underImg.alt = `${underDemon.rankName} of ${underDemon.suit}`;
            underImg.className = 'card-underneath';
            dom.demonSlotEl.appendChild(underImg);
        }

        if (!isTopDragged) {
            const img = topDemon.createCardElement('demon', null);
            img.classList.add('card-top');
            dom.demonSlotEl.appendChild(img);
        }
    }

    // Work Piles
    const slotEls = dom.tableauSlotsEl.querySelectorAll('.card-slot');
    slotEls.forEach((slotEl, idx) => {
        slotEl.innerHTML = '';
        const pile = human.tableau.at(idx);
        if (pile.length > 0) {
            const topCard = pile.at(-1);
            if (topCard.id !== draggedCardId) {
                const img = topCard.createCardElement('tableau', idx);
                slotEl.appendChild(img);
            }
        }
    });

    // Stock Pile
    dom.stockSlotEl.innerHTML = '';
    if (human.stock.length > 0) {
        const backDiv = document.createElement('div');
        backDiv.className = 'card-back';
        backDiv.textContent = '';
        dom.stockSlotEl.appendChild(backDiv);
    } else if (human.flipped.length > 0) {
        const resetDiv = document.createElement('div');
        resetDiv.style.fontSize = '13px';
        resetDiv.textContent = 'RECYCLE';
        dom.stockSlotEl.appendChild(resetDiv);
    }

    // Flip Pile
    dom.flippedSlotEl.innerHTML = '';
    if (human.flipped.length > 0) {
        const topFlipped = human.flipped.at(-1);
        const isTopDragged = topFlipped.id === draggedCardId;

        if (human.flipped.length > 1) {
            const nextFlipped = human.flipped.at(-2);
            const underImg = document.createElement('img');
            underImg.src = nextFlipped.image;
            underImg.alt = `${nextFlipped.rankName} of ${nextFlipped.suit}`;
            underImg.className = 'card-underneath';
            dom.flippedSlotEl.appendChild(underImg);
        }

        if (!isTopDragged) {
            const img = topFlipped.createCardElement('flipped', null);
            img.classList.add('card-top');
            dom.flippedSlotEl.appendChild(img);
        }
    }
}