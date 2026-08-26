
import { API } from './app.js';
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
    <div class="flex items-center justify-between mb-4"><h1 class="text-2xl font-bold">Words</h1><span class="text-sm text-zinc-500">${allWords.length} total • 100 per page spec</span></div>
    <div class="card p-4 mb-4"><input id="search" placeholder="Search Twi or English..." class="w-full bg-transparent border rounded-xl p-3" style="border-color:var(--border)"></div>
    <div class="card overflow-hidden"><table class="table"><thead><tr><th>Twi</th><th>English</th><th>Correct</th><th>Wrong</th></tr></thead><tbody></tbody></table><div id="pager" class="p-3 text-sm flex items-center"></div></div>
  `;
  root.querySelector('#search').addEventListener('input',()=>{page=1;draw()}); draw();
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
