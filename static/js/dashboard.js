import { API } from './app.js';
export async function renderDashboard(root){
  const data = await API.getDashboard();
  const progressPercent = data.progress.total > 0
    ? Math.round((data.progress.studied / data.progress.total) * 100)
    : 0;
  root.innerHTML = `
    <div class="grid md:grid-cols-3 gap-5">
      <div class="card p-5 md:col-span-2">
        <div class="text-xs uppercase tracking-widest text-zinc-500 mb-3">Last Study Session</div>
        <div class="flex items-start justify-between">
          <div>
            <div class="text-lg font-bold">${data.last_session.activity} • ${data.last_session.group}</div>
            <div class="text-sm text-zinc-500 mt-1">${data.last_session.date}</div>
            <div class="mt-3 flex gap-2"><span class="pill bg-green-50 border-green-200">✓ ${data.last_session.correct} correct</span><span class="pill bg-red-50 border-red-200">✗ ${data.last_session.wrong} wrong</span></div>
          </div>
          <a href="#/study_sessions/${data.last_session.id}" class="btn-secondary text-sm">View session →</a>
        </div>
      </div>
      <div class="card p-5">
        <div class="text-xs uppercase tracking-widest text-zinc-500 mb-3">Study Progress</div>
        <div class="text-3xl font-extrabold">${data.progress.studied}/${data.progress.total}</div>
        <div class="text-sm text-zinc-500">words studied</div>
        <div class="mt-4 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden"><div style="width:${progressPercent}%" class="h-full bg-zinc-900 dark:bg-white"></div></div>
        <div class="mt-3 text-sm">Mastery <span class="font-bold">${data.progress.mastery}%</span></div>
      </div>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
      <div class="card p-4"><div class="text-xs text-zinc-500">Success rate</div><div class="text-2xl font-bold mt-1">${data.quick_stats.success_rate}%</div></div>
      <div class="card p-4"><div class="text-xs text-zinc-500">Sessions</div><div class="text-2xl font-bold mt-1">${data.quick_stats.total_sessions}</div></div>
      <div class="card p-4"><div class="text-xs text-zinc-500">Active groups</div><div class="text-2xl font-bold mt-1">${data.quick_stats.active_groups}</div></div>
      <div class="card p-4"><div class="text-xs text-zinc-500">Streak</div><div class="text-2xl font-bold mt-1">${data.quick_stats.streak} days 🔥</div></div>
    </div>
    <div class="card p-6 mt-5 flex items-center justify-between">
      <div><div class="font-bold text-lg">Ready to continue?</div><div class="text-sm text-zinc-500">Fi aseɛ — start a new study session</div></div>
      <a href="#/study_activities" class="btn-primary">Start Learning</a>
    </div>
  `;
}
