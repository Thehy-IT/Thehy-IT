/**
 * Main Application Script for Huỳnh Thế Hy Data Science Portfolio
 * Handles:
 * - 3D Card Tilt with Dynamic Lighting Glare
 * - Interactive Data Science Terminal Emulator
 * - 5-Tier Data Pipeline Architecture Interactive Inspector
 * - Tech Stack Filter Matrix
 * - Audio Control & System Health Monitors
 * - Navigation Scrollspy & Accessibility
 */

document.addEventListener('DOMContentLoaded', () => {
  initAudioToggle();
  initSystemStats();
  init3DCardTilt();
  initProjectsContinuousCarousel();
  initPipelineExplorer();
  initTerminalEmulator();
  initTechStackFilters();
  initSmoothScrollSpy();
  initRoadmapStacking();
  initCopyCodeButtons();
  initMobileMenu();
});

// --- 1. Audio Toggle ---
function initAudioToggle() {
  const btnAudio = document.getElementById('btn-toggle-audio');
  if (!btnAudio) return;

  if (window.cyberAudio) {
    const isEnabled = window.cyberAudio.enabled;
    btnAudio.setAttribute('aria-pressed', isEnabled.toString());
    const textEl = btnAudio.querySelector('.audio-text');
    if (textEl) textEl.textContent = isEnabled ? 'Âm thanh: BẬT' : 'Âm thanh: TẮT';
    btnAudio.classList.toggle('audio-active', isEnabled);
  }

  btnAudio.addEventListener('click', () => {
    if (!window.cyberAudio) return;
    const active = window.cyberAudio.toggle();

    btnAudio.setAttribute('aria-pressed', active.toString());
    const textEl = btnAudio.querySelector('.audio-text');
    if (textEl) textEl.textContent = active ? 'Âm thanh: BẬT' : 'Âm thanh: TẮT';

    btnAudio.classList.toggle('audio-active', active);
  });
}

// --- 2. Live System Stats (Clock, Latency, FPS) ---
function initSystemStats() {
  const clockEl = document.getElementById('system-clock');
  const latencyEl = document.getElementById('system-latency');
  const fpsEl = document.getElementById('system-fps');

  // Digital clock
  function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour12: false });
    if (clockEl) clockEl.textContent = timeStr;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Simulated latency variance (1.1ms - 2.4ms)
  if (latencyEl) {
    setInterval(() => {
      const lat = (1.1 + Math.random() * 0.9).toFixed(1);
      latencyEl.textContent = `${lat}ms`;
    }, 3000);
  }

  // Real FPS meter
  if (fpsEl) {
    let frameCount = 0;
    let lastTime = performance.now();

    function checkFps(now) {
      frameCount++;
      if (now - lastTime >= 1000) {
        fpsEl.textContent = `${frameCount} FPS`;
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(checkFps);
    }
    requestAnimationFrame(checkFps);
  }
}

// --- 3. 3D Card Tilt with Dynamic Lighting Sheen ---
function init3DCardTilt() {
  const cards = document.querySelectorAll('.tilt-card');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  cards.forEach(card => {
    if (card._tiltInitialized) return;
    card._tiltInitialized = true;

    // Create glare layer if not present
    let glare = card.querySelector('.card-glare');
    if (!glare) {
      glare = document.createElement('div');
      glare.className = 'card-glare';
      card.appendChild(glare);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10; // max 10 deg
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px) scale3d(1.01, 1.01, 1.01)`;
      
      // Dynamic lighting glare position
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(56, 189, 248, 0.18), transparent 65%)`;
      glare.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)';
      glare.style.opacity = '0';
    });
  });
}

