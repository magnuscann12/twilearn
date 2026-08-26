
import { getTheme, applyTheme } from './app.js';
export function renderSettings(root){
  root.innerHTML = `
    <h1 class="text-2xl font-bold mb-4">Settings</h1>
    <div class="card p-6">
      <div class="font-semibold">Theme Selection</div>
      <div class="mt-3 flex gap-2" id="themeOpts">
        <label class="flex items-center gap-2 border rounded-full px-4 py-2 cursor-pointer"><input type="radio" name="theme" value="light"> Light</label>
        <label class="flex items-center gap-2 border rounded-full px-4 py-2 cursor-pointer"><input type="radio" name="theme" value="dark"> Dark</label>
        <label class="flex items-center gap-2 border rounded-full px-4 py-2 cursor-pointer"><input type="radio" name="theme" value="system"> System</label>
      </div>
    </div>
    <div class="card p-6 mt-5 border-red-200">
      <div class="font-semibold text-red-600">Danger Zone</div>
      <div class="flex gap-3 mt-4">
        <button id="resetHistory" class="btn-secondary border-red-300 text-red-600">Reset History</button>
        <button id="fullReset" class="btn-primary bg-red-600">Full Reset</button>
      </div>
      <p class="text-xs text-zinc-500 mt-3">Reset History → POST /api/reset_history • Full Reset → POST /api/full_reset</p>
    </div>
  `;
  const cur = getTheme(); root.querySelectorAll('input[name=theme]').forEach(r=>{ r.checked = r.value===cur; r.onchange = ()=>applyTheme(r.value); });
  root.querySelector('#resetHistory').onclick = ()=>{ if(confirm('Delete all study sessions and word review items?')){ alert('POST /api/reset_history (mock) — history cleared'); console.log('POST /api/reset_history'); } };
  root.querySelector('#fullReset').onclick = ()=>{ if(confirm('Drop all tables and re-create with seed data? This cannot be undone.')){ alert('POST /api/full_reset (mock) — database reset'); console.log('POST /api/full_reset'); } };
}
