// @ts-ignore
const VSCodeLMDate = "2022/01/01 10:49:46";

// @ts-ignore
const diffTime = Math.abs(Date.now() - new Date(VSCodeLMDate).getTime())/1000;
// console.log(VSCodeLMDate, `${Math.floor(diffTime)} secs ago`);

// ==UserScript==
// @name        Nocna Zmiana? Nie słyszałem o niej.
// @description Ukrywa wszystkie wpisy dodanych od 00:00 do 6:00 w serwisie Wykop.pl, z tzw. "Nocnej zmiany" oraz wpisy bez tagów (wszystko da się ustawić pod siebie).
// @version     0.6.2
// @author      look997
// @include     https://www.wykop.pl/*
// @homepageURL https://www.wykop.pl/ludzie/addons/look997/
// @namespace	  https://www.wykop.pl/ludzie/addons/look997/
// @grant       none
// @require     https://greasyfork.org/scripts/437595-wykopobserve/code/WykopObserve.js?version=1002287
// @run-at      document-end
// @downloadURL https://github.com/look997/Nocna-Zmiana--Nie-slyszalem-o-niej/raw/master/Nocna-Zmiana--Nie-slyszalem-o-niej.user.js
// @updateURL   https://github.com/look997/Nocna-Zmiana--Nie-slyszalem-o-niej/raw/master/Nocna-Zmiana--Nie-slyszalem-o-niej.user.js
// @resource    metadata https://github.com/look997/Nocna-Zmiana--Nie-slyszalem-o-niej/raw/master/Nocna-Zmiana--Nie-slyszalem-o-niej.user.js
// @icon        https://www.google.com/s2/favicons?domain=wykop.pl
// @icon64      https://www.google.com/s2/favicons?domain=wykop.pl
// ==/UserScript==

(async function () {
 
	if (document.cookie.includes("us-nznson=nieChcęNznson")) { return false; }
	// document.cookie = "us-nznson=nieChcęNznson; expires=02-02-2222; path=/";
  
  // USTAWIENIA
    
    // Godziny ukrywane:
    const startHiddingHour = 0; // tylko pełne godziny: 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23
    const stopHiddingHour = 7; // tylko pełne godziny: 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23
    
    // Ukrywanie - włącz/wyłącz:
    const hideHours = false; // ukrywa wpisy z [ustawionych] godzin
    const hideNoTag = false; // ukrywa wpisy bez tagów
    
    const nightVision = true; // gdy ustawisz true:
                              // siedzisz w dzień - widzisz tylko dzienną
                              // siedzisz w nocy - widzisz I DZIENNĄ, I NOCNĄ
                              // - taka furtka, gdy chcesz rozdzielić dzień od nocy :)
                              
    // Oznaczenie czerwoną ramką - włącz/wyłącz (wpis z ramką widoczny, gdy hideHours/HideNoTag/nightVision jest na false):
    const markHours = true; // oznacza czerwoną ramką wpisy w [ustawionych] godzinach
    const markNoTag = true; // oznacza czerwoną ramką wpisy bez tagów
    
  // Koniec USTAWIEŃ
  
  const filter = [
    "mikroblog-page-comment",
    "tag-page-comment",
    "moj-page-comment",
    "glowna-page-comment",
    "ludzie-page-wpis-comment",
    
  ];
  // @ts-ignore
  wykopObserve(filter, function ({profileEl, liEl, contentEl}, {place, isFirstTime, nick, authorSex}) {
    const entryDate = liEl.querySelector("time").title;
    const postHour = entryDate.split(" ")[1].split(":")[0];
    
    const hasTags = liEl.querySelector(".text").querySelector(".showTagSummary");
    const isNightPost = postHour >= startHiddingHour && postHour <= stopHiddingHour-1;
    
    if (isNightPost) {
      if (hideHours) {
        liEl.style.display = "none";
      }
      if (markHours) {
        liEl.style.borderRight = "3px solid #a22a2a";
      }
    }
    if (!hasTags) {
      if (hideNoTag) {
        liEl.style.display = "none";
      }
      if (markNoTag) {
        liEl.style.borderRight = "3px solid #a22a2a";
      }
    }
    if ( nightVision && (isNightPost || !hasTags) ) {
      const currentHour = new Date().getHours();
      
      if ( !(currentHour >= startHiddingHour && currentHour <= stopHiddingHour-1) ) {
        liEl.style.display = "none";
      }
    }
    
  }, {once:true});
  
  // INIT End
  
})()
