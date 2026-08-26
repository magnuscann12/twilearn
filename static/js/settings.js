import { getTheme, applyTheme } from './app.js';
import { getCurrentUser } from './auth.js';

export function renderSettings(root){
  const currentTheme = getTheme();
  const user = getCurrentUser();
  
  root.innerHTML = `
    <h1 class="text-2xl font-bold mb-4">Settings</h1>
    <div class="space-y-4">
      <div class="card p-4 space-y-4">
        <h2 class="font-semibold text-lg">Appearance</h2>
        <div class="flex items-center justify-between">
          <div><div class="font-medium">Theme</div><div class="text-sm text-zinc-500">Choose your preferred theme</div></div>
          <select id="themeSelect" class="border rounded-lg p-2 bg-transparent" style="border-color:var(--border)">
            <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>Light</option>
            <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>Dark</option>
            <option value="system" ${currentTheme === 'system' ? 'selected' : ''}>System</option>
          </select>
        </div>
      </div>
      
      <div class="card p-4 space-y-4">
        <h2 class="font-semibold text-lg">Study Preferences</h2>
        <div class="flex items-center justify-between">
          <div><div class="font-medium">Daily Goal</div><div class="text-sm text-zinc-500">Words to study per day</div></div>
          <select id="dailyGoal" class="border rounded-lg p-2 bg-transparent" style="border-color:var(--border)">
            <option value="10">10 words</option>
            <option value="20" selected>20 words</option>
            <option value="30">30 words</option>
            <option value="50">50 words</option>
          </select>
        </div>
        <div class="flex items-center justify-between">
          <div><div class="font-medium">Sound Effects</div><div class="text-sm text-zinc-500">Play sounds during activities</div></div>
          <button id="soundToggle" class="toggle-btn w-12 h-6 rounded-full bg-zinc-300 relative">
            <div class="w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-transform"></div>
          </button>
        </div>
      </div>
      
      ${user ? `
        <div class="card p-4 space-y-4">
          <h2 class="font-semibold text-lg">Account</h2>
          <div class="flex items-center justify-between">
            <div><div class="font-medium">Username</div><div class="text-sm text-zinc-500">${user.username}</div></div>
          </div>
          <p class="text-sm text-zinc-500">Use Sign out at the top of the page to leave your account.</p>
        </div>
      ` : `
        <div class="card p-4 space-y-4">
          <h2 class="font-semibold text-lg">Account</h2>
          <p class="text-sm text-zinc-500">Sign in to track your progress across devices</p>
          <button id="loginBtn" class="btn-primary w-full">Sign In</button>
        </div>
      `}
      
      <div class="card p-4">
        <h2 class="font-semibold text-lg mb-2">About</h2>
        <p class="text-sm text-zinc-500">TwiLearn v1.0 - A Twi language learning application</p>
      </div>
    </div>
  `;
  
  // Theme handling
  document.getElementById('themeSelect').onchange = (e) => {
    applyTheme(e.target.value);
  };
  
  // Sound toggle
  document.getElementById('soundToggle').onclick = function() {
    const isOn = this.classList.toggle('bg-green-500');
    this.classList.toggle('bg-zinc-300');
    this.querySelector('div').style.transform = isOn ? 'translateX(24px)' : 'translateX(0)';
    localStorage.setItem('soundEffects', isOn);
  };
  
  // Restore sound setting
  if (localStorage.getItem('soundEffects') === 'true') {
    const soundToggle = document.getElementById('soundToggle');
    soundToggle.classList.add('bg-green-500');
    soundToggle.classList.remove('bg-zinc-300');
    soundToggle.querySelector('div').style.transform = 'translateX(24px)';
  }
  
  if (!user) {
    document.getElementById('loginBtn').onclick = () => {
      window.showLogin();
    };
  }
}
