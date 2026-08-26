
import { API } from './app.js';
export async function renderSessions(root){
  const sessions = await API.getSessions();
  root.innerHTML = `<h1 class="text-2xl font-bold mb-4">Study Sessions</h1><div class="card overflow-hidden"><table class="table"><thead><tr><th>ID</th><th>Activity</th><th>Group</th><th>Start</th><th>End</th><th>Reviews</th></tr></thead><tbody>${sessions.map(s=>`<tr onclick="location.hash='#/study_sessions/${s.id}'" style="cursor:pointer"><td>${s.id}</td><td>${s.activity_name}</td><td>${s.group_name}</td><td>${s.start_time}</td><td>${s.end_time}</td><td>${s.review_count}</td></tr>`).join('')}</tbody></table></div>`;
}
export async function renderSessionShow(root, id){
  const sessions = await API.getSessions(); const s = sessions.find(x=>x.id==id) || {id:999, activity_name:"Flashcards", group_name:"Greetings", start_time:"2026-08-23 14:30", end_time:"2026-08-23 14:42", review_count:12};
  const words = (await API.getWords()).slice(0, s.review_count || 12);
  root.innerHTML = `
    <a href="#/study_sessions" class="text-sm">← Back</a>
    <div class="card p-6 mt-3"><h1 class="text-2xl font-bold">Session #${s.id}</h1><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm"><div><div class="text-zinc-500">Activity</div><div class="font-semibold">${s.activity_name}</div></div><div><div class="text-zinc-500">Group</div><div class="font-semibold">${s.group_name}</div></div><div><div class="text-zinc-500">Start</div><div class="font-semibold">${s.start_time}</div></div><div><div class="text-zinc-500">End</div><div class="font-semibold">${s.end_time}</div></div></div></div>
    <div class="card mt-5 overflow-hidden"><div class="p-4 font-semibold">Reviewed Words (${words.length})</div><table class="table"><thead><tr><th>Twi</th><th>English</th><th>Correct</th><th>Wrong</th></tr></thead><tbody>${words.map(w=>`<tr><td class="font-bold">${w.twi}</td><td>${w.english}</td><td>${w.correct}</td><td>${w.wrong}</td></tr>`).join('')}</tbody></table></div>
  `;
}
