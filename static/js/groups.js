
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

export async function renderGroups(root){
  const groups = await API.getGroups();
  root.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Groups</h1>
      <button id="addGroupBtn" class="btn-primary text-sm">+ Add Group</button>
    </div>
    <div class="card overflow-hidden"><table class="table"><thead><tr><th>Group Name</th><th>Word Count</th></tr></thead><tbody>${groups.map(g=>`<tr onclick="location.hash='#/groups/${g.id}'" style="cursor:pointer"><td class="font-semibold">${g.name}</td><td>${g.word_count}</td></tr>`).join('')}</tbody></table></div>
  `;
  
  document.getElementById('addGroupBtn').onclick = () => {
    showAddGroupForm(root);
  };
}

async function showAddGroupForm(root) {
  root.innerHTML = `
    <a href="#/groups" class="text-sm">← Back to groups</a>
    <div class="card p-6 mt-3 max-w-xl">
      <h2 class="text-xl font-bold mb-4">Add New Group</h2>
      <form id="addGroupForm" class="space-y-4">
        <div>
          <label class="text-sm font-medium">Group Name</label>
          <input type="text" name="name" required class="w-full mt-1 border rounded-xl p-3 bg-transparent" style="border-color:var(--border)">
        </div>
        <div>
          <label class="text-sm font-medium">Description</label>
          <textarea name="description" class="w-full mt-1 border rounded-xl p-3 bg-transparent" style="border-color:var(--border)" rows="3"></textarea>
        </div>
        <div class="flex gap-3">
          <button type="submit" class="btn-primary flex-1">Save Group</button>
          <button type="button" id="cancelBtn" class="btn-secondary flex-1">Cancel</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('cancelBtn').onclick = () => {
    renderGroups(root);
  };

  document.getElementById('addGroupForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      const res = await fetch('/api/groups/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        credentials: 'same-origin',
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        alert('Group added successfully!');
        renderGroups(root);
      } else {
        const error = await res.json();
        alert('Failed to add group: ' + JSON.stringify(error));
      }
    } catch (err) {
      console.error('Error adding group:', err);
      alert('An error occurred. Please try again.');
    }
  };
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