// --- 3.5. Continuous Horizontal Projects Carousel ---
function initProjectsContinuousCarousel() {
  const wrapper = document.getElementById('projects-carousel-wrapper');
  const viewport = document.getElementById('projects-carousel-viewport');
  const track = document.getElementById('projects-carousel-track');
  if (!wrapper || !viewport || !track) return;

  const originalItems = Array.from(track.querySelectorAll('.carousel-item'));
  if (originalItems.length === 0) return;

  // Clone items twice so we have 3 complete sets for infinite seamless wrapping
  originalItems.forEach(item => {
    const clone1 = item.cloneNode(true);
    clone1.setAttribute('aria-hidden', 'true');
    track.appendChild(clone1);
  });
  originalItems.forEach(item => {
    const clone2 = item.cloneNode(true);
    clone2.setAttribute('aria-hidden', 'true');
    track.appendChild(clone2);
  });

  // Re-run tilt initialization on newly cloned cards
  if (typeof init3DCardTilt === 'function') {
    init3DCardTilt();
  }

  const allItems = Array.from(track.querySelectorAll('.carousel-item'));
  const btnPrev = document.getElementById('btn-carousel-prev');
  const btnNext = document.getElementById('btn-carousel-next');
  const btnPause = document.getElementById('btn-carousel-pause');
  const statusText = document.getElementById('carousel-status-text');

  let currentX = 0;
  let baseSpeed = 0.85; // smooth continuous velocity in px/frame
  let isPaused = false;
  let isHovered = false;
  let isDragging = false;
  let startPointerX = 0;
  let dragStartX = 0;
  let lastPointerX = 0;
  let dragVelocity = 0;
  let resumeTimer = null;

  // Reduced motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    baseSpeed = 0;
  }

  function getStepWidth() {
    if (originalItems.length === 0) return 360;
    const firstRect = originalItems[0].getBoundingClientRect();
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || 28;
    return firstRect.width + gap;
  }

  function getSingleSetWidth() {
    return getStepWidth() * originalItems.length;
  }

  // Update card center scaling, brightness & depth of field
  function updateCardFocus() {
    const vpRect = viewport.getBoundingClientRect();
    const vpCenter = vpRect.left + vpRect.width / 2;
    const maxDist = vpRect.width * 0.52;

    allItems.forEach(item => {
      const cardRect = item.getBoundingClientRect();

      // Skip heavy calculation if card is completely out of view
      if (cardRect.right < vpRect.left - 180 || cardRect.left > vpRect.right + 180) {
        item.style.transform = 'scale(0.82) translateY(8px)';
        item.style.opacity = '0.25';
        item.style.filter = 'blur(2px)';
        item.classList.remove('is-center');
        return;
      }

      const cardCenter = cardRect.left + cardRect.width / 2;
      const dist = Math.abs(cardCenter - vpCenter);
      const norm = Math.min(1, dist / maxDist);

      // Smooth cosine bell curve (1.0 at exact center, 0.0 at edges)
      const focus = 0.5 * (1 + Math.cos(norm * Math.PI));

      const scale = 0.82 + 0.23 * focus; // 0.82 -> 1.05
      const opacity = 0.32 + 0.68 * focus; // 0.32 -> 1.0
      const blur = (1 - focus) * 1.5; // 1.5px -> 0px
      const translateY = (1 - focus) * 8; // 8px -> 0px
      const zIndex = Math.round(focus * 30) + 1;

      item.style.transform = `scale(${scale.toFixed(3)}) translateY(${translateY.toFixed(1)}px)`;
      item.style.opacity = opacity.toFixed(3);
      item.style.zIndex = zIndex;
      item.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : 'none';

      if (focus > 0.88) {
        item.classList.add('is-center');
      } else {
        item.classList.remove('is-center');
      }
    });
  }

  // Main animation loop
  function animate() {
    const singleSetWidth = getSingleSetWidth();

    if (!isPaused && !isHovered && !isDragging) {
      currentX += baseSpeed;
    }

    // Smooth inertia deceleration when release drag
    if (!isDragging && Math.abs(dragVelocity) > 0.05) {
      currentX -= dragVelocity;
      dragVelocity *= 0.92;
    }

    // Wrap around infinitely and seamlessly
    if (singleSetWidth > 0) {
      while (currentX >= singleSetWidth) {
        currentX -= singleSetWidth;
      }
      while (currentX < 0) {
        currentX += singleSetWidth;
      }
    }

    track.style.transform = `translate3d(${-currentX.toFixed(2)}px, 0, 0)`;
    updateCardFocus();

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // --- Interaction Listeners ---

  // Hover pause & resume
  viewport.addEventListener('mouseenter', () => {
    isHovered = true;
    if (resumeTimer) clearTimeout(resumeTimer);
  });

  viewport.addEventListener('mouseleave', () => {
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      isHovered = false;
    }, 800);
  });

  // Pointer drag (mouse & touch)
  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isDragging = true;
    startPointerX = e.clientX;
    lastPointerX = e.clientX;
    dragStartX = currentX;
    dragVelocity = 0;
    viewport.classList.add('is-dragging');
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startPointerX;
    dragVelocity = e.clientX - lastPointerX;
    lastPointerX = e.clientX;
    currentX = dragStartX - deltaX;
  });

  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove('is-dragging');
    try {
      if (viewport.hasPointerCapture(e.pointerId)) {
        viewport.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}
    
    // Prevent accidental link opening if user dragged
    const dist = Math.abs(e.clientX - startPointerX);
    if (dist > 8) {
      const preventClick = (clickEvent) => {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
        window.removeEventListener('click', preventClick, true);
      };
      window.addEventListener('click', preventClick, true);
    }
  }

  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  // Prev / Next button step controls
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (window.cyberAudio) window.cyberAudio.playClick();
      const step = getStepWidth();
      currentX -= step;
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (window.cyberAudio) window.cyberAudio.playClick();
      const step = getStepWidth();
      currentX += step;
    });
  }

  // Pause / Play toggle button
  if (btnPause) {
    btnPause.addEventListener('click', () => {
      if (window.cyberAudio) window.cyberAudio.playClick();
      isPaused = !isPaused;
      const pauseIcon = btnPause.querySelector('.carousel-pause-icon');
      if (pauseIcon) {
        pauseIcon.textContent = isPaused ? '▶' : '⏸';
      }
      if (statusText) {
        statusText.textContent = isPaused ? 'TẠM DỪNG // BẤM ĐỂ TIẾP TỤC' : 'STREAMING SHOWCASE // 8 DỰ ÁN KỸ THUẬT';
      }
    });
  }

  // Wheel horizontal scroll
  viewport.addEventListener('wheel', (e) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 4) {
      currentX += delta * 0.7;
      isHovered = true;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        isHovered = false;
      }, 1500);
    }
  }, { passive: true });
}

