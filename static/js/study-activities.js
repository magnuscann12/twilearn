
import { API } from './app.js';
import { renderFlashcardActivity } from './flashcard-activity.js';
import { renderQuizActivity } from './quiz-activity.js';
import { renderMatchingActivity } from './matching-activity.js';

export async function renderActivities(root){
  const acts = await API.getActivities();
  root.innerHTML = `<h1 class="text-2xl font-bold mb-4">Study Activities</h1><div class="grid md:grid-cols-2 gap-4">${acts.map(a=>`
    <div class="card p-5">
      <div class="text-4xl">${a.thumb}</div>
      <div class="font-bold mt-3">${a.name}</div>
      <div class="text-sm text-zinc-500 mt-1 h-10">${a.desc}</div>
      <div class="flex gap-2 mt-4"><a href="#/study_activities/${a.id}/launch" class="btn-primary text-sm">Launch</a><a href="#/study_activities/${a.id}" class="btn-secondary text-sm">View</a></div>
    </div>`).join('')}</div>`;
}
export async function renderActivityShow(root, id){
  const acts = await API.getActivities(); const a = acts.find(x=>x.id==id) || acts[0];
  const sessions = (await API.getSessions()).slice(0,5);
  root.innerHTML = `
    <a href="#/study_activities" class="text-sm">← Back</a>
    <div class="card p-6 mt-3 flex gap-5">
      <div class="text-5xl">${a.thumb}</div>
      <div><h1 class="text-2xl font-bold">${a.name}</h1><p class="text-sm text-zinc-500 mt-1">${a.desc}</p><a href="#/study_activities/${a.id}/launch" class="btn-primary mt-4 inline-block">Launch now</a></div>
    </div>
    <div class="card mt-5 overflow-hidden"><div class="p-4 font-semibold">Past Sessions</div>
      <table class="table"><thead><tr><th>ID</th><th>Group</th><th>Start</th><th>End</th><th>Reviews</th></tr></thead><tbody>
      ${sessions.map(s=>`<tr onclick="location.hash='#/study_sessions/${s.id}'" style="cursor:pointer"><td>${s.id}</td><td>${s.group_name}</td><td>${s.start_time}</td><td>${s.end_time}</td><td>${s.review_count}</td></tr>`).join('')}
      </tbody></table></div>
  `;
}
export async function renderLaunch(root, id){
  const groups = await API.getGroups(); 
  const acts = await API.getActivities(); 
  const a = acts.find(x=>x.id==id) || acts[0];
  
  root.innerHTML = `
    <h1 class="text-2xl font-bold">${a.name} — Launch</h1>
    <div class="card p-6 mt-4 max-w-xl">
      <label class="text-sm font-medium">Select Group</label>
      <select id="groupSel" class="mt-2 w-full border rounded-xl p-3 bg-transparent" style="border-color:var(--border)">${groups.map(g=>`<option value="${g.id}">${g.name} (${g.word_count})</option>`).join('')}</select>
      <button id="launchBtn" class="btn-primary w-full mt-4">Launch Now ↗</button>
    </div>
  `;
  
  document.getElementById('launchBtn').onclick = async ()=>{
    const gid = document.getElementById('groupSel').value;
    const activityType = a.name.toLowerCase().replace(' ', '-');
    
    // Route to appropriate activity based on type
    if (activityType.includes('flashcard')) {
      await renderFlashcardActivity(root, id, gid);
    } else if (activityType.includes('quiz')) {
      await renderQuizActivity(root, id, gid);
    } else if (activityType.includes('matching')) {
      await renderMatchingActivity(root, id, gid);
    } else {
      await renderFlashcardActivity(root, id, gid); // Default to flashcards
    }
  };
}
export async function renderActivityRun(root, id, groupId, activityType){
  if (activityType === 'flashcards') {
    await renderFlashcardActivity(root, id, groupId);
  } else if (activityType === 'quiz') {
    await renderQuizActivity(root, id, groupId);
  } else if (activityType === 'matching') {
    await renderMatchingActivity(root, id, groupId);
  } else {
    await renderFlashcardActivity(root, id, groupId);
  }
}
