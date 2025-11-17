const canvas = document.getElementById("seq-canvas");
const ctx = canvas.getContext("2d");

const frameCount = 200;
const imagePath = (i) => `product-imgs/seq_0_${i}.webp`;

const images = [];
let loaded = 0;
let firstImage = null;

// Preload frames
for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = imagePath(i);
  img.onload = () => {
    loaded++;
    if (!firstImage) {
      firstImage = img;
      setupCanvasSize(firstImage);
      drawImageToCanvas(firstImage);
    }
  };
  images.push(img);
}


function setupCanvasSize(img) {
  const DPR = window.devicePixelRatio || 1;

  const isMobile = window.innerWidth <= 768;
  const cssWidth = isMobile
    ? window.innerWidth             // ← Full width على الموبايل
    : Math.min(1000, window.innerWidth * 0.4);

  const aspect = img.naturalWidth / img.naturalHeight || 1.777;
  const cssHeight = Math.min(window.innerHeight * 5, cssWidth / aspect);

  canvas.style.width = cssWidth + "px";
  canvas.style.height = cssHeight + "px";

  canvas.width = Math.round(cssWidth * DPR);
  canvas.height = Math.round(cssHeight * DPR);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(DPR, DPR);
}



function drawImageToCanvas(img) {
  if (!img) return;

  const cssW = parseFloat(getComputedStyle(canvas).width);
  const cssH = parseFloat(getComputedStyle(canvas).height);
  ctx.clearRect(0, 0, cssW, cssH);


  const imgAspect = img.naturalWidth / img.naturalHeight;
  const canvasAspect = cssW / cssH;
  let drawW, drawH, dx, dy;
  if (imgAspect > canvasAspect) {
   
    drawH = cssH;
    drawW = cssH * imgAspect;
  } else {
  
    drawW = cssW;
    drawH = cssW / imgAspect;
  }
  dx = (cssW - drawW) / 2;
  dy = (cssH - drawH) / 2;

  ctx.drawImage(img, dx, dy, drawW, drawH);
}


function updateFrame(index) {
  const img = images[index];
  if (img && img.complete) {
    drawImageToCanvas(img);
  }
}


window.addEventListener("resize", () => {
  if (firstImage) {
    setupCanvasSize(firstImage);
    // redraw current frame (find nearest loaded frame)
    // try to redraw images[activeFrame] if exists; fallback to 0
    if (typeof activeFrameIndex !== "undefined") {
      updateFrame(activeFrameIndex);
    } else {
      drawImageToCanvas(firstImage);
    }
  }
});

// GSAP animation using ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const obj = { frame: 0 };
let activeFrameIndex = 0;

gsap.to(obj, {
  frame: frameCount - 1,
  snap: "frame",
  ease: "none",
  scrollTrigger: {
    trigger: ".main-sec",           // ← الـ section نفسها
    start: "top top",               
    end: "bottom bottom",           // ← الأنيميشن يكمل لآخر الـ section
    scrub: 0.6,
    pin: false,
  },
  onUpdate: () => {
    const frame = Math.round(obj.frame);
    if (frame !== activeFrameIndex) {
      activeFrameIndex = frame;
      updateFrame(frame);
    }
  }
});

// draw initial frame when first image loads if not already drawn
// (this ensures a visible frame even before full preload)
images[0].onload = function () {
  if (!firstImage) {
    firstImage = images[0];
    setupCanvasSize(firstImage);
    drawImageToCanvas(firstImage);
  }
};


// Animation للـ more-img
ScrollTrigger.create({
  trigger: ".card-num1",
  start: "top center",        
  endTrigger: ".card-num3",
  end: "top center",
  onEnter: () => {
    gsap.to(".more-img", { opacity: 1, duration: 0.5 });
  },
  onLeave: () => {
    gsap.to(".more-img", { opacity: 0, duration: 0.5 });
  },
  onEnterBack: () => {
    gsap.to(".more-img", { opacity: 1, duration: 0.5 });
  },
  onLeaveBack: () => {
    gsap.to(".more-img", { opacity: 0, duration: 0.5 });
  },
});




// Timeline للـ final section
const finalTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: ".final-sec",
    start: "top 60%",      
    end: "top 20%",
    scrub: 1,
  }
});

finalTimeline
  // 1. الـ title الأول يظهر
  .to(".final-title", {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power2.out"
  })
  // 2. الـ span + الصور يطلعوا من تحت بتأثير 3D
  .to(".sub-final-text", {
    opacity: 1,
    y: 0,
    z: 0,
    rotateX: 0,
    duration: 1.5,
    ease: "back.out(1.2)"
  }, "+=0.3")  // ← تأخير 0.3 ثانية
  .to(".final-sec .strawberry, .final-sec .biscuit", {
    opacity: 1,
    y: 0,
    z: 0,
    rotateX: 0,
    duration: 1.2,
    stagger: 0.15,  // ← واحدة ورا التانية
    ease: "back.out(1.5)"
  }, "-=1")  // ← تبدأ قبل ما الـ span تخلص بثانية
  .to(".final-sec .arrow1, .final-sec .arrow2", {
    opacity: 1,
    y: 0,
    z: 0,
    rotateX: 0,
    duration: 1,
    stagger: 0.1,
    ease: "back.out(1.3)"
  }, "-=0.8")
  .to(".final-sec .biscuit-img1, .final-sec .biscuit-img2, .final-sec .strawberry-img1, .final-sec .strawberry-img2", {
    opacity: 1,
    y: 0,
    z: 0,
    rotateX: 0,
    duration: 1.5,
    stagger: 0.1,
    ease: "back.out(1.4)"
  }, "-=1.2");