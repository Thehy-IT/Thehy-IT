/**
 * Interactive Data Science Mascot: "TensorBot" (Linh vật nhìn theo chuột)
 * 
 * Features:
 * - Lifelike mouse tracking: pupils, eyes, and 3D head rotate smoothly towards cursor
 * - Sinusoidal levitation & gentle hover physics
 * - Periodic natural blinking and expressive eye modes (normal, excited, thinking, surprised)
 * - Interactive speech bubbles with Data Science wisdom & portfolio guide
 * - Click reactions (3D barrel roll spin + synthesized cyber voice chirp)
 * - Section-aware contextual tips as user scrolls through the portfolio
 */

class TensorMascot {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.avatar = this.container.querySelector('.mascot-avatar') || this.container.querySelector('.mascot-head');
    this.head = this.container.querySelector('.mascot-head');
    this.highlight = this.container.querySelector('.helmet-highlight');
    this.eyeLeft = this.container.querySelector('.mascot-eye-left .pupil');
    this.eyeRight = this.container.querySelector('.mascot-eye-right .pupil');
    this.mouth = this.container.querySelector('.mascot-mouth');
    this.speechBubble = this.container.querySelector('.mascot-speech-bubble');
    this.speechText = this.container.querySelector('.mascot-speech-text');
    this.antennaLight = this.container.querySelector('.antenna-light');

    this.btnToggle = document.getElementById('btn-toggle-mascot');
    this.compactBadge = document.getElementById('mascot-compact-badge');

    // Mouse tracking vectors
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.currentRotation = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.currentPupil = { x: 0, y: 0 };
    this.targetPupil = { x: 0, y: 0 };

    // Mascot state
    this.isBlinking = false;
    this.isSpinning = false;
    this.isMinimized = false;
    this.speechTimeout = null;
    this.lastSpokenSection = '';
    this.quoteIndex = 0;

    // Quotes and Data Science tips
    this.quotes = [
      "Chào bạn! Tôi là TensorBot, linh vật trợ lý AI của Huỳnh Thế Hy! 👋",
      "Dữ liệu không nói dối — chỉ cần ta biết trích xuất insight chính xác! 📊",
      "Đang tối ưu hàm mất mát J(θ)... Gradient descent đã hội tụ! 📉",
      "Hệ thống NoSQL 5 tầng phân bổ: Redis hot-cache -> MongoDB document store ⚡",
      "Bạn có biết: Chuẩn hóa CSDL đến 3NF giúp triệt tiêu hoàn toàn dị thường dư thừa dữ liệu? 🗄️",
      "Thế Hy đang hướng tới vị trí IT Project Manager với chiều sâu kỹ thuật Data & AI! 🎯",
      "Đừng quên thử nghiệm huấn luyện mô hình ngay ở phần Interactive ML Lab bên dưới nhé! 🧪",
      "Overfitting xảy ra khi mô hình học thuộc lòng dữ liệu huấn luyện thay vì tìm ra quy luật! 🧠"
    ];

