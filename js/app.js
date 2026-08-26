
// Mock API layer - replace with real fetch
export const API = {
  async checkAuth() {
    return !!localStorage.getItem('user');
  },
  async getDashboard() {
    return {
      last_session: { id:12, activity:"Flashcards", group:"Greetings", date:"2026-08-22 19:40", correct:14, wrong:3 },
      progress: { studied:24, total:150, mastery:2 },
      quick_stats: { success_rate:80, total_sessions:4, active_groups:3, streak:4 }
    }
  },
  async getActivities() {
    return [
      {id:1, name:"Flashcards", thumb:"🃏", desc:"Classic flashcard review - Twi → English", url:"https://example.com/flash"},
      {id:2, name:"Listening Quiz", thumb:"🎧", desc:"Hear Twi and choose English", url:"https://example.com/listen"},
      {id:3, name:"Typing Challenge", thumb:"⌨️", desc:"Type Twi translation from English prompt", url:"https://example.com/type"},
      {id:4, name:"Matching Game", thumb:"🧩", desc:"Match Twi words to English quickly", url:"https://example.com/match"},
    ]
  },
  async getGroups() { return [{id:1,name:"Greetings",word_count:24},{id:2,name:"Food & Market",word_count:42},{id:3,name:"Family",word_count:18},{id:4,name:"Everyday Verbs",word_count:66}]; },
  async getWords() {
    const base = ["Maakye","Mema wo akye","Agoo","Ameɛ","Yaa anɔpa","Me din de","Medaase","Akwaaba","Wo ho te sɛn?","Eye","Bɔkɔɔ","Nsuo","Abɔfra","Ɛna","Agya","Adwuma","Sukuu","Kɔ","Bra","Di","Nom","Kasa","Te","Hu","Kanea","Pon","Nkwa","Dɔ","Asomdwoe"];
    return base.map((twi,i)=>({id:i+1,twi, english:["Good morning","Good morning (reply)","Knock knock","Amen","Good morning response","My name is","Thank you","Welcome","How are you?","Good","Slowly","Water","Child","Mother","Father","Work","School","Go","Come","Eat","Drink","Speak","Listen","See","Light","Table","Life","Love","Peace"][i%29], correct:Math.floor(Math.random()*20), wrong:Math.floor(Math.random()*6), groups:[1,2]}));
  },
  async getSessions() {
    return Array.from({length:12},(_,i)=>({id:12-i, activity_name:["Flashcards","Listening Quiz","Typing"][i%3], group_name:["Greetings","Food & Market","Family"][i%3], start_time:`2026-08-${20-(i%5)} 18:0${i%6}`, end_time:`2026-08-${20-(i%5)} 18:1${i%6}`, review_count:10+((i*3)%10)}));
  }
};

let currentTheme = localStorage.getItem('twi-theme') || 'light';
export function applyTheme(t){ currentTheme=t; localStorage.setItem('twi-theme',t); const isDark = t==='dark' || (t==='system' && window.matchMedia('(prefers-color-scheme:dark)').matches); document.documentElement.classList.toggle('dark', isDark); }
applyTheme(currentTheme);
window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{ if(localStorage.getItem('twi-theme')==='system') applyTheme('system'); });
export function getTheme(){return currentTheme}
