// Client-side only, no real security. Change these two values to set the login.
const NICK='admin',PASS='change-me';
export const ok=()=>localStorage.getItem('tl_session')==='1';
export const login=(n,p)=>n===NICK&&p===PASS&&(localStorage.setItem('tl_session','1'),true);
export const logout=()=>localStorage.removeItem('tl_session');
