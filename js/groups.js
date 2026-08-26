
import { API } from './app.js';
export async function renderGroups(root){
  const groups = await API.getGroups();
  root.innerHTML = `<h1 class="text-2xl font-bold mb-4">Groups</h1><div class="card overflow-hidden"><table class="table"><thead><tr><th>Group Name</th><th>Word Count</th></tr></thead><tbody>${groups.map(g=>`<tr onclick="location.hash='#/groups/${g.id}'" style="cursor:pointer"><td class="font-semibold">${g.name}</td><td>${g.word_count}</td></tr>`).join('')}</tbody></table></div>`;
}
export async function renderGroupShow(root, id){
  const groups = await API.getGroups(); const g = groups.find(x=>x.id==id) || groups[0];
  const words = (await API.getWords()).slice(0,10); const sessions = (await API.getSessions()).slice(0,5);
  root.innerHTML = `
    <a href="#/groups" class="text-sm">← Back</a>
    <div class="card p-6 mt-3"><h1 class="text-2xl font-bold">${g.name}</h1><div class="text-sm text-zinc-500 mt-1">Total Word Count: ${g.word_count}</div></div>
    <div class="mt-5 grid md:grid-cols-2 gap-5">
      <div class="card overflow-hidden"><div class="p-4 font-semibold">Words in Group</div><table class="table"><thead><tr><th>Twi</th><th>English</th></tr></thead><tbody>${words.map(w=>`<tr><td class="font-bold">${w.twi}</td><td>${w.english}</td></tr>`).join('')}</tbody></table></div>
      <div class="card overflow-hidden"><div class="p-4 font-semibold">Study Sessions</div><table class="table"><thead><tr><th>ID</th><th>Activity</th><th>Reviews</th></tr></thead><tbody>${sessions.map(s=>`<tr onclick="location.hash='#/study_sessions/${s.id}'" style="cursor:pointer"><td>${s.id}</td><td>${s.activity_name}</td><td>${s.review_count}</td></tr>`).join('')}</tbody></table></div>
    </div>
  `;
}
