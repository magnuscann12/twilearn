import { API } from './app.js';

function getCSRFToken() {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      return decodeURIComponent(value);
    }
  }
  return '';
}

export async function renderFlashcardActivity(root, activityId, groupId) {
  const words = await API.getWords();
  const filteredWords = groupId 
    ? words.filter(w => w.groups && w.groups.includes(parseInt(groupId)))
    : words.slice(0, 10);
  
  let currentIndex = 0;
  let isFlipped = false;
  let correct = 0;
  let wrong = 0;
  let sessionId = null;

  const startSession = async () => {
    try {
      const res = await fetch(`/api/study-activities/${activityId}/start_session/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        credentials: 'same-origin'
      });
      const data = await res.json();
      sessionId = data.id;
    } catch (e) {
      console.error('Failed to start session:', e);
    }
  };

  const completeSession = async () => {
    if (!sessionId) return;
    try {
      await fetch(`/api/study-activities/${activityId}/complete_session/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          session_id: sessionId,
          score: Math.round((correct / (correct + wrong)) * 100) || 0,
          total_questions: correct + wrong,
          correct_answers: correct
        })
      });
    } catch (e) {
      console.error('Failed to complete session:', e);
    }
  };

  const renderCard = () => {
    if (currentIndex >= filteredWords.length) {
      completeSession();
      root.innerHTML = `
        <div class="card p-8 text-center">
          <div class="text-4xl mb-4">🎉</div>
          <h2 class="text-2xl font-bold mb-2">Session Complete!</h2>
          <div class="text-lg mb-4">You reviewed ${filteredWords.length} words</div>
          <div class="flex justify-center gap-8 mb-6">
            <div class="text-green-600"><div class="text-3xl font-bold">${correct}</div><div class="text-sm">Correct</div></div>
            <div class="text-red-600"><div class="text-3xl font-bold">${wrong}</div><div class="text-sm">Wrong</div></div>
          </div>
          <a href="#/study_sessions" class="btn-primary">View Sessions</a>
        </div>
      `;
      return;
    }

    const word = filteredWords[currentIndex];
    root.innerHTML = `
      <div class="max-w-lg mx-auto">
        <div class="flex justify-between items-center mb-4">
          <a href="#/study_activities" class="text-sm">← Back</a>
          <div class="text-sm text-zinc-500">${currentIndex + 1} / ${filteredWords.length}</div>
        </div>
        <div id="flashcard" class="card p-8 min-h-[300px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isFlipped ? 'bg-zinc-100 dark:bg-zinc-800' : ''}" onclick="flipCard()">
          <div id="cardFront" class="text-center ${isFlipped ? 'hidden' : ''}">
            <div class="text-4xl font-extrabold mb-4">${word.twi}</div>
            <div class="text-sm text-zinc-500">Click to flip</div>
          </div>
          <div id="cardBack" class="text-center ${isFlipped ? '' : 'hidden'}">
            <div class="text-2xl font-bold mb-2">${word.english}</div>
            ${word.pronunciation ? `<div class="text-sm text-zinc-500 mb-2">/${word.pronunciation}/</div>` : ''}
            ${word.example_sentence ? `<div class="text-sm mt-4 p-3 bg-zinc-100 dark:bg-zinc-700 rounded-lg">${word.example_sentence}</div>` : ''}
          </div>
        </div>
        <div class="flex gap-4 mt-6">
          <button id="wrongBtn" class="btn-secondary flex-1 py-3 text-lg ${isFlipped ? '' : 'opacity-50 cursor-not-allowed'}" ${isFlipped ? '' : 'disabled'}>✗ Wrong</button>
          <button id="correctBtn" class="btn-primary flex-1 py-3 text-lg ${isFlipped ? '' : 'opacity-50 cursor-not-allowed'}" ${isFlipped ? '' : 'disabled'}>✓ Correct</button>
        </div>
      </div>
    `;

    document.getElementById('wrongBtn').onclick = () => {
      wrong++;
      API.recordWordProgress(word.id, false);
      currentIndex++;
      isFlipped = false;
      renderCard();
    };

    document.getElementById('correctBtn').onclick = () => {
      correct++;
      API.recordWordProgress(word.id, true);
      currentIndex++;
      isFlipped = false;
      renderCard();
    };
  };

  window.flipCard = () => {
    isFlipped = !isFlipped;
    const card = document.getElementById('flashcard');
    const front = document.getElementById('cardFront');
    const back = document.getElementById('cardBack');
    
    if (isFlipped) {
      front.classList.add('hidden');
      back.classList.remove('hidden');
      card.classList.add('bg-zinc-100', 'dark:bg-zinc-800');
    } else {
      front.classList.remove('hidden');
      back.classList.add('hidden');
      card.classList.remove('bg-zinc-100', 'dark:bg-zinc-800');
    }
    
    // Enable/disable buttons
    document.getElementById('wrongBtn').disabled = !isFlipped;
    document.getElementById('correctBtn').disabled = !isFlipped;
    document.getElementById('wrongBtn').classList.toggle('opacity-50', !isFlipped);
    document.getElementById('correctBtn').classList.toggle('opacity-50', !isFlipped);
  };

  await startSession();
  renderCard();
}
