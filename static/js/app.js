
// API layer - calls Django REST Framework backend
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

export const API = {
  async checkAuth() {
    try {
      const res = await fetch('/api/check-auth/', {
        credentials: 'same-origin'
      });
      const data = await res.json();
      if (data.authenticated && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data.authenticated;
    } catch (e) {
      console.error('Auth check error:', e);
      return false;
    }
  },
  async getDashboard() {
    try {
      const [sessionsRes, wordsRes, groupsRes] = await Promise.all([
        fetch('/api/study-sessions/', { credentials: 'same-origin' }),
        fetch('/api/words/', { credentials: 'same-origin' }),
        fetch('/api/groups/', { credentials: 'same-origin' })
      ]);
      
      if (!sessionsRes.ok || !wordsRes.ok || !groupsRes.ok) {
        throw new Error('Authentication required');
      }
      
      const sessions = await sessionsRes.json();
      const words = await wordsRes.json();
      const groups = await groupsRes.json();
      
      const lastSession = sessions.results?.[0] || sessions[0] || {};
      const totalWords = words.results?.length || words.length || 0;
      const totalGroups = groups.results?.length || groups.length || 0;
      const completedSessions = sessions.results?.filter(s => s.completed_at).length || sessions.filter(s => s.completed_at).length || 0;
      
      return {
        last_session: {
          id: lastSession.id || 0,
          activity: lastSession.activity?.name || 'No sessions',
          group: 'All',
          date: lastSession.started_at || 'N/A',
          correct: lastSession.correct_answers || 0,
          wrong: (lastSession.total_questions || 0) - (lastSession.correct_answers || 0)
        },
        progress: { studied: totalWords, total: totalWords + 50, mastery: Math.round((completedSessions / Math.max(sessions.results?.length || sessions.length || 1, 1)) * 100) },
        quick_stats: {
          success_rate: sessions.results?.length || sessions.length ? Math.round((sessions.results?.reduce((a, s) => a + (s.score || 0), 0) || sessions.reduce((a, s) => a + (s.score || 0), 0)) / Math.max(sessions.results?.length || sessions.length, 1)) : 0,
          total_sessions: sessions.results?.length || sessions.length || 0,
          active_groups: totalGroups,
          streak: 0
        }
      };
    } catch (e) {
      console.error('Dashboard API error:', e);
      return {
        last_session: { id: 0, activity: 'No data', group: 'N/A', date: 'N/A', correct: 0, wrong: 0 },
        progress: { studied: 0, total: 0, mastery: 0 },
        quick_stats: { success_rate: 0, total_sessions: 0, active_groups: 0, streak: 0 }
      };
    }
  },
  async getActivities() {
    try {
      const res = await fetch('/api/study-activities/', { credentials: 'same-origin' });
      const data = await res.json();
      const activities = data.results || data;
      const thumbs = { flashcards: '🃏', quiz: '🎧', matching: '🧩' };
      return activities.map(a => ({
        id: a.id,
        name: a.name,
        thumb: thumbs[a.activity_type] || '📚',
        desc: `${a.activity_type} activity`,
        url: `#/study_activities/${a.id}/launch`
      }));
    } catch (e) {
      console.error('Activities API error:', e);
      return [];
    }
  },
  async getGroups() {
    try {
      const res = await fetch('/api/groups/', { credentials: 'same-origin' });
      const data = await res.json();
      return data.results || data;
    } catch (e) {
      console.error('Groups API error:', e);
      return [];
    }
  },
  async getWords() {
    try {
      const res = await fetch('/api/words/', { credentials: 'same-origin' });
      const data = await res.json();
      const words = data.results || data;
      return words.map(w => ({
        id: w.id,
        twi: w.word,
        english: w.translation || '',
        correct: 0,
        wrong: 0,
        groups: w.groups?.map(g => g.id) || []
      }));
    } catch (e) {
      console.error('Words API error:', e);
      return [];
    }
  },
  async getSessions() {
    try {
      const res = await fetch('/api/study-sessions/', { credentials: 'same-origin' });
      const data = await res.json();
      const sessions = data.results || data;
      return sessions.map(s => ({
        id: s.id,
        activity_name: s.activity?.name || 'Unknown',
        group_name: 'All',
        start_time: s.started_at || 'N/A',
        end_time: s.completed_at || 'N/A',
        review_count: s.total_questions || 0
      }));
    } catch (e) {
      console.error('Sessions API error:', e);
      return [];
    }
  }
};

let currentTheme = localStorage.getItem('twi-theme') || 'light';
export function applyTheme(t){ currentTheme=t; localStorage.setItem('twi-theme',t); const isDark = t==='dark' || (t==='system' && window.matchMedia('(prefers-color-scheme:dark)').matches); document.documentElement.classList.toggle('dark', isDark); }
applyTheme(currentTheme);
window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{ if(localStorage.getItem('twi-theme')==='system') applyTheme('system'); });
export function getTheme(){return currentTheme}
