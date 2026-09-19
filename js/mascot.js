/**
 * Interactive Data Science Mascot: "TensorBot" (Linh vật trợ lý AI 3D có hồn)
 * 
 * Lifelike Organic Behaviors:
 * - 3D Curiosity Head Tilt (Pitch rotateX, Yaw rotateY, and Roll rotateZ curiosity angle)
 * - Organic ocular physics: Smooth pursuit gaze + micro-saccades when stationary
 * - Double catchlights corneal 3D depth shift & helmet dome specular glare tracking
 * - Natural biological double-blinking schedule (periodic + occasional quick double-blinks)
 * - Expressive Mood State Machine: normal, happy, curious, sleepy, wink, excited
 * - Floating holographic mood halo with dynamic animated emote glyphs (✨, 💡, ❤️, ⚡, 👋, 💤)
 * - Circadian sleep / wake cycle: Snoozes into slumber after 14s idle, wakes with alert bounce
 * - Interactive waving greeting: Floating magnetic robotic hand waves (👋) upon hover
 * - Floating magnetic hands physics: Inertial zero-G tethered motion lagging head rotation
 * - 3D barrel-roll physical spin reaction + synthesized cyber audio voice chirps
 * - Section-aware contextual tips paired with emotional gestures & matching halo glyphs
 * - Accessibility & performance conscious: Damped lerp, prefers-reduced-motion support
 */

class TensorMascot {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // DOM Elements
    this.avatar = this.container.querySelector('.mascot-avatar') || this.container.querySelector('.mascot-head');
    this.head = this.container.querySelector('.mascot-head');
    this.highlight = this.container.querySelector('.helmet-highlight');
    this.eyeLeftPupil = this.container.querySelector('.mascot-eye-left .pupil');
    this.eyeRightPupil = this.container.querySelector('.mascot-eye-right .pupil');
    this.eyeGlints = this.container.querySelectorAll('.eye-glint');
    this.mouth = this.container.querySelector('.mascot-mouth');
    this.speechBubble = this.container.querySelector('.mascot-speech-bubble');
    this.speechText = this.container.querySelector('.mascot-speech-text');
    this.antennaLight = this.container.querySelector('.antenna-light');
    this.halo = document.getElementById('mascot-mood-halo');
    this.haloIcon = document.getElementById('mascot-mood-icon');
    this.handLeft = document.getElementById('mascot-hand-left');
    this.handRight = document.getElementById('mascot-hand-right');

    // Controls
    this.btnToggle = document.getElementById('btn-toggle-mascot');
    this.compactBadge = document.getElementById('mascot-compact-badge');

