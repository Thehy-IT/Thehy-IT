/**
 * Continuous 3D Data Science & Neural Network Engine
 * Renders continuous 3D visualizations from top to bottom of the page:
 * 1. 3D Neural Network topology with flowing synaptic data packets
 * 2. 3D Mathematical Loss Landscape with gradient descent particles
 * 3. 3D Rotating Data Tensor / Hypercube wireframe
 * 4. Continuous scroll-driven camera traversal and mouse vector field interaction
 */

class DataScienceScene3D {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    // Mouse state
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };
    
    // Scroll state
    this.scroll = { current: 0, target: 0, max: 1, ratio: 0 };
    
    // Time & performance
    this.time = 0;
    this.lastTime = performance.now();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isRunning = true;
    
    // 3D Camera
    this.camera = {
      x: 0,
      y: 0,
      z: 600,
      fov: 500,
      pitch: 0,
      yaw: 0,
      roll: 0
    };
    
    // World Entities
    this.neuralNodes = [];
    this.synapses = [];
    this.dataPackets = [];
    this.lossMesh = { cols: 24, rows: 24, spacing: 45, points: [] };
    this.descentTracers = [];
    this.hypercube = { vertices: [], edges: [], angleX: 0, angleY: 0, angleZ: 0 };
    
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX - this.width / 2) / (this.width / 2);
      this.mouse.targetY = (e.clientY - this.height / 2) / (this.height / 2);
      this.mouse.active = true;
    });

    window.addEventListener('scroll', () => {
      this.scroll.target = window.scrollY;
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      this.isRunning = !document.hidden;
      if (this.isRunning) {
        this.lastTime = performance.now();
        this.animate();
      }
    });

    this.initNeuralNetwork();
    this.initLossLandscape();
    this.initHypercube();
    this.initGradientDescent();

    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.camera.fov = Math.max(380, Math.min(this.width, this.height) * 0.7);
    this.scroll.max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
  }

  // --- Entity Initializers ---

  initNeuralNetwork() {
    this.neuralNodes = [];
    this.synapses = [];
    this.dataPackets = [];

    // Create 4 structured neural layers + ambient tensor points in 3D
    const layers = [
      { count: 5, x: -350, color: '#38BDF8' }, // Input Layer
      { count: 7, x: -120, color: '#0EA5E9' }, // Hidden Layer 1
      { count: 7, x: 120, color: '#10B981' },  // Hidden Layer 2
      { count: 4, x: 350, color: '#34D399' }   // Output Layer
    ];

    layers.forEach((layer, layerIdx) => {
      const ySpacing = 70;
      const yStart = -((layer.count - 1) * ySpacing) / 2;
      for (let i = 0; i < layer.count; i++) {
        const node = {
          x: layer.x,
          y: yStart + i * ySpacing + (Math.random() - 0.5) * 20,
          z: (Math.random() - 0.5) * 160,
          baseX: layer.x,
          baseY: yStart + i * ySpacing,
          baseZ: (Math.random() - 0.5) * 160,
          radius: 3.5 + Math.random() * 2,
          layer: layerIdx,
          color: layer.color,
          pulse: Math.random() * Math.PI * 2
        };
        this.neuralNodes.push(node);
      }
    });

    // Ambient floating tensor points
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 250 + Math.random() * 350;
      this.neuralNodes.push({
        x: Math.cos(angle) * dist,
        y: (Math.random() - 0.5) * 600,
        z: (Math.random() - 0.5) * 500 - 100,
        baseX: Math.cos(angle) * dist,
        baseY: (Math.random() - 0.5) * 600,
        baseZ: (Math.random() - 0.5) * 500 - 100,
        radius: 1.8 + Math.random() * 1.5,
        layer: -1,
        color: '#64748B',
        pulse: Math.random() * Math.PI * 2
      });
    }

    // Connect layer nodes
    for (let i = 0; i < this.neuralNodes.length; i++) {
      const a = this.neuralNodes[i];
      if (a.layer === -1) continue;
      for (let j = 0; j < this.neuralNodes.length; j++) {
        const b = this.neuralNodes[j];
        if (b.layer === a.layer + 1) {
          this.synapses.push({ a, b, strength: 0.2 + Math.random() * 0.4 });
        }
      }
    }

    // Spawn traveling data packets
    for (let i = 0; i < 28; i++) {
      if (this.synapses.length > 0) {
        const synapse = this.synapses[Math.floor(Math.random() * this.synapses.length)];
        this.dataPackets.push({
          synapse,
          progress: Math.random(),
          speed: 0.008 + Math.random() * 0.012,
          color: Math.random() > 0.3 ? '#38BDF8' : '#34D399'
        });
      }
    }
  }

  initLossLandscape() {
    const { cols, rows, spacing } = this.lossMesh;
    this.lossMesh.points = [];
    const halfWidth = ((cols - 1) * spacing) / 2;
    const halfHeight = ((rows - 1) * spacing) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * spacing - halfWidth;
        const y = r * spacing - halfHeight;
        this.lossMesh.points.push({
          gridC: c,
          gridR: r,
          x,
          y,
          z: 0,
          baseZ: 0
        });
      }
    }
  }

  initHypercube() {
    // 4D Tesseract projection into 3D
    this.hypercube.vertices = [];
    const size = 110;
    for (let i = 0; i < 8; i++) {
      this.hypercube.vertices.push({
        x: (i & 1 ? 1 : -1) * size,
        y: (i & 2 ? 1 : -1) * size,
        z: (i & 4 ? 1 : -1) * size
      });
    }
    // Inner cube
    const inSize = size * 0.55;
    for (let i = 0; i < 8; i++) {
      this.hypercube.vertices.push({
        x: (i & 1 ? 1 : -1) * inSize,
        y: (i & 2 ? 1 : -1) * inSize,
        z: (i & 4 ? 1 : -1) * inSize
      });
    }

    this.hypercube.edges = [
      // Outer cube edges
      [0,1], [1,3], [3,2], [2,0],
      [4,5], [5,7], [7,6], [6,4],
      [0,4], [1,5], [2,6], [3,7],
      // Inner cube edges
      [8,9], [9,11], [11,10], [10,8],
      [12,13], [13,15], [15,14], [14,12],
      [8,12], [9,13], [10,14], [11,15],
      // Connect outer to inner
      [0,8], [1,9], [2,10], [3,11],
      [4,12], [5,13], [6,14], [7,15]
    ];
  }

  initGradientDescent() {
    this.descentTracers = [];
    for (let i = 0; i < 6; i++) {
      this.descentTracers.push({
        c: Math.random() * (this.lossMesh.cols - 2) + 1,
        r: Math.random() * (this.lossMesh.rows - 2) + 1,
        history: [],
        color: i % 2 === 0 ? '#38BDF8' : '#F59E0B',
        speed: 0.03 + Math.random() * 0.02
      });
    }
  }

  // --- 3D Transformations ---

  project(point, camOffsetZ = 0, camOffsetY = 0, camPitch = 0, camYaw = 0) {
    // Rotation around Y (Yaw)
    let cosY = Math.cos(camYaw);
    let sinY = Math.sin(camYaw);
    let x1 = point.x * cosY - point.z * sinY;
    let z1 = point.x * sinY + point.z * cosY;

    // Rotation around X (Pitch)
    let cosX = Math.cos(camPitch);
    let sinX = Math.sin(camPitch);
    let y2 = (point.y - camOffsetY) * cosX - (z1 - camOffsetZ) * sinX;
    let z2 = (point.y - camOffsetY) * sinX + (z1 - camOffsetZ) * cosX;

    const distance = this.camera.fov + z2;
    if (distance <= 10) return null; // Behind camera

    const scale = this.camera.fov / distance;
    return {
      x: this.width / 2 + x1 * scale,
      y: this.height / 2 + y2 * scale,
      scale,
      depth: z2
    };
  }

  // --- Update loop ---

  update(dt) {
    this.time += dt * 0.001;
    
    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    // Smooth scroll tracking
    this.scroll.max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    this.scroll.current += (this.scroll.target - this.scroll.current) * 0.08;
    this.scroll.ratio = Math.min(Math.max(this.scroll.current / this.scroll.max, 0), 1);

    // Dynamic Camera based on scroll and mouse
    const scrollYaw = (this.scroll.ratio * Math.PI * 1.5) + this.mouse.x * 0.25;
    const scrollPitch = (Math.sin(this.scroll.ratio * Math.PI * 2) * 0.2) + this.mouse.y * 0.2;
    const scrollZ = 550 - this.scroll.ratio * 250;
    const scrollY = (this.scroll.ratio - 0.5) * 350;

    this.camera.yaw = scrollYaw;
    this.camera.pitch = scrollPitch;
    this.camera.z = scrollZ;
    this.camera.y = scrollY;

    // 1. Update Neural Nodes & Synapses
    this.neuralNodes.forEach(node => {
      node.pulse += dt * 0.002;
      // Gentle floating
      node.y = node.baseY + Math.sin(this.time * 1.5 + node.pulse) * 8;
      node.z = node.baseZ + Math.cos(this.time * 1.2 + node.pulse) * 10;

      // Mouse gravitational interaction
      if (this.mouse.active) {
        const p = this.project(node, this.camera.z, this.camera.y, this.camera.pitch, this.camera.yaw);
        if (p) {
          const dx = (this.mouse.x * this.width/2 + this.width/2) - p.x;
          const dy = (this.mouse.y * this.height/2 + this.height/2) - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 140) {
            const force = (1 - dist / 140) * 15;
            node.x += Math.cos(Math.atan2(dy, dx)) * force * 0.05;
          } else {
            node.x += (node.baseX - node.x) * 0.02;
          }
        }
      }
    });

    // Update Data Packets
    this.dataPackets.forEach(packet => {
      packet.progress += packet.speed;
      if (packet.progress >= 1) {
        packet.progress = 0;
        // Reassign to another random synapse
        if (this.synapses.length > 0) {
          packet.synapse = this.synapses[Math.floor(Math.random() * this.synapses.length)];
        }
      }
    });

    // 2. Update Loss Landscape Mesh
    const { cols, rows } = this.lossMesh;
    const t = this.time * 1.2;
    this.lossMesh.points.forEach(pt => {
      const u = pt.gridC / cols;
      const v = pt.gridR / rows;
      // Mathematical multi-modal loss surface function J(w1, w2)
      const distFromCenter = Math.hypot(u - 0.5, v - 0.5) * 4;
      const wave1 = Math.sin(u * 5 + t) * Math.cos(v * 5 + t) * 35;
      const wave2 = Math.sin(distFromCenter * 6 - t * 1.4) * 25;
      const bowl = (Math.pow(u - 0.5, 2) + Math.pow(v - 0.5, 2)) * 120;
      
      pt.z = wave1 + wave2 - bowl + 80;
    });

    // 3. Update Gradient Descent Particles
    this.descentTracers.forEach(tracer => {
      // Simulate downhill gradient
      const cIdx = Math.floor(tracer.c);
      const rIdx = Math.floor(tracer.r);
      const idx = rIdx * cols + cIdx;
      
      if (idx >= 0 && idx < this.lossMesh.points.length - cols - 1) {
        const pCurrent = this.lossMesh.points[idx];
        const pRight = this.lossMesh.points[idx + 1];
        const pDown = this.lossMesh.points[idx + cols];

        if (pCurrent && pRight && pDown) {
          const gradX = pRight.z - pCurrent.z;
          const gradY = pDown.z - pCurrent.z;

          // Step in negative gradient direction
          tracer.c -= gradX * tracer.speed * 0.15;
          tracer.r -= gradY * tracer.speed * 0.15;
        }
      }

      // Boundary check or reset
      if (tracer.c < 1 || tracer.c > cols - 2 || tracer.r < 1 || tracer.r > rows - 2) {
        tracer.c = Math.random() * (cols - 4) + 2;
        tracer.r = Math.random() * (rows - 4) + 2;
        tracer.history = [];
      }
    });

    // 4. Update Hypercube rotation
    this.hypercube.angleX += dt * 0.0006;
    this.hypercube.angleY += dt * 0.0009;
    this.hypercube.angleZ += dt * 0.0004;
  }

  // --- Render Loop ---

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Subtle background cyber grid lines
    this.renderBackgroundGrid();

    // 1. Render 3D Loss Landscape (undulating mathematical mesh)
    this.renderLossLandscape();

    // 2. Render 3D Neural Network Synapses & Nodes
    this.renderNeuralNetwork();

    // 3. Render 3D Hypercube / Tensor Core
    this.renderHypercube();
  }

  renderBackgroundGrid() {
    // Subtle background ambient glow at center
    const grad = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 50,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.7
    );
    grad.addColorStop(0, 'rgba(14, 165, 233, 0.04)');
    grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.02)');
    grad.addColorStop(1, 'rgba(7, 11, 20, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  renderNeuralNetwork() {
    // Draw Synapses
    this.ctx.lineWidth = 1;
    this.synapses.forEach(syn => {
      const p1 = this.project(syn.a, this.camera.z, this.camera.y, this.camera.pitch, this.camera.yaw);
      const p2 = this.project(syn.b, this.camera.z, this.camera.y, this.camera.pitch, this.camera.yaw);

      if (p1 && p2) {
        const avgDepth = (p1.depth + p2.depth) / 2;
        const alpha = Math.max(0.04, Math.min(0.28, (1 - avgDepth / 800) * syn.strength));
        
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        this.ctx.stroke();
      }
    });

    // Draw Flowing Data Packets
    this.dataPackets.forEach(pkt => {
      if (!pkt.synapse) return;
      const p1 = this.project(pkt.synapse.a, this.camera.z, this.camera.y, this.camera.pitch, this.camera.yaw);
      const p2 = this.project(pkt.synapse.b, this.camera.z, this.camera.y, this.camera.pitch, this.camera.yaw);

      if (p1 && p2) {
        const x = p1.x + (p2.x - p1.x) * pkt.progress;
        const y = p1.y + (p2.y - p1.y) * pkt.progress;
        const size = (2 + pkt.progress * 1.5) * p1.scale;

        this.ctx.beginPath();
        this.ctx.arc(x, y, Math.max(1.2, size), 0, Math.PI * 2);
        this.ctx.fillStyle = pkt.color;
        this.ctx.shadowColor = pkt.color;
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
        this.ctx.shadowBlur = 0; // reset
      }
    });

    // Draw Neural Nodes
    this.neuralNodes.forEach(node => {
      const p = this.project(node, this.camera.z, this.camera.y, this.camera.pitch, this.camera.yaw);
      if (p) {
        const r = node.radius * p.scale;
        const alpha = Math.max(0.2, Math.min(0.9, (1 - p.depth / 800)));
        
        // Node outer glow
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, r * 1.8, 0, Math.PI * 2);
        this.ctx.fillStyle = `${node.color}${Math.floor(alpha * 40).toString(16).padStart(2, '0')}`;
        this.ctx.fill();

        // Node core
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, Math.max(1, r), 0, Math.PI * 2);
        this.ctx.fillStyle = node.color;
        this.ctx.fill();
      }
    });
  }

  renderLossLandscape() {
    const { cols, rows, spacing, points } = this.lossMesh;
    const landscapeOffsetY = 240 + Math.sin(this.scroll.ratio * Math.PI) * 100;
    const landscapeOffsetZ = -150 - this.scroll.ratio * 80;

    // Draw wireframe mesh
    this.ctx.lineWidth = 0.8;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const pt = points[idx];
        const p1 = this.project(
          { x: pt.x, y: pt.y + landscapeOffsetY, z: pt.z + landscapeOffsetZ },
          this.camera.z, this.camera.y, this.camera.pitch + 0.45, this.camera.yaw
        );

        if (!p1) continue;

        // Connect right
        if (c < cols - 1) {
          const ptRight = points[idx + 1];
          const p2 = this.project(
            { x: ptRight.x, y: ptRight.y + landscapeOffsetY, z: ptRight.z + landscapeOffsetZ },
            this.camera.z, this.camera.y, this.camera.pitch + 0.45, this.camera.yaw
          );
          if (p2) {
            const zAvg = (pt.z + ptRight.z) / 2;
            const alpha = Math.max(0.05, Math.min(0.25, (1 - (p1.depth + p2.depth) / 1600)));
            const color = zAvg > 20 ? `rgba(16, 185, 129, ${alpha})` : `rgba(14, 165, 233, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
          }
        }

        // Connect down
        if (r < rows - 1) {
          const ptDown = points[idx + cols];
          const p2 = this.project(
            { x: ptDown.x, y: ptDown.y + landscapeOffsetY, z: ptDown.z + landscapeOffsetZ },
            this.camera.z, this.camera.y, this.camera.pitch + 0.45, this.camera.yaw
          );
          if (p2) {
            const zAvg = (pt.z + ptDown.z) / 2;
            const alpha = Math.max(0.05, Math.min(0.25, (1 - (p1.depth + p2.depth) / 1600)));
            const color = zAvg > 20 ? `rgba(16, 185, 129, ${alpha})` : `rgba(14, 165, 233, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
          }
        }
      }
    }

    // Draw Gradient Descent Tracers
    this.descentTracers.forEach(tracer => {
      const cIdx = Math.floor(tracer.c);
      const rIdx = Math.floor(tracer.r);
      const idx = rIdx * cols + cIdx;
      const pt = points[idx];
      if (pt) {
        const p = this.project(
          { x: pt.x, y: pt.y + landscapeOffsetY, z: pt.z + landscapeOffsetZ },
          this.camera.z, this.camera.y, this.camera.pitch + 0.45, this.camera.yaw
        );
        if (p) {
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 4 * p.scale, 0, Math.PI * 2);
          this.ctx.fillStyle = tracer.color;
          this.ctx.shadowColor = tracer.color;
          this.ctx.shadowBlur = 10;
          this.ctx.fill();
          this.ctx.shadowBlur = 0;
        }
      }
    });
  }

  renderHypercube() {
    // Rotating Tensor Cube in top-right or center-right
    const cx = Math.cos(this.hypercube.angleX);
    const sx = Math.sin(this.hypercube.angleX);
    const cy = Math.cos(this.hypercube.angleY);
    const sy = Math.sin(this.hypercube.angleY);
    const cz = Math.cos(this.hypercube.angleZ);
    const sz = Math.sin(this.hypercube.angleZ);

    const projectedVerts = this.hypercube.vertices.map(v => {
      // 3D rotation
      let y1 = v.y * cx - v.z * sx;
      let z1 = v.y * sx + v.z * cx;
      let x2 = v.x * cy + z1 * sy;
      let z2 = -v.x * sy + z1 * cy;
      let x3 = x2 * cz - y1 * sz;
      let y3 = x2 * sz + y1 * cz;

      // Position in 3D world: shifts based on scroll
      const worldX = x3 + (this.scroll.ratio > 0.5 ? -280 : 320);
      const worldY = y3 - 180 + this.scroll.ratio * 200;
      const worldZ = z2 + 80;

      return this.project({ x: worldX, y: worldY, z: worldZ }, this.camera.z, this.camera.y, this.camera.pitch, this.camera.yaw);
    });

    this.ctx.lineWidth = 1.2;
    this.hypercube.edges.forEach(([i, j], edgeIdx) => {
      const p1 = projectedVerts[i];
      const p2 = projectedVerts[j];
      if (p1 && p2) {
        const isInner = i >= 8 && j >= 8;
        const isSpoke = (i < 8 && j >= 8) || (i >= 8 && j < 8);
        
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        
        if (isSpoke) {
          this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)'; // Amber spoke
        } else if (isInner) {
          this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';  // Emerald inner
        } else {
          this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)'; // Cyan outer
        }
        this.ctx.stroke();
      }
    });

    // Vertices dots
    projectedVerts.forEach((p, idx) => {
      if (p) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, (idx >= 8 ? 2.5 : 3.5) * p.scale, 0, Math.PI * 2);
        this.ctx.fillStyle = idx >= 8 ? '#10B981' : '#38BDF8';
        this.ctx.fill();
      }
    });
  }

  animate() {
    if (!this.isRunning) return;
    const now = performance.now();
    const dt = Math.min(now - this.lastTime, 100);
    this.lastTime = now;

    this.update(dt);
    this.render();

    requestAnimationFrame(() => this.animate());
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.dsScene3D = new DataScienceScene3D('neural-canvas-3d');
});
