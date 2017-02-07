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
	
	const currentDate = new Date();
	//let nickB = profile.getAttribute("href").split("/");
	//let nick = nickB[nickB.length-2];
	//console.log("allFn 0");
	profiles.forEach((profileEl, index)=>{
		//console.log("allFn 1", profileEl.querySelector(".siwaBroda"));
		if (profileEl.querySelector(".siwaBroda")) { return false; }
		const avatarEl = profileEl.querySelector(".avatar");
		if (!avatarEl.classList.contains("male") && profileEl !== document.querySelector('.logged-user > a')) {return false;}
		
		const nickB = profileEl.getAttribute("href").split("/");
		const nick = nickB[nickB.length-2];
		profileEl.style = "position: relative;";
		//profile.innerHTML += `<img src="${siwaBroda[0]}"></img>`;

		

		const addSiwaBrodaAndMutation = (profileEl)=> {
			addSiwaBroda(profileEl);

			let profileElObserver = new MutationObserver((mutations)=> {
				//console.log("prifilEl mutation");
				if (2 !== mutations[0].target.querySelector(".profile").childElementCount) {
					//console.log("profil mutation addSiwaBroda");
					addSiwaBroda(mutations[0].target.querySelector(".profile"));
				}
			});
			profileElObserver.observe( profileEl.parentElement.parentElement, {childList: true} );
		};

		if(ages[nick] === undefined) {
			fetch(`http://a.wykop.pl/profile/${nick}/appkey,tss651YJRF`)
			.then((response)=> {
			return response.json();
			}).then((json)=>{
				const singUpDate = new Date(json.signup_date); // np. "2014-11-10 19:07:59"
				const age = Math.floor((currentDate - singUpDate) / 31557600000); // 31557600000 is 24 * 3600 * 365.25 * 1000 which is the length of a year
				
				if (age >= 0) {
					ages[nick] = age;
					localStorage.setItem("ages", JSON.stringify(ages));

					addSiwaBrodaAndMutation(profileEl);
				} else if (json.error.code === 13) {
					console.log("error code 13", json, nick, ":", currentDate, "-", singUpDate, `(${json.signup_date}) =`, age);
				} else {
					console.log("error !age >= 0", json, nick, ":", currentDate, "-", singUpDate, `(${json.signup_date}) =`, age);
					const errString = `<img class="siwaBroda" src="" alt="[Error]" style="font-size: 11px; display: flex; position: absolute; left: 0;" title='Brody nie dodano z powodu błędu po stronie Wykop API: "${json.error.message}".\nPoproś administrację i moderację o zwiększenie limitu żądań dla dodatku "Siwa Broda".\nNapisz do #moderacja #administracja na mikroblogu lub w prywatnej wiadomości.\n[Komunikat dodatku: "Siwa Broda"]'></img>`;
					appendChild(profileEl, errString);

					let profileElErrObserver = new MutationObserver((mutations)=> {
						//console.log("profilEl mutation");
						if (2 !== mutations[0].target.querySelector(".profile").childElementCount) {
							//console.log("profil mutation errString");
							mutations[0].target.querySelector(".profile").style = "position: relative;";
							appendChild(mutations[0].target.querySelector(".profile"), errString);
						}
					});
					profileElErrObserver.observe( profileEl.parentElement.parentElement, {childList: true} );
				}
			}).catch((error)=>{
				console.log(error);
				const errString = `<img class="siwaBrodaError" src="" alt="[Error]" style="font-size: 11px; display: flex; position: absolute; left: 0;" title='Brody nie dodano z powodu błędu po stronie Wykop API: "${json.error.message}".\nPoproś administrację i moderację o zwiększenie limitu żądań dla dodatku "Siwa Broda".\nNapisz do #moderacja #administracja na mikroblogu lub w prywatnej wiadomości.\n[Komunikat dodatku: "Siwa Broda"]'></img>`;
				appendChild(profileEl, errString);

				let profileElCatchObserver = new MutationObserver((mutations)=> {
					//console.log("profilEl mutation");
					if (2 !== mutations[0].target.querySelector(".profile").childElementCount) {
						//console.log("profil mutation addSiwaBroda");
						mutations[0].target.querySelector(".profile").style = "position: relative;";
						appendChild(mutations[0].target.querySelector(".profile"), errString);
					}
				});
				profileElCatchObserver.observe( profileEl.parentElement.parentElement, {childList: true} );
			});
		} else {
			addSiwaBrodaAndMutation(profileEl);
		}
		//console.log("allFn");
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
