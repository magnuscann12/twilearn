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

export async function renderMatchingActivity(root, activityId, groupId) {
  const words = await API.getWords();
  const filteredWords = groupId 
    ? words.filter(w => w.groups && w.groups.includes(parseInt(groupId)))
    : words.slice(0, 6);
  
  let correct = 0;
  let wrong = 0;
  let sessionId = null;
  let selectedTwi = null;
  let selectedEnglish = null;
  let matchedPairs = [];

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

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const renderMatching = () => {
    if (matchedPairs.length === filteredWords.length) {
      completeSession();
      root.innerHTML = `
        <div class="card p-8 text-center">
          <div class="text-4xl mb-4">🎉</div>
          <h2 class="text-2xl font-bold mb-2">Matching Complete!</h2>
          <div class="text-lg mb-4">You matched ${filteredWords.length} word pairs</div>
          <div class="flex justify-center gap-8 mb-6">
            <div class="text-green-600"><div class="text-3xl font-bold">${correct}</div><div class="text-sm">Correct</div></div>
            <div class="text-red-600"><div class="text-3xl font-bold">${wrong}</div><div class="text-sm">Wrong</div></div>
          </div>
          <a href="#/study_sessions" class="btn-primary">View Sessions</a>
        </div>
      `;
      return;
    }

    const twiWords = shuffleArray(filteredWords.filter(w => !matchedPairs.includes(w.id)));
    const englishWords = shuffleArray(filteredWords.filter(w => !matchedPairs.includes(w.id)));

    root.innerHTML = `
      <div class="max-w-2xl mx-auto">
        <div class="flex justify-between items-center mb-4">
          <a href="#/study_activities" class="text-sm">← Back</a>
          <div class="text-sm text-zinc-500">${matchedPairs.length} / ${filteredWords.length} matched</div>
        </div>
        <div class="card p-6">
          <div class="text-sm text-zinc-500 mb-4 text-center">Match the Twi words with their English translations</div>
          <div class="grid grid-cols-2 gap-4">
            <div id="twiColumn" class="space-y-2">
              ${twiWords.map(w => `
                <button data-id="${w.id}" data-word="${w.twi}" data-type="twi"
                  class="match-btn w-full p-4 text-left rounded-xl border-2 transition-all hover:border-zinc-400 ${selectedTwi?.id === w.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : ''}"
                  style="border-color:var(--border)">
                  ${w.twi}
                </button>
              `).join('')}
            </div>
            <div id="englishColumn" class="space-y-2">
              ${englishWords.map(w => `
                <button data-id="${w.id}" data-word="${w.english}" data-type="english"
                  class="match-btn w-full p-4 text-left rounded-xl border-2 transition-all hover:border-zinc-400 ${selectedEnglish?.id === w.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : ''}"
                  style="border-color:var(--border)">
                  ${w.english}
                </button>
              `).join('')}
            </div>
          </div>
          <div id="feedback" class="mt-4 text-center text-lg font-semibold"></div>
        </div>
      </div>
    `;

    document.querySelectorAll('.match-btn').forEach(btn => {
      btn.onclick = () => {
        const type = btn.dataset.type;
        const id = parseInt(btn.dataset.id);
        const word = filteredWords.find(w => w.id === id);

        if (type === 'twi') {
          selectedTwi = { id, word };
          if (selectedEnglish && selectedEnglish.id === id) {
            selectedEnglish = null;
          }
        } else {
          selectedEnglish = { id, word };
          if (selectedTwi && selectedTwi.id === id) {
            selectedTwi = null;
          }
        }

        // Check for match
        if (selectedTwi && selectedEnglish) {
          const isMatch = selectedTwi.id === selectedEnglish.id;
          API.recordWordProgress(selectedTwi.id, isMatch);
          
          if (isMatch) {
            correct++;
            matchedPairs.push(selectedTwi.id);
            document.getElementById('feedback').innerHTML = '<span class="text-green-600">✓ Matched!</span>';
          } else {
            wrong++;
            document.getElementById('feedback').innerHTML = '<span class="text-red-600">✗ Not a match!</span>';
          }

          selectedTwi = null;
          selectedEnglish = null;
          
          setTimeout(renderMatching, 500);
        } else {
          renderMatching();
        }
      };
    });
  };

  await startSession();
  renderMatching();
}