    // Reduced motion check
    this.prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Spatial & tracking vectors
    this.mouse = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.4 };
    this.currentRotation = { x: 0, y: 0, z: 0 };
    this.targetRotation = { x: 0, y: 0, z: 0 };
    this.currentPupil = { x: 0, y: 0 };
    this.targetPupil = { x: 0, y: 0 };
    this.saccade = { x: 0, y: 0 };

    // Behavioral state machine
    this.currentMood = 'normal'; // 'normal' | 'happy' | 'curious' | 'sleepy' | 'wink' | 'excited'
    this.moodTimeout = null;
    this.isBlinking = false;
    this.isSpinning = false;
    this.isSleeping = false;
    this.isHovered = false;
    this.isMinimized = false;
    this.speechTimeout = null;
    this.lastSpokenSection = '';
    this.quoteIndex = 0;

    // Activity tracking for sleep/wake cycle
    this.lastActivityTime = Date.now();
    this.idleSleepDelay = 14000; // 14 seconds of inactivity enters sleep mode
    this.saccadeTimer = null;

    // Data Science & IT PM Wisdom Quotes
    this.quotes = [
      "Chào bạn! Tôi là TensorBot, linh vật trợ lý AI của Huỳnh Thế Hy! 👋",
      "Dữ liệu không nói dối — chỉ cần ta biết trích xuất insight chính xác! 📊",
      "Đang tối ưu hàm mất mát J(θ)... Gradient descent đã hội tụ! 📉",
      "Hệ thống NoSQL 5 tầng phân bổ: Redis hot-cache -> MongoDB document store ⚡",
      "Bạn có biết: Chuẩn hóa CSDL đến 3NF giúp triệt tiêu hoàn toàn dị thường dư thừa dữ liệu? 🗄️",
      "Thế Hy đang hướng tới vị trí IT Project Manager với chiều sâu kỹ thuật Data & AI! 🎯",
      "Đừng quên thử nghiệm huấn luyện mô hình ngay ở phần Interactive ML Lab bên dưới nhé! 🧪",
      "Overfitting xảy ra khi mô hình học thuộc lòng dữ liệu huấn luyện thay vì tìm ra quy luật! 🧠",
      "Dự án tốt không chỉ cần thuật toán tối ưu, mà cần quy trình quản lý dự án Agile vững vàng! 🚀"
    ];

    // Mood Emoji Glyph Mapping
    this.moodIcons = {
      normal: '✨',
      happy: '😊',
      curious: '💡',
      sleepy: '💤',
      wink: '😉',
      excited: '🚀'
    };

    this.init();
  }

  init() {
    // Pointer tracking
    const onPointerMove = (x, y) => {
      this.mouse.x = x;
      this.mouse.y = y;
      this.onUserActivity();
    };

    window.addEventListener('mousemove', (e) => {
      onPointerMove(e.clientX, e.clientY);
    });

    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('scroll', () => {
      this.onUserActivity();
    }, { passive: true });

    // Hover greeting & waving interaction
    if (this.container) {
      this.container.addEventListener('mouseenter', () => {
        this.onHoverEnter();
      });

      this.container.addEventListener('mouseleave', () => {
        this.onHoverLeave();
      });
    }

    // Physical click / tap reaction (3D barrel roll & cyber chirp)
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

    // Close Speech Bubble button
    const btnCloseSpeech = document.getElementById('btn-close-mascot-speech');
    if (btnCloseSpeech) {
      btnCloseSpeech.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideSpeech();
        if (window.cyberAudio) window.cyberAudio.playClick();
      });
    }

    // Start biological natural blinking loop
    this.scheduleBlink();

    // Start subtle micro-saccades for organic gaze realism
    this.scheduleSaccade();

    // Start continuous 60fps render loop
    this.update();

    // Contextual scroll observer
    this.initScrollWatcher();

    // Initial warm welcoming greeting
    setTimeout(() => {
      this.setMood('happy', 4500);
      this.say(this.quotes[0], 5200);
    }, 1400);
  }

  // ================= MOOD STATE MACHINE =================
  setMood(mood, duration = 0) {
    if (!this.container || !this.avatar) return;

    // Clean prior mood classes
    const moods = ['mood-normal', 'mood-happy', 'mood-curious', 'mood-sleepy', 'mood-wink', 'mood-excited'];
    this.container.classList.remove(...moods);
    this.avatar.classList.remove(...moods);

    this.currentMood = mood;

    if (mood !== 'normal') {
      const moodClass = `mood-${mood}`;
      this.container.classList.add(moodClass);
      this.avatar.classList.add(moodClass);
    }

    // Update holographic halo emote glyph
    if (this.halo && this.haloIcon) {
      const icon = this.moodIcons[mood] || '✨';
      this.haloIcon.textContent = icon;

      if (mood !== 'normal' || this.isSleeping) {
        this.halo.classList.add('active');
      } else {
        this.halo.classList.remove('active');
      }
    }

    // Auto revert after duration
    if (this.moodTimeout) clearTimeout(this.moodTimeout);
    if (duration > 0 && mood !== 'normal') {
      this.moodTimeout = setTimeout(() => {
        if (!this.isSleeping && !this.isHovered) {
          this.setMood('normal');
        }
      }, duration);
    }
  }

  // ================= HOVER & WAVING GREETING =================
  onHoverEnter() {
    this.isHovered = true;
    this.onUserActivity();

    // Start waving gesture with floating robotic right hand
    if (this.avatar) {
      this.avatar.classList.add('is-waving');
    }

    // Cheerful reaction
    this.setMood('happy', 4000);
    if (this.haloIcon) this.haloIcon.textContent = '👋';
    if (this.halo) this.halo.classList.add('active');

    // Friendly soft chirp
    if (window.cyberAudio && Math.random() > 0.4) {
      window.cyberAudio.playChirp();
    }
  }

  onHoverLeave() {
    this.isHovered = false;
    if (this.avatar) {
      this.avatar.classList.remove('is-waving');
    }

    if (!this.isSleeping) {
      setTimeout(() => {
        if (!this.isHovered && !this.isSleeping) {
          this.setMood('normal');
        }
      }, 1500);
    }
  }

  // ================= SLEEP & WAKE-UP DYNAMICS =================
  onUserActivity() {
    this.lastActivityTime = Date.now();
    if (this.isSleeping) {
      this.wakeUp();
    }
  }

  fallAsleep() {
    if (this.isSleeping || this.isHovered || this.isSpinning) return;
    this.isSleeping = true;
    this.setMood('sleepy');

    if (this.haloIcon) this.haloIcon.textContent = '💤';
    if (this.halo) this.halo.classList.add('active');
  }

  wakeUp() {
    if (!this.isSleeping) return;
    this.isSleeping = false;

    // Alert perk-up reaction
    this.setMood('excited', 1800);
    if (this.haloIcon) this.haloIcon.textContent = '⚡';
    if (this.halo) this.halo.classList.add('active');

    // Chime chirp
    if (window.cyberAudio) {
      window.cyberAudio.playChirp();
    }

    // Brief joyful wave
    if (this.avatar) {
      this.avatar.classList.add('is-waving');
      setTimeout(() => {
        if (!this.isHovered) {
          this.avatar.classList.remove('is-waving');
        }
      }, 1600);
    }
  }

  // ================= BIOLOGICAL BLINKING =================
  scheduleBlink() {
    // Realistic interval: between 3.2s and 6.5s (longer when sleepy)
    const baseDelay = this.isSleeping ? 6500 : 3200;
    const randomDelay = Math.random() * (this.isSleeping ? 5000 : 3500);
    const nextBlink = baseDelay + randomDelay;

    setTimeout(() => {
      if (!this.isSpinning) {
        this.blink();
      }
      this.scheduleBlink();
    }, nextBlink);
  }

  blink() {
    if (this.isBlinking) return;
    this.isBlinking = true;
    this.container.classList.add('mascot-blinking');

    const blinkDuration = this.isSleeping ? 280 : 150;

    setTimeout(() => {
      this.container.classList.remove('mascot-blinking');
      this.isBlinking = false;

      // 35% chance of a biological double-blink if awake
      if (!this.isSleeping && Math.random() < 0.35) {
        setTimeout(() => {
          if (!this.isBlinking && !this.isSpinning) {
            this.container.classList.add('mascot-blinking');
            setTimeout(() => {
              this.container.classList.remove('mascot-blinking');
            }, 120);
          }
        }, 110);
      }
    }, blinkDuration);
  }

  // ================= ORGANIC OCULAR SACCADES =================
  scheduleSaccade() {
    const delay = 2200 + Math.random() * 2600;
    this.saccadeTimer = setTimeout(() => {
      // If cursor is relatively still and not sleeping, do a tiny ocular micro-drift
      const timeSinceActivity = Date.now() - this.lastActivityTime;
      if (timeSinceActivity > 1000 && !this.isSleeping) {
        this.saccade.x = (Math.random() - 0.5) * 1.8;
        this.saccade.y = (Math.random() - 0.5) * 1.4;
      } else {
        this.saccade.x = 0;
        this.saccade.y = 0;
      }
      this.scheduleSaccade();
    }, delay);
  }

  // ================= CLICK / TAP REACTION =================
  triggerReaction() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    this.onUserActivity();

    // Dismiss any active speech frame immediately on click so no box appears
    this.hideSpeech();

    // Play cyber voice sound
    if (window.cyberAudio) {
      window.cyberAudio.playMascotSpeak();
    }

    // Set excited mood with heart or star
    const reactionEmotes = ['❤️', '🚀', '⭐', '🎉', '💡'];
    const randomEmote = reactionEmotes[Math.floor(Math.random() * reactionEmotes.length)];
    this.setMood('excited', 2500);
    if (this.haloIcon) this.haloIcon.textContent = randomEmote;
    if (this.halo) this.halo.classList.add('active');

    // 3D Barrel Spin Animation
    this.container.classList.add('mascot-reacting');

    setTimeout(() => {
      this.container.classList.remove('mascot-reacting');
      this.isSpinning = false;
    }, 950);
  }

  // ================= SPEECH SYSTEM =================
  say(text, duration = 4500) {
    if (!this.speechBubble || !this.speechText) return;
    
    this.speechText.textContent = text;
    this.speechBubble.classList.add('active');

    if (this.speechTimeout) clearTimeout(this.speechTimeout);
    this.speechTimeout = setTimeout(() => {
      this.hideSpeech();
    }, duration);
  }

  hideSpeech() {
    if (this.speechBubble) this.speechBubble.classList.remove('active');
    if (this.speechTimeout) clearTimeout(this.speechTimeout);
  }

  // ================= MINIMIZE & RESTORE =================
  minimize() {
    this.isMinimized = true;
    this.container.classList.add('minimized');
    this.hideSpeech();
    if (window.cyberAudio) window.cyberAudio.playClick();
  }

  restore() {
    this.isMinimized = false;
    this.container.classList.remove('minimized');
    this.hideSpeech();
    this.setMood('excited', 3000);
    if (window.cyberAudio) window.cyberAudio.playMascotSpeak();
  }

  // ================= CONTEXTUAL SCROLL OBSERVER =================
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
    }, { threshold: 0.45 });

    document.querySelectorAll('section[id]').forEach(sec => observer.observe(sec));
  }

  onSectionEnter(sectionId) {
    const sectionData = {
      'about': {
        text: "Khám phá câu chuyện & định hướng IT Project Manager của Thế Hy nhé! 🎓",
        mood: 'happy',
        glyph: '🎓'
      },
      'specializations': {
        text: "4 trụ cột chuyên sâu: Data Engineering, Data Mining, ML & Deep Learning! 📊",
        mood: 'curious',
        glyph: '📊'
      },
      'ml-lab': {
        text: "Thử nghiệm kéo chỉnh Learning Rate và nhấn 'Huấn luyện mô hình' xem ranh giới phân lớp! 🧪",
        mood: 'excited',
        glyph: '🧪'
      },
      'pipeline': {
        text: "Kiến trúc kho dữ liệu 5 lớp chịu tải cao với Redis cache và MongoDB! ⚡",
        mood: 'curious',
        glyph: '⚡'
      },
      'projects': {
        text: "Mỗi project đều có source code, tài liệu và kiến trúc thực tế! 🚀",
        mood: 'happy',
        glyph: '🚀'
      },
      'tech-stack': {
        text: "Tech stack từ Python, T-SQL, Docker đến scikit-learn & TensorFlow! 🧰",
        mood: 'normal',
        glyph: '🧰'
      },
      'terminal': {
        text: "Bạn có thể gõ các lệnh 'help', 'skills', 'predict' vào terminal để tương tác! 💻",
        mood: 'wink',
        glyph: '💻'
      },
      'roadmap': {
        text: "Lộ trình rõ ràng từ nền tảng đến dẫn dắt các dự án kỹ thuật Data & AI! 🗺️",
        mood: 'happy',
        glyph: '🗺️'
      },
      'contact': {
        text: "Đừng ngần ngại gửi email hoặc kết nối LinkedIn với Thế Hy nha! 📬",
        mood: 'happy',
        glyph: '📬'
      }
    };

    const target = sectionData[sectionId];
    if (target) {
      this.setMood(target.mood, 4500);
      if (this.haloIcon) this.haloIcon.textContent = target.glyph;
      if (this.halo) this.halo.classList.add('active');
      this.say(target.text, 4800);
    }
  }

  // ================= 60FPS UPDATE LOOP =================
  update() {
    // Check for idle inactivity to trigger sleep mode
    if (!this.isSleeping && Date.now() - this.lastActivityTime > this.idleSleepDelay) {
      this.fallAsleep();
    }

    if (!this.container || this.isMinimized) {
      requestAnimationFrame(() => this.update());
      return;
    }

    // Calculate vector from mascot center to pointer
    const rect = this.container.getBoundingClientRect();
    const mascotCenterX = rect.left + rect.width / 2;
    const mascotCenterY = rect.top + rect.height / 2;

    const dx = this.mouse.x - mascotCenterX;
    const dy = this.mouse.y - mascotCenterY;
    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    // Dynamic rotation bounds
    const maxRotateX = this.prefersReduced ? 8 : 22; // Pitch
    const maxRotateY = this.prefersReduced ? 10 : 28; // Yaw
    const maxRollZ = this.prefersReduced ? 3 : 9;     // Curiosity Roll Tilt

    // Screen normalized coordinates (-1 to 1)
    const normX = Math.max(-1, Math.min(1, dx / (window.innerWidth * 0.5)));
    const normY = Math.max(-1, Math.min(1, dy / (window.innerHeight * 0.5)));

    if (this.isSleeping) {
      // Asleep: Head gently droops down and tilts to the side
      this.targetRotation.x = 12;
      this.targetRotation.y = 4;
      this.targetRotation.z = 7;
      this.targetPupil.x = 0;
      this.targetPupil.y = 3;
    } else {
      // Awake: Active 3D head gaze
      this.targetRotation.y = normX * maxRotateY;
      this.targetRotation.x = -normY * maxRotateX;

      // Curiosity Roll tilt: Head naturally cocks sideways when examining things!
      let rollZ = -normX * maxRollZ;
      if (this.currentMood === 'curious') {
        rollZ += (normX >= 0 ? 8 : -8);
      }
      this.targetRotation.z = rollZ;

      // Pupil translation (bounded inside OLED visor)
      const maxPupilRadius = 7.5;
      const pupilDist = Math.min(distance / 26, maxPupilRadius);
      this.targetPupil.x = Math.cos(angle) * pupilDist + this.saccade.x;
      this.targetPupil.y = Math.sin(angle) * pupilDist + this.saccade.y;
    }

    // Smooth inertia interpolation (lerp)
    const lerpFactor = this.prefersReduced ? 0.2 : 0.10;
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * lerpFactor;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * lerpFactor;
    this.currentRotation.z += (this.targetRotation.z - this.currentRotation.z) * lerpFactor;

    this.currentPupil.x += (this.targetPupil.x - this.currentPupil.x) * lerpFactor;
    this.currentPupil.y += (this.targetPupil.y - this.currentPupil.y) * lerpFactor;

    // Apply 3D Head Transformation with Curiosity Roll
    if (this.head && !this.isSpinning) {
      this.head.style.transform = `perspective(600px) rotateX(${this.currentRotation.x.toFixed(2)}deg) rotateY(${this.currentRotation.y.toFixed(2)}deg) rotateZ(${this.currentRotation.z.toFixed(2)}deg)`;
    }

    // Dynamic light reflection glare shift on helmet highlight based on mouse angle
    if (this.highlight) {
      const glintX = (-normX * 5.5).toFixed(1);
      const glintY = (-normY * 3.5).toFixed(1);
      this.highlight.style.transform = `translate(${glintX}px, ${glintY}px) rotate(-8deg)`;
    }

    // Apply Pupil Translation
    const pupilTransform = `translate(${this.currentPupil.x.toFixed(2)}px, ${this.currentPupil.y.toFixed(2)}px)`;
    if (this.eyeLeftPupil) this.eyeLeftPupil.style.transform = pupilTransform;
    if (this.eyeRightPupil) this.eyeRightPupil.style.transform = pupilTransform;

    // Dual catchlights corneal 3D depth shift
    if (this.eyeGlints && this.eyeGlints.length > 0) {
      const glintOffset = `translate(${-this.currentPupil.x * 0.12}px, ${-this.currentPupil.y * 0.12}px)`;
      this.eyeGlints.forEach(glint => {
        glint.style.transform = glintOffset;
      });
    }

    // Floating Magnetic Robotic Hands Zero-G tether lag
    if (this.handLeft && !this.isSpinning) {
      const lagX = (-this.currentRotation.y * 0.22).toFixed(1);
      const lagY = (this.currentRotation.x * 0.14).toFixed(1);
      this.handLeft.style.transform = `translate3d(${lagX}px, ${lagY}px, 0)`;
    }

    if (this.handRight && !this.isSpinning && !this.isHovered) {
      const lagX = (-this.currentRotation.y * 0.22).toFixed(1);
      const lagY = (this.currentRotation.x * 0.14).toFixed(1);
      this.handRight.style.transform = `translate3d(${lagX}px, ${lagY}px, 0)`;
    }

    requestAnimationFrame(() => this.update());
  }
}

// Initialize mascot on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.tensorMascot = new TensorMascot('tensor-mascot-widget');
});
