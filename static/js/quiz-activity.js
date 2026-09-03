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

export async function renderQuizActivity(root, activityId, groupId) {
  const words = await API.getWords();
  const filteredWords = groupId 
    ? words.filter(w => w.groups && w.groups.includes(parseInt(groupId)))
    : words.slice(0, 10);
  
  let currentIndex = 0;
  let correct = 0;
  let wrong = 0;
  let sessionId = null;
  let selectedAnswer = null;

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

  const renderQuestion = () => {
    if (currentIndex >= filteredWords.length) {
      completeSession();
      root.innerHTML = `
        <div class="card p-8 text-center">
          <div class="text-4xl mb-4">🎉</div>
          <h2 class="text-2xl font-bold mb-2">Quiz Complete!</h2>
          <div class="text-lg mb-4">You answered ${filteredWords.length} questions</div>
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
    const allWords = shuffleArray(filteredWords.filter(w => w.id !== word.id).slice(0, 3));
    const options = shuffleArray([word, ...allWords]);
    const correctAnswer = word.english;

    root.innerHTML = `
      <div class="max-w-lg mx-auto">
        <div class="flex justify-between items-center mb-4">
          <a href="#/study_activities" class="text-sm">← Back</a>
          <div class="text-sm text-zinc-500">${currentIndex + 1} / ${filteredWords.length}</div>
        </div>
        <div class="card p-8 text-center">
          <div class="text-sm text-zinc-500 mb-2">What does this mean?</div>
          <div class="text-4xl font-extrabold mb-8">${word.twi}</div>
          <div id="options" class="space-y-3">
            ${options.map((opt, i) => `
              <button data-answer="${opt.english}" data-correct="${opt.english === correctAnswer}" 
                class="quiz-option w-full p-4 text-left rounded-xl border-2 transition-all hover:border-zinc-400"
                style="border-color:var(--border)">
                ${opt.english}
              </button>
            `).join('')}
          </div>
          <div id="feedback" class="mt-6 text-lg font-semibold"></div>
          <button id="nextBtn" class="btn-primary w-full mt-4 hidden">Next Question →</button>
        </div>
      </div>
    `;

    document.querySelectorAll('.quiz-option').forEach(btn => {
      btn.onclick = () => {
        if (selectedAnswer !== null) return;
        
        selectedAnswer = btn.dataset.answer;
        const isCorrect = btn.dataset.correct === 'true';
        API.recordWordProgress(word.id, isCorrect);
        
        document.querySelectorAll('.quiz-option').forEach(b => {
          b.disabled = true;
          if (b.dataset.correct === 'true') {
            b.classList.add('bg-green-100', 'border-green-500', 'dark:bg-green-900');
          } else if (b === btn && !isCorrect) {
            b.classList.add('bg-red-100', 'border-red-500', 'dark:bg-red-900');
          }
        });

        const feedback = document.getElementById('feedback');
        if (isCorrect) {
          correct++;
          feedback.innerHTML = '<span class="text-green-600">✓ Correct!</span>';
        } else {
          wrong++;
          feedback.innerHTML = `<span class="text-red-600">✗ Wrong! The answer was: ${correctAnswer}</span>`;
        }

        document.getElementById('nextBtn').classList.remove('hidden');
      };
    });

    document.getElementById('nextBtn').onclick = () => {
      currentIndex++;
      selectedAnswer = null;
      renderQuestion();
    };
  };

  await startSession();
  renderQuestion();
}
