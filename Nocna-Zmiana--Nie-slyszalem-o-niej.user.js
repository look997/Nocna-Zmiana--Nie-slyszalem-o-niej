// ==UserScript==
// @name		Nocna Zmiana? Nie słyszałem o niej.
// @namespace		https://www.wykop.pl/ludzie/look997/
// @description		 Ukrywa wszystkie wpisy dodanych od 00:00 do 6:00 w serwisie Wykop.pl, z tzw. "Nocnej zmiany" oraz wpisy bez tagów (wszystko da się ustawić pod siebie).
// @author		look997
// @version		0.3 beta
// @grant		none
// @include		https://www.wykop.pl/*
// @date           2017-08-22
// @resource       metadata 
// @downloadURL    
// @updateURL      
// @run-at 		document-end
// ==/UserScript==

"use strict";

function main() {
	"use strict";
	
	

	// USTWIENIA
	
		// Godziny ukrywane:
		const startHiddingHour = 0; // tylko pełne godziny: 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23
		const stopHiddingHour = 6; // tylko pełne godziny: 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23
		
		// Ukrywanie - włącz/wyłącz:
		const hideHours = true; // ukrywa wpisy w [ustawionych] godzinach
		const hideNoTag = true; // ukrywa wpisy bez tagów
		
		// Tylko oznaczenie czerwoną ramką - włącz/wyłącz:
		const markHours = true; // oznacza czerwoną ramką wpisy w [ustawionych] godzinach
		const markNoTag = true; // oznacza czerwoną ramką wpisy bez tagów
	
	// Koniec USTAWIEŃ


	let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

	function appendChild (parentEl, stringEl) {
		const spanEl = document.createElement("span");
		spanEl.innerHTML = stringEl;
		parentEl.appendChild(spanEl.firstElementChild);
	}

	
	const allFn = (scopeEl)=> {
	console.log("allFn 0");
	
	const EntryEls = Array.prototype.slice.call(document.querySelectorAll("#itemsStream > .entry"));
	//console.log(EntryEls);
	EntryEls.forEach((entryEl)=>{
		const entryDate = entryEl.querySelector("time").title;
		const hour = entryDate.split(" ")[1].split(":")[0];
		const tagExist = entryEl.querySelector(".text").querySelector(".showTagSummary");
		console.log(tagExist);
		//if((!hideNoTag && hour >= startHiddingHour && hour <= stopHiddingHour-1) || (hideNoTag && !tagExist)) {
		if (hour >= startHiddingHour && hour <= stopHiddingHour-1) {
			if (hideHours) {
				entryEl.style.display = "none";
			}
			if (markHours) {
				entryEl.style.borderRight = "3px solid #a22a2a";
				//entryEl.style.backgroundColor = "#412c2c";
			}
			console.log(entryEl);
		}
		if (!tagExist) {
			if (hideNoTag) {
				entryEl.style.display = "none";
			}
			if (markNoTag) {
				entryEl.style.borderRight = "3px solid #a22a2a";
				//entryEl.style.backgroundColor = "#412c2c";
			}
		}
	});
	


}
allFn(document);

	let subStreamFn = (target)=> {
		//console.log("wpis allFn", target);
		let childCount = target.childElementCount;
		target.setAttribute("data-childCount", childCount);
		allFn(target);
	}

	let subObserver = new MutationObserver(function(mutations) {
		let target = mutations[0].target;
		subStreamFn(target);
	});



	let wpisZeroObserver = new MutationObserver(function(mutations) {
		let liEl = mutations[0].target;
		let subEl = liEl.querySelector(".sub");
		//console.log("MOcommentsLi");
		if (liEl.childElementCount !== 1 && subEl) {
			//console.log("MOcommentsLi2");
			allFn(subEl);
			let subElChildCount = subEl.childElementCount;
			subEl.setAttribute("data-childCount", subElChildCount);
			subObserver.observe( subEl, {childList: true} );

			//console.log("MOcommentsLi3");
		}
	});

	let subZeroFn = ()=> {
		const streamElChildren = Array.prototype.slice.call( document.querySelector(".comments-stream").children );

		streamElChildren.forEach((liEl)=>{
			//console.log("commentsLi");
			if (liEl.childElementCount === 1) {
				//console.log("commentsLi2");
				wpisZeroObserver.observe( liEl, {childList: true} );
			}
		});
	}

	let streamObserver = new MutationObserver(function(mutations) {
		//console.log("streamO-1");
		let target = mutations[0].target;
		//console.log("streamO0");
		subStreamFn(target);
		
		subZeroFn();
	});

	const subEls = Array.prototype.slice.call( document.querySelectorAll(".sub") );

	subEls.forEach((subEl)=>{
		if (!subEl.hasAttribute("data-childCount")) {
			let subElChildCount = subEl.childElementCount;
			subEl.setAttribute("data-childCount", subElChildCount);
			subObserver.observe( subEl, {childList: true} );
		}
	});

	subZeroFn();

	const wpis = location.pathname.split("/")[1];
	if (wpis !== "wpis") {
		//console.log("wpis");
		const streamEl = document.querySelector(".comments-stream");
		if (!streamEl.hasAttribute("data-childCount")) {
			//console.log("stream has child");
			let streamElChildCount = streamEl.childElementCount;
			streamEl.setAttribute("data-childCount", streamElChildCount);
			streamObserver.observe( streamEl, {childList: true} );
			//console.log("stream has child end");
		}
	}
}

if (typeof $ == 'undefined') {
	if (typeof unsafeWindow !== 'undefined' && unsafeWindow.jQuery) {
		// Firefox
		var $ = unsafeWindow.jQuery;
		main();
	} else {
		// Chrome
		addJQuery(main);
	}
} else {
	// Opera >.>
	main();
}

function addJQuery(callback) {
	var script = document.createElement("script");
	script.textContent = "(" + callback.toString() + ")();";
	document.body.appendChild(script);
}
