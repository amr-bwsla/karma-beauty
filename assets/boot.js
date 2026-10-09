// Inlined in <head>, before styles/body, in both preview and WordPress.
(() => {
 'use strict';
 const root=document.documentElement;
 const cookie=document.cookie.match(/(?:^|;\s*)karma_language=(en|ar)(?:;|$)/)?.[1];
 let language=cookie||'en',dismissed=false;
 try {
  const saved=localStorage.getItem('karma-language');
  if(saved==='en'||saved==='ar')language=saved;
  dismissed=localStorage.getItem('karma-announcement-dismissed-v1')==='1';
 } catch {/* Cookies preserve the language when storage is unavailable. */}
 root.lang=language;root.dir=language==='ar'?'rtl':'ltr';
 root.classList.add('karma-locale-pending');
 if(dismissed)root.classList.add('karma-announcement-dismissed');
 const reveal=()=>root.classList.remove('karma-locale-pending');
 // A failed/blocked localization script must not leave the whole site invisible.
 const fallback=setTimeout(reveal,8000);
 window.KarmaBoot={language,ready(){clearTimeout(fallback);reveal();}};
})();