// --- 4. Interactive 5-Tier Pipeline Architecture Explorer ---
function initPipelineExplorer() {
  const steps = document.querySelectorAll('.pipeline-step');
  const detailTitle = document.getElementById('pipeline-detail-title');
  const detailDesc = document.getElementById('pipeline-detail-desc');
  const detailTech = document.getElementById('pipeline-detail-tech');
  const detailMetric = document.getElementById('pipeline-detail-metric');

  const pipelineData = {
    '1': {
      title: 'Tầng 1: Source Ingestion & API Gateway',
      desc: 'Tiếp nhận luồng tương tác mạng xã hội theo thời gian thực (posts, likes, user activities) với rate limiting và schema validation.',
      tech: 'FastAPI / Django REST • JSON Schema • Pydantic',
      metric: 'Throughput: ~12,500 req/s | Buffer: 0.2ms'
    },
    '2': {
      title: 'Tầng 2: Hot-Cache In-Memory Layer',
      desc: 'Lưu trữ session người dùng, ranking feed nóng, trending topics và counter bộ đếm giúp giảm 85% tải truy vấn vào ổ đĩa.',
      tech: 'Redis v7.2 • In-Memory Cache • Sorted Sets (ZSET) • TTL Eviction',
      metric: 'Latency: 0.8ms | Hit Ratio: 94.2%'
    },
    '3': {
      title: 'Tầng 3: Document & Event Store (NoSQL)',
      desc: 'Lưu trữ toàn bộ tài liệu bài viết, comment lồng nhau, media metadata với cấu trúc schema-less linh hoạt, sharding ngang theo UserID.',
      tech: 'MongoDB • Replica Set • Aggregation Pipeline • Time-Series',
      metric: 'Storage: 100GB+ | Read/Write Concurrent: High'
    },
    '4': {
      title: 'Tầng 4: Relational & Transactional DB (3NF)',
      desc: 'Quản lý tài khoản, quyền hạn RBAC, lịch sử giao dịch tài chính, hóa đơn và dữ liệu cần tính toàn vẹn ACID tuyệt đối.',
      tech: 'MySQL / PostgreSQL • T-SQL • 3NF Normalized • Foreign Key Constraints',
      metric: 'Consistency: Strict ACID | Zero Data Loss'
    },
    '5': {
      title: 'Tầng 5: Data Mining & AI Analytics Engine',
      desc: 'Trích xuất dữ liệu từ các kho về Data Lab để chạy giải thuật gợi ý bạn bè (Friend Recommendation), phân tích cụm sở thích và phát hiện bất thường.',
      tech: 'Apriori • FP-Growth • scikit-learn • Python ETL Pipelines',
      metric: 'Model Precision: 91.8% | Association Rules: 450+'
    }
  };

  steps.forEach(step => {
    step.addEventListener('click', () => {
      const stepId = step.getAttribute('data-step');
      if (!stepId || !pipelineData[stepId]) return;

      steps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');

      const data = pipelineData[stepId];
      if (detailTitle) detailTitle.textContent = data.title;
      if (detailDesc) detailDesc.textContent = data.desc;
      if (detailTech) detailTech.textContent = data.tech;
      if (detailMetric) detailMetric.textContent = data.metric;

      if (window.cyberAudio) window.cyberAudio.playClick();
    });
  });
}

