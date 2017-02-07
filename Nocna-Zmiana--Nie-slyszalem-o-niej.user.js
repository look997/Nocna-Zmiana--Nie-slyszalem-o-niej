// ==UserScript==
// @name		Nocna Zmiana? Nie słyszałem o niej.
// @namespace		http://www.wykop.pl/ludzie/look997/
// @description		 Blokuje wyświetlanie wszystkich wpisów dodanych od 24:00 do 6:00 w serwisie Wykop.pl, z tzw. "Nocnej zmiany".
// @author		look997
// @version		0.1 beta
// @grant		none
// @include		http://www.wykop.pl/*
// @date           2017-02-07
// @resource       metadata 
// @downloadURL    
// @updateURL      
// @run-at 		document-end
// ==/UserScript==

"use strict";


function main() {
	"use strict";
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
		if(hour >= 0 && hour <= 5) {
			//entryEl.style.border = "3px solid red";
			console.log(entryEl);
			entryEl.style.display = "none";
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