    this.init();
  }

  init() {
    // Mouse listener
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    // Touch support for mobile
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });

    // Mascot Click Reaction
    const clickTarget = this.avatar || this.head;
    if (clickTarget) {
      clickTarget.addEventListener('click', (e) => {
        e.stopPropagation();
        this.triggerReaction();
      });
    }

    // Toggle Minimize / Restore
    if (this.btnToggle) {
      this.btnToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.minimize();
      });
    }

    if (this.compactBadge) {
      this.compactBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        this.restore();
      });
    }

    // Blinking timer
    this.scheduleBlink();

    // Start tracking loop
    this.update();

    // Show initial greeting after 1.5 seconds
    setTimeout(() => {
      this.say(this.quotes[0], 5000);
    }, 1500);

    // Contextual scroll listener
    this.initScrollWatcher();
  }

  minimize() {
    this.isMinimized = true;
    this.container.classList.add('minimized');
    if (this.speechBubble) this.speechBubble.classList.remove('active');
    if (window.cyberAudio) window.cyberAudio.playClick();
  }

  restore() {
    this.isMinimized = false;
    this.container.classList.remove('minimized');
    this.say("TensorBot đã quay trở lại! 🚀", 3500);
    if (window.cyberAudio) window.cyberAudio.playMascotSpeak();
  }

  scheduleBlink() {
    const nextBlink = 2500 + Math.random() * 4000;
    setTimeout(() => {
      this.blink();
      this.scheduleBlink();
    }, nextBlink);
  }

  blink() {
    if (this.isBlinking) return;
    this.isBlinking = true;
    this.container.classList.add('mascot-blinking');
    setTimeout(() => {
      this.container.classList.remove('mascot-blinking');
      this.isBlinking = false;
    }, 160);
  }

  triggerReaction() {
    if (this.isSpinning) return;
    this.isSpinning = true;

    // Play cyber voice sound
    if (window.cyberAudio) {
      window.cyberAudio.playMascotSpeak();
    }

    // 3D Spin Animation
    this.container.classList.add('mascot-reacting');
    
    // Cycle quote
    this.quoteIndex = (this.quoteIndex + 1) % this.quotes.length;
    this.say(this.quotes[this.quoteIndex], 5500);

    setTimeout(() => {
      this.container.classList.remove('mascot-reacting');
      this.isSpinning = false;
    }, 1000);
  }

  say(text, duration = 4000) {
    if (!this.speechBubble || !this.speechText) return;
    
    this.speechText.textContent = text;
    this.speechBubble.classList.add('active');

    if (this.speechTimeout) clearTimeout(this.speechTimeout);
    this.speechTimeout = setTimeout(() => {
      this.speechBubble.classList.remove('active');
    }, duration);
  }

  initScrollWatcher() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          if (sectionId !== this.lastSpokenSection) {
            this.lastSpokenSection = sectionId;
            this.onSectionEnter(sectionId);
          }
        }
      });
    }, { threshold: 0.4 });

    document.querySelectorAll('section[id]').forEach(sec => observer.observe(sec));
  }

  onSectionEnter(sectionId) {
    const sectionTips = {
      'about': "Khám phá câu chuyện & định hướng IT Project Manager của Thế Hy nhé! 🎓",
      'specializations': "4 trụ cột chuyên sâu: Data Engineering, Data Mining, ML & Deep Learning! 📊",
      'ml-lab': "Thử nghiệm kéo chỉnh Learning Rate và nhấn 'Huấn luyện mô hình' xem ranh giới phân lớp! 🧪",
      'pipeline': "Kiến trúc kho dữ liệu 5 lớp chịu tải cao với Redis cache và MongoDB! ⚡",
      'projects': "Mỗi project đều có source code, tài liệu và kiến trúc thực tế! 🚀",
      'tech-stack': "Tech stack từ Python, T-SQL, Docker đến scikit-learn & TensorFlow! 🧰",
      'terminal': "Bạn có thể gõ các lệnh 'help', 'skills', 'predict' vào terminal để tương tác! 💻",
      'roadmap': "Lộ trình rõ ràng từ nền tảng đến dẫn dắt các dự án kỹ thuật Data & AI! 🗺️",
      'contact': "Đừng ngần ngại gửi email hoặc kết nối LinkedIn với Thế Hy nha! 📬"
    };

    if (sectionTips[sectionId]) {
      this.say(sectionTips[sectionId], 4500);
    }
  }

  update() {
    // Calculate vector from mascot center to mouse cursor
    const rect = this.container.getBoundingClientRect();
    const mascotCenterX = rect.left + rect.width / 2;
    const mascotCenterY = rect.top + rect.height / 2;

    const dx = this.mouse.x - mascotCenterX;
    const dy = this.mouse.y - mascotCenterY;
    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    // Compute target 3D head rotation (Pitch & Yaw)
    const maxRotateX = 26; // degrees
    const maxRotateY = 32; // degrees
    
    // Normalized screen delta (-1 to 1)
    const normX = Math.max(-1, Math.min(1, dx / (window.innerWidth * 0.5)));
    const normY = Math.max(-1, Math.min(1, dy / (window.innerHeight * 0.5)));

    this.targetRotation.y = normX * maxRotateY;
    this.targetRotation.x = -normY * maxRotateX;

    // Compute eye pupil translation (bounded within visor eye sockets)
    const maxPupilRadius = 7.5; // pixels
    const pupilDist = Math.min(distance / 25, maxPupilRadius);
    this.targetPupil.x = Math.cos(angle) * pupilDist;
    this.targetPupil.y = Math.sin(angle) * pupilDist;

    // Smooth interpolation (lerp) for lifelike fluid physics
    const lerpFactor = 0.12;
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * lerpFactor;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * lerpFactor;

    this.currentPupil.x += (this.targetPupil.x - this.currentPupil.x) * lerpFactor;
    this.currentPupil.y += (this.targetPupil.y - this.currentPupil.y) * lerpFactor;

    // Apply 3D Head Transformation
    if (this.head && !this.isSpinning) {
      this.head.style.transform = `perspective(600px) rotateX(${this.currentRotation.x.toFixed(2)}deg) rotateY(${this.currentRotation.y.toFixed(2)}deg)`;
    }

    // Dynamic light reflection glare shift on helmet highlight based on mouse angle
    if (this.highlight) {
      const glintX = (-normX * 5).toFixed(1);
      const glintY = (-normY * 3).toFixed(1);
      this.highlight.style.transform = `translate(${glintX}px, ${glintY}px) rotate(-8deg)`;
    }

    // Apply Pupil Translation
    const pupilTransform = `translate(${this.currentPupil.x.toFixed(2)}px, ${this.currentPupil.y.toFixed(2)}px)`;
    if (this.eyeLeft) this.eyeLeft.style.transform = pupilTransform;
    if (this.eyeRight) this.eyeRight.style.transform = pupilTransform;

    requestAnimationFrame(() => this.update());
  }
}

// Initialize mascot on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.tensorMascot = new TensorMascot('tensor-mascot-widget');
});