// --- 5. Interactive Data Science Terminal Emulator ---
function initTerminalEmulator() {
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  if (!terminalInput || !terminalOutput) return;

  const commandHistory = [];
  let historyIndex = -1;

  const commands = {
    'help': `Các lệnh hỗ trợ:\n  - bio       : Xem hồ sơ & triết lý làm việc của Huỳnh Thế Hy\n  - skills    : Hiển thị bảng ma trận kỹ năng Data & AI\n  - projects  : Liệt kê các dự án nổi bật và liên kết GitHub\n  - predict   : Chạy hàm dự đoán độ phù hợp vị trí IT Project Manager\n  - train     : Mở phần ML Playground để huấn luyện mạng nơ-ron\n  - contact   : Lấy email, LinkedIn, MSSV để kết nối trực tiếp\n  - clear     : Xóa sạch màn hình terminal`,
    
    'bio': `=========================================================\n  HỌ TÊN   : Huỳnh Thế Hy\n  TRƯỜNG   : ĐH Giao thông Vận tải TP.HCM (UT-HCMC) - Khoa CNTT\n  MSSV     : 051205009083\n  MỤC TIÊU : IT Project Manager có chiều sâu kỹ thuật Data & AI\n  TRIẾT LÝ : "Dữ liệu không nói dối — chỉ cần biết cách lắng nghe nó."\n=========================================================`,
    
    'skills': `--- TECH STACK MATRIX ---\n[Data & AI]      : Pandas, NumPy, scikit-learn, TensorFlow, Apriori, FP-Growth\n[Databases]      : MySQL, MongoDB, Redis, T-SQL / SQL Server, 3NF Design\n[Backend]        : Python, Django, FastAPI, RESTful APIs, MVC\n[Infrastructure] : Docker, Git, GitHub Actions, Linux, Jupyter Lab`,
    
    'projects': `--- DỰ ÁN KỸ THUẬT NỔI BẬT (@Thehy-IT) ---
1. Social Media Crawler & NoSQL Storage (NoSQL 5-Layer, Redis, MongoDB)
   -> https://github.com/Thehy-IT/course-bda-lab-nosql-crawler
2. AI-Assisted DICOM Medical Imaging (Healthcare AI, T-SQL, Fullstack)
   -> https://github.com/Thehy-IT/capstone-dicom-ai-diagnosis
3. ASEAN Regional Overview Analysis (Data Analytics, Pandas, EDA)
   -> https://github.com/Thehy-IT/capstone-asean_overview_analysis
4. Brain Tumor MRI AI Detection (Deep Learning, CNN, Computer Vision)
   -> https://github.com/Thehy-IT/capstone-brain-tumor-mri
5. Banking Fraud Detection - SBDA-SA (Big Data Streaming, Fintech)
   -> https://github.com/Thehy-IT/capstone-banking-fraud-detection
6. E-Commerce Enterprise Lakehouse (Medallion Architecture, Big Data)
   -> https://github.com/Thehy-IT/course-bda-lab-lakehouse
7. HR & Payroll Management DBMS (MySQL 3NF, Stored Procedures, TypeScript)
   -> https://github.com/Thehy-IT/capstone-hr-payroll-system
8. Quiz & Examination Platform (Python OOP, Database, EdTech)
   -> https://github.com/Thehy-IT/capstone-quiz-examination-system

Tất cả kho lưu trữ: https://github.com/Thehy-IT?tab=repositories`,
    
    'predict': `Đang nạp trọng số mô hình [IT_PM_Fit_Predictor_v2.1]...\n[+] Input Features:\n    - Data Engineering Depth : 9.5 / 10\n    - Machine Learning Logic : 9.2 / 10\n    - System Architecture    : 9.0 / 10\n    - Project Ownership      : 9.6 / 10\n\n[✓] PREDICTION RESULT: 98.7% MATCH FOR TECHNICAL IT PROJECT MANAGER\n    => "Thế Hy sở hữu tư duy dữ liệu sắc bén kết hợp năng lực quản lý dự án!"`,

    'contact': `THÔNG TIN LIÊN HỆ:\n- Email   : hthehy.tech9083@gmail.com\n- LinkedIn: https://www.linkedin.com/in/hy-huynh-the-4a2174332/\n- GitHub  : https://github.com/Thehy-IT\n- Profile : https://lequocdung64.github.io/Members/051205009083_HuynhTheHy.html`,

    'train': () => {
      const mlSection = document.getElementById('ml-lab');
      if (mlSection) {
        mlSection.scrollIntoView({ behavior: 'smooth' });
        return 'Đang cuộn đến phòng thí nghiệm mô hình máy học (ML Lab)...';
      }
      return 'Chuyển hướng thất bại: không tìm thấy phần ML Lab.';
    }
  };

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmdRaw = terminalInput.value.trim();
      const cmd = cmdRaw.toLowerCase();
      terminalInput.value = '';

      if (!cmd) return;

      commandHistory.push(cmdRaw);
      historyIndex = commandHistory.length;

      // Echo user command
      appendOutput(`hy@datascience-lab:~$ ${cmdRaw}`, 'cmd-echo');

      if (cmd === 'clear') {
        terminalOutput.innerHTML = '';
        return;
      }

      if (commands[cmd]) {
        const res = typeof commands[cmd] === 'function' ? commands[cmd]() : commands[cmd];
        appendOutput(res, 'cmd-result');
      } else {
        appendOutput(`Lệnh không hợp lệ: "${cmd}". Gõ 'help' để xem danh sách lệnh được hỗ trợ.`, 'cmd-error');
      }

      if (window.cyberAudio) window.cyberAudio.playClick();
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    } else if (e.key === 'ArrowUp') {
      if (historyIndex > 0) {
        historyIndex--;
        terminalInput.value = commandHistory[historyIndex];
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        terminalInput.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        terminalInput.value = '';
      }
      e.preventDefault();
    }
  });

  function appendOutput(text, className = '') {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.textContent = text;
    terminalOutput.appendChild(line);
  }
}

