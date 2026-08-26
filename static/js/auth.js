function getCSRFToken() {
  const input = document.querySelector('[name=csrfmiddlewaretoken]');
  if (input && input.value) return input.value;
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      return decodeURIComponent(value);
    }
  }
  return '';
}

export function renderAuthPage(root, mode = 'login') {
  const isLogin = mode === 'login';

  root.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4 py-8">
      <div class="text-center mb-8">
        <div class="text-6xl mb-4">🇬🇭</div>
        <h1 class="text-3xl font-bold">TwiLearn</h1>
        <p class="text-zinc-500 mt-1">AKWAABA — Welcome</p>
      </div>
      <div class="card p-8 max-w-md w-full">
        <div class="flex rounded-full p-1 mb-6" style="background:color-mix(in srgb, var(--border) 70%, transparent)">
          <button id="tabLogin" class="flex-1 py-2 rounded-full text-sm font-semibold ${isLogin ? 'nav-active' : ''}">Sign In</button>
          <button id="tabRegister" class="flex-1 py-2 rounded-full text-sm font-semibold ${!isLogin ? 'nav-active' : ''}">Sign Up</button>
        </div>
        <h2 class="text-xl font-bold mb-4">${isLogin ? 'Sign in to continue' : 'Create your account'}</h2>
        <form id="authForm" class="space-y-4">
          <div>
            <label class="text-sm font-medium">Username</label>
            <input type="text" name="username" required autocomplete="username" class="w-full mt-1 border rounded-xl p-3 bg-transparent" style="border-color:var(--border)">
          </div>
          ${!isLogin ? `
            <div>
              <label class="text-sm font-medium">Email</label>
              <input type="email" name="email" required autocomplete="email" class="w-full mt-1 border rounded-xl p-3 bg-transparent" style="border-color:var(--border)">
            </div>
          ` : ''}
          <div>
            <label class="text-sm font-medium">Password</label>
            <input type="password" name="password" required autocomplete="${isLogin ? 'current-password' : 'new-password'}" class="w-full mt-1 border rounded-xl p-3 bg-transparent" style="border-color:var(--border)">
          </div>
          <p id="authError" class="text-sm text-red-600 hidden"></p>
          <button type="submit" class="btn-primary w-full py-3">${isLogin ? 'Sign In' : 'Create Account'}</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('tabLogin').onclick = () => renderAuthPage(root, 'login');
  document.getElementById('tabRegister').onclick = () => renderAuthPage(root, 'register');

  document.getElementById('authForm').onsubmit = async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('authError');
    errorEl.classList.add('hidden');
    errorEl.textContent = '';
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      if (isLogin) {
        const res = await fetch('/api/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
          },
          credentials: 'same-origin',
          body: JSON.stringify(data)
        });

        if (res.ok) {
          const result = await res.json();
          localStorage.setItem('user', JSON.stringify(result.user));
          location.hash = '#/dashboard';
          window.location.reload();
        } else {
          errorEl.textContent = 'Sign in failed. Please check your username and password.';
          errorEl.classList.remove('hidden');
        }
      } else {
        const res = await fetch('/api/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
          },
          credentials: 'same-origin',
          body: JSON.stringify(data)
        });

        if (res.ok) {
          alert('Account created. Please sign in.');
          renderAuthPage(root, 'login');
        } else {
          const error = await res.json();
          const message = typeof error === 'object'
            ? Object.values(error).flat().join(' ')
            : 'Registration failed.';
          errorEl.textContent = message;
          errorEl.classList.remove('hidden');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      errorEl.textContent = 'An error occurred. Please try again.';
      errorEl.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
    }
  };
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function clearAuth() {
  localStorage.removeItem('user');
}

export function logout() {
  fetch('/api/logout/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    credentials: 'same-origin'
  }).finally(() => {
    clearAuth();
    location.hash = '';
    window.location.reload();
  });
}

export function confirmLogout() {
  if (document.getElementById('logoutConfirmModal')) return;

  const modal = document.createElement('div');
  modal.id = 'logoutConfirmModal';
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4';
  modal.innerHTML = `
    <div class="card p-6 max-w-sm w-full">
      <h2 class="text-xl font-bold mb-2">Sign out?</h2>
      <p class="text-sm text-zinc-500 mb-6">Are you sure you want to sign out of your account?</p>
      <div class="flex gap-3 justify-end">
        <button id="cancelLogout" class="btn-secondary">Cancel</button>
        <button id="confirmLogoutBtn" class="btn-primary">Sign Out</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  document.getElementById('cancelLogout').onclick = close;
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  document.getElementById('confirmLogoutBtn').onclick = () => {
    close();
    logout();
  };
}

export function updateAuthUI() {
  const user = getCurrentUser();
  const authContainer = document.getElementById('authContainer');

  if (!authContainer) return;

  if (user) {
    authContainer.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="text-sm font-medium hidden sm:block">${user.username}</div>
        <button type="button" id="headerLogoutBtn" class="btn-secondary text-sm py-1.5 px-4">Sign out</button>
      </div>
    `;
    document.getElementById('headerLogoutBtn').onclick = confirmLogout;
  } else {
    authContainer.innerHTML = '';
  }
}

window.showLogin = () => renderAuthPage(document.getElementById('app'), 'login');
window.showRegister = () => renderAuthPage(document.getElementById('app'), 'register');
window.logout = confirmLogout;
