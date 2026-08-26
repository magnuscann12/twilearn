
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

let allWords = [];
export async function renderWords(root){
  allWords = await API.getWords();
  let page=1; const per=20;
  const draw=()=>{
    const filtered = allWords.filter(w=> (document.getElementById('search')?.value||'').toLowerCase().split(' ').every(t=> !t || w.twi.toLowerCase().includes(t) || w.english.toLowerCase().includes(t)));
    const total = Math.ceil(filtered.length/per);
    const slice = filtered.slice((page-1)*per, page*per);
    root.querySelector('tbody').innerHTML = slice.map(w=>`<tr onclick="location.hash='#/words/${w.id}'" style="cursor:pointer"><td class="font-bold">${w.twi}</td><td>${w.english}</td><td>${w.correct}</td><td>${w.wrong}</td></tr>`).join('');
    root.querySelector('#pager').innerHTML = `Page ${page}/${total} <button class="btn-secondary text-xs ml-2" ${page<=1?'disabled':''} id="prev">Prev</button> <button class="btn-secondary text-xs ml-1" ${page>=total?'disabled':''} id="next">Next</button>`;
    root.querySelector('#prev')?.addEventListener('click',()=>{page=Math.max(1,page-1);draw()}); root.querySelector('#next')?.addEventListener('click',()=>{page=Math.min(total,page+1);draw()});
  };
  root.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Words</h1>
      <button id="addWordBtn" class="btn-primary text-sm">+ Add Word</button>
    </div>
    <div class="card p-4 mb-4"><input id="search" placeholder="Search Twi or English..." class="w-full bg-transparent border rounded-xl p-3" style="border-color:var(--border)"></div>
    <div class="card overflow-hidden"><table class="table"><thead><tr><th>Twi</th><th>English</th><th>Correct</th><th>Wrong</th></tr></thead><tbody></tbody></table><div id="pager" class="p-3 text-sm flex items-center"></div></div>
  `;
  
  document.getElementById('addWordBtn').onclick = () => {
    showAddWordForm(root);
  };
  
  root.querySelector('#search').addEventListener('input',()=>{page=1;draw()}); draw();
}

async function showAddWordForm(root) {
  const groups = await API.getGroups();
  root.innerHTML = `
    <a href="#/words" class="text-sm">← Back to words</a>
    <div class="card p-6 mt-3 max-w-xl">
      <h2 class="text-xl font-bold mb-4">Add New Word</h2>
      <form id="addWordForm" class="space-y-4">
        <div>
          <label class="text-sm font-medium">Twi Word</label>
          <input type="text" name="word" required class="w-full mt-1 border rounded-xl p-3 bg-transparent" style="border-color:var(--border)">
        </div>
        <div>
          <label class="text-sm font-medium">Language</label>
          <select name="language" class="w-full mt-1 border rounded-xl p-3 bg-transparent" style="border-color:var(--border)">
            <option value="twi">Twi</option>
            <option value="en">English</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium">Translation</label>
          <input type="text" name="translation" class="w-full mt-1 border rounded-xl p-3 bg-transparent" style="border-color:var(--border)">
        </div>
        <div>
          <label class="text-sm font-medium">Pronunciation</label>
          <input type="text" name="pronunciation" class="w-full mt-1 border rounded-xl p-3 bg-transparent" style="border-color:var(--border)">
        </div>
        <div>
          <label class="text-sm font-medium">Example Sentence</label>
          <textarea name="example_sentence" class="w-full mt-1 border rounded-xl p-3 bg-transparent" style="border-color:var(--border)" rows="2"></textarea>
        </div>
        <div>
          <label class="text-sm font-medium">Example Translation</label>
          <textarea name="example_translation" class="w-full mt-1 border rounded-xl p-3 bg-transparent" style="border-color:var(--border)" rows="2"></textarea>
        </div>
        <div>
          <label class="text-sm font-medium">Groups</label>
          <div class="mt-1 space-y-2">
            ${groups.map(g => `
              <label class="flex items-center gap-2">
                <input type="checkbox" name="groups" value="${g.id}" class="rounded">
                <span>${g.name}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="flex gap-3">
          <button type="submit" class="btn-primary flex-1">Save Word</button>
          <button type="button" id="cancelBtn" class="btn-secondary flex-1">Cancel</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('cancelBtn').onclick = () => {
    renderWords(root);
  };

  document.getElementById('addWordForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.group_ids = Array.from(document.querySelectorAll('input[name="groups"]:checked')).map(cb => parseInt(cb.value));
    
    try {
      const res = await fetch('/api/words/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        credentials: 'same-origin',
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        alert('Word added successfully!');
        renderWords(root);
      } else {
        const error = await res.json();
        alert('Failed to add word: ' + JSON.stringify(error));
      }
    } catch (err) {
      console.error('Error adding word:', err);
      alert('An error occurred. Please try again.');
    }
  };
}

export async function renderWordShow(root, id){
  if(!allWords.length) allWords = await API.getWords();
  const w = allWords.find(x=>x.id==id) || allWords[0];
  const groups = await API.getGroups();
  root.innerHTML = `
    <a href="#/words" class="text-sm">← Back to words</a>
    <div class="card p-8 mt-3">
      <div class="text-5xl font-extrabold">${w.twi}</div><div class="text-xl text-zinc-500 mt-2">${w.english}</div>
      <div class="flex gap-6 mt-6"><div><div class="text-xs text-zinc-500 uppercase">Correct</div><div class="text-2xl font-bold text-green-600">${w.correct}</div></div><div><div class="text-xs text-zinc-500 uppercase">Wrong</div><div class="text-2xl font-bold text-red-600">${w.wrong}</div></div></div>
      <div class="mt-6"><div class="text-sm font-semibold mb-2">Word Groups</div><div class="flex gap-2 flex-wrap">${groups.slice(0,3).map(g=>`<a href="#/groups/${g.id}" class="pill">${g.name}</a>`).join('')}</div></div>
    </div>
  `;
}