// --- 6. Tech Stack Filter Matrix ---
function initTechStackFilters() {
  const filterBtns = document.querySelectorAll('.stack-filter-btn');
  const stackCards = document.querySelectorAll('.stack-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      stackCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });

      if (window.cyberAudio) window.cyberAudio.playClick();
    });
  });
}

// --- 7. Smooth Scroll & Active Nav Spy ---
function initSmoothScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-link');
  const drawerLinks = document.querySelectorAll('.drawer-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });

    drawerLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

// --- 8. Copy Code Snippet ---
function initCopyCodeButtons() {
  const copyBtns = document.querySelectorAll('.btn-copy-code');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const codeTarget = btn.getAttribute('data-target');
      const codeEl = document.querySelector(codeTarget);
      if (codeEl) {
        navigator.clipboard.writeText(codeEl.textContent.trim()).then(() => {
          const orig = btn.innerHTML;
          btn.innerHTML = '✓ Đã sao chép!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.classList.remove('copied');
          }, 2000);
        });
      }
    });
  });
}

// --- 9. Mobile Navigation Drawer & Hamburger ---
function initMobileMenu() {
  const btnMenu = document.getElementById('btn-mobile-menu');
  const drawer = document.getElementById('mobile-nav-drawer');
  const btnClose = document.getElementById('btn-close-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (!btnMenu || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    btnMenu.classList.add('active');
    btnMenu.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.cyberAudio) window.cyberAudio.playClick();
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    btnMenu.classList.remove('active');
    btnMenu.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  btnMenu.addEventListener('click', () => {
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (btnClose) btnClose.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

// --- 10. Roadmap Stacking Cards on Scroll (Thẻ đè lên nhau tuần tự khi cuộn) ---
function initRoadmapStacking() {
  const section = document.getElementById('roadmap');
  if (!section) return;

  const cards = Array.from(section.querySelectorAll('.roadmap-stack-card'));
  const pills = Array.from(section.querySelectorAll('.roadmap-step-pill'));
  const hint = document.getElementById('roadmap-scroll-hint');

  if (!cards.length) return;

  const totalCards = cards.length; // 4 cards: 2024, 2025, 2026, Tương lai
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getStepOffset() {
    return window.innerWidth <= 768 ? 20 : 28;
  }

  function updateStack() {
    const rect = section.getBoundingClientRect();
    const navHeight = 70;
    const totalDist = section.offsetHeight - window.innerHeight;

    if (totalDist <= 0) return;

    // Normalize scroll progress through the pinned roadmap track: 0.0 to 1.0
    const rawProgress = (navHeight - rect.top) / totalDist;
    const progress = Math.max(0, Math.min(1, rawProgress));

    const stepOffset = getStepOffset();
    const numTransitions = totalCards - 1; // 3 transitions

    cards.forEach((card, index) => {
      // Base card (Index 0: 2024)
      if (index === 0) {
        if (prefersReduced) {
          card.style.transform = 'none';
          card.style.opacity = '1';
          return;
        }

        // Slight scale and dimming as higher cards stack on top of it
        const stackOverCount = progress * numTransitions; // 0 to 3
        const scale = Math.max(0.88, 1 - stackOverCount * 0.035);
        const brightness = Math.max(0.65, 1 - stackOverCount * 0.1);

        card.style.transform = `translate3d(0, 0px, 0) scale(${scale.toFixed(3)})`;
        card.style.filter = `brightness(${brightness.toFixed(2)})`;
        card.style.opacity = '1';
        card.style.zIndex = '1';
        return;
      }

      // Subsequent cards (Index 1, 2, 3)
      const startRange = (index - 1) / numTransitions;
      const endRange = index / numTransitions;
      const finalY = index * stepOffset;

      if (prefersReduced) {
        card.style.transform = `translate3d(0, ${finalY}px, 0)`;
        card.style.opacity = progress >= startRange ? '1' : '0';
        return;
      }

      if (progress < startRange) {
        // Below viewport / waiting turn
        card.style.transform = `translate3d(0, 120%, 0) scale(0.95)`;
        card.style.opacity = '0';
        card.style.filter = 'brightness(1)';
        card.style.pointerEvents = 'none';
      } else if (progress >= startRange && progress <= endRange) {
        // Transitioning and stacking on top of previous cards
        const t = (progress - startRange) / (endRange - startRange); // 0 to 1
        
        // Easing interpolation
        const currentY = (1 - t) * 120;
        const interpY = currentY > 0 
          ? `calc(${currentY.toFixed(2)}% + ${finalY}px)`
          : `${finalY}px`;

        const scale = (0.95 + 0.05 * t).toFixed(3);
        const opacity = Math.min(1, t * 2.2).toFixed(2);

        card.style.transform = `translate3d(0, ${interpY}, 0) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.filter = 'brightness(1)';
        card.style.pointerEvents = 'auto';
      } else {
        // Fully stacked in place; subtle scale down as higher cards stack over it
        const overProgress = (progress - endRange) * numTransitions;
        const scale = Math.max(0.9, 1 - overProgress * 0.035).toFixed(3);
        const brightness = Math.max(0.7, 1 - overProgress * 0.1).toFixed(2);

        card.style.transform = `translate3d(0, ${finalY}px, 0) scale(${scale})`;
        card.style.opacity = '1';
        card.style.filter = `brightness(${brightness})`;
        card.style.pointerEvents = 'auto';
      }

      card.style.zIndex = (index + 1).toString();
    });

    // Determine active stage pill (0, 1, 2, 3)
    let activeIndex = 0;
    if (progress < 0.2) activeIndex = 0;
    else if (progress < 0.52) activeIndex = 1;
    else if (progress < 0.85) activeIndex = 2;
    else activeIndex = 3;

    pills.forEach((pill, idx) => {
      const isActive = idx === activeIndex;
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-selected', isActive.toString());
    });

    // Update bottom guide hint
    if (hint) {
      const hintText = hint.querySelector('.hint-text');
      if (hintText) {
        if (progress >= 0.98) {
          hintText.textContent = '✓ Toàn bộ hành trình đã hiển thị • Tiếp tục cuộn trang';
        } else {
          hintText.textContent = 'Cuộn chuột để xem các giai đoạn lần lượt đè lên nhau';
        }
      }
    }
  }

  // Click pill to smoothly navigate to that stage's stacked point
  pills.forEach((pill, idx) => {
    pill.addEventListener('click', () => {
      const totalDist = section.offsetHeight - window.innerHeight;
      const targetRatio = idx / (totalCards - 1);
      const targetScroll = section.offsetTop + targetRatio * totalDist + 10;

      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });

      if (window.cyberAudio) window.cyberAudio.playClick();
    });
  });

  // Passive RAF scroll listener
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateStack();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    updateStack();
  }, { passive: true });

  // Initial trigger
  updateStack();
}
