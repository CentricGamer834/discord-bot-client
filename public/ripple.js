// function Ripple(element) {
// 	const ripple = document.createElement("div");
// 	const rect = element.getBoundingClientRect();

// 	ripple.style.position = "absolute";
// 	ripple.style.zIndex = 10000;
// 	ripple.style.pointerEvents = "none";
// 	ripple.style.backgroundColor = "rgba(200, 200, 200)";
// 	ripple.style.transition = "all 300ms cubic-bezier(0.4, 0, 0.2, 1)";
// 	ripple.style.transform = "scale(0)";
// 	ripple.style.opacity = 0.3;

// 	ripple.style.left = rect.left + "px";
// 	ripple.style.top = rect.top + document.body.scrollTop + document.documentElement.scrollTop + "px";

// 	ripple.style.width = rect.width + "px";
// 	ripple.style.height = rect.height + "px";

// 	setTimeout(() => ripple.style.transform = "scale(1)", 0);

// 	document.body.appendChild(ripple);

// 	function Recycle() {
// 		ripple.style.opacity = 0;
// 		setTimeout(() => ripple.remove(), 400);
// 	}


// 	element.onpointerdown = Work;

// 	element.onpointerup = Recycle;
// 	element.onmouseleave = Recycle;
// 	element.ontouchmove = Recycle;
// 	element.ontouchend = Recycle;
// }

// setInterval(() => document.querySelectorAll("a, button[type=submit]").forEach(Ripple))