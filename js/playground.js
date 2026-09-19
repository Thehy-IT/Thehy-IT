/**
 * Interactive Data Science & Neural Network Training Simulator
 * Provides a real in-browser machine learning playground:
 * - 2D Decision Boundary visualization on real synthetic datasets (Circles, Moons, XOR)
 * - True forward & backpropagation with gradient descent
 * - Real-time Loss curve, Accuracy chart, and live Confusion Matrix calculation
 */

class MLPlayground {
  constructor() {
    this.canvas = document.getElementById('playground-canvas');
    this.chartCanvas = document.getElementById('loss-chart-canvas');
    if (!this.canvas || !this.chartCanvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.chartCtx = this.chartCanvas.getContext('2d');

    // Controls
    this.btnTrain = document.getElementById('btn-train');
    this.btnStep = document.getElementById('btn-step');
    this.btnReset = document.getElementById('btn-reset');
    this.selectDataset = document.getElementById('select-dataset');
    this.sliderLr = document.getElementById('slider-lr');
    this.labelLr = document.getElementById('label-lr');
    this.labelEpoch = document.getElementById('label-epoch');
    this.labelLoss = document.getElementById('label-loss');
    this.labelAccuracy = document.getElementById('label-accuracy');

    // Confusion Matrix Elements
    this.cmTP = document.getElementById('cm-tp');
    this.cmTN = document.getElementById('cm-tn');
    this.cmFP = document.getElementById('cm-fp');
    this.cmFN = document.getElementById('cm-fn');
    this.cmF1 = document.getElementById('cm-f1');
    this.cmPrecision = document.getElementById('cm-precision');

    // Hyperparameters & State
    this.isTraining = false;
    this.epoch = 0;
    this.learningRate = 0.08;
    this.currentDataset = 'circles';
    this.dataPoints = [];
    this.history = { loss: [], accuracy: [] };

    // Neural Network Architecture: 2 Inputs -> 6 Hidden (Tanh) -> 1 Output (Sigmoid)
    this.hiddenDim = 6;
    this.weights1 = []; // 2 x 6
    this.bias1 = [];    // 6
    this.weights2 = []; // 6 x 1
    this.bias2 = 0;

    this.init();
  }

  init() {
    this.setupListeners();
    this.resetModel();
    this.loadDataset(this.currentDataset);
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const panel = this.canvas.parentElement;
    if (!panel) return;

    const panelWidth = panel.clientWidth - 20;
    const targetW = Math.max(250, Math.min(panelWidth, 380));
    const targetH = Math.max(220, Math.min(targetW * 0.88, 320));

    this.canvas.width = targetW * dpr;
    this.canvas.height = targetH * dpr;
    this.canvas.style.width = `${targetW}px`;
    this.canvas.style.height = `${targetH}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const chartPanel = this.chartCanvas.parentElement;
    const chartW = chartPanel ? Math.max(250, Math.min(chartPanel.clientWidth - 20, 380)) : targetW;
    const chartH = 175;

    this.chartCanvas.width = chartW * dpr;
    this.chartCanvas.height = chartH * dpr;
    this.chartCanvas.style.width = `${chartW}px`;
    this.chartCanvas.style.height = `${chartH}px`;
    this.chartCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.displayW = targetW;
    this.displayH = targetH;
    this.chartDisplayW = chartW;
    this.chartDisplayH = chartH;

    this.render();
  }

  setupListeners() {
    if (this.btnTrain) {
      this.btnTrain.addEventListener('click', () => this.toggleTrain());
    }
    if (this.btnStep) {
      this.btnStep.addEventListener('click', () => {
        this.stepEpochs(5);
      });
    }
    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        this.resetModel();
        this.render();
      });
    }
    if (this.selectDataset) {
      this.selectDataset.addEventListener('change', (e) => {
        this.currentDataset = e.target.value;
        this.resetModel();
        this.loadDataset(this.currentDataset);
        this.render();
      });
    }
    if (this.sliderLr) {
      this.sliderLr.addEventListener('input', (e) => {
        this.learningRate = parseFloat(e.target.value);
        if (this.labelLr) this.labelLr.textContent = this.learningRate.toFixed(2);
        this.sliderLr.setAttribute('aria-valuenow', this.learningRate.toFixed(2));
      });
    }
  }

  resetModel() {
    this.isTraining = false;
    if (this.btnTrain) {
      this.btnTrain.innerHTML = '<span class="btn-icon">▶</span> Bắt đầu huấn luyện';
      this.btnTrain.classList.remove('btn-active');
    }

    this.epoch = 0;
    this.history = { loss: [], accuracy: [] };

    // Xavier/He-like Random Initialization
    this.weights1 = [];
    for (let i = 0; i < 2; i++) {
      this.weights1[i] = [];
      for (let j = 0; j < this.hiddenDim; j++) {
        this.weights1[i][j] = (Math.random() - 0.5) * 1.5;
      }
    }
    this.bias1 = new Array(this.hiddenDim).fill(0);

    this.weights2 = [];
    for (let j = 0; j < this.hiddenDim; j++) {
      this.weights2[j] = (Math.random() - 0.5) * 1.5;
    }
    this.bias2 = 0;

    this.updateStats(0, 0);
    this.updateConfusionMatrix();
  }

  loadDataset(type) {
    this.dataPoints = [];
    const count = 120;

    if (type === 'circles') {
      // Concentric circles
      for (let i = 0; i < count; i++) {
        const isInner = i < count / 2;
        const angle = Math.random() * Math.PI * 2;
        const radius = isInner ? Math.random() * 0.45 : 0.65 + Math.random() * 0.35;
        this.dataPoints.push({
          x: Math.cos(angle) * radius + (Math.random() - 0.5) * 0.08,
          y: Math.sin(angle) * radius + (Math.random() - 0.5) * 0.08,
          label: isInner ? 1 : 0
        });
      }
    } else if (type === 'moons') {
      // Two interleaving half circles
      const half = count / 2;
      for (let i = 0; i < half; i++) {
        const angle = (i / half) * Math.PI;
        this.dataPoints.push({
          x: Math.cos(angle) * 0.6 - 0.25 + (Math.random() - 0.5) * 0.08,
          y: Math.sin(angle) * 0.6 - 0.15 + (Math.random() - 0.5) * 0.08,
          label: 0
        });
      }
      for (let i = 0; i < half; i++) {
        const angle = (i / half) * Math.PI;
        this.dataPoints.push({
          x: 0.25 - Math.cos(angle) * 0.6 + (Math.random() - 0.5) * 0.08,
          y: 0.15 - Math.sin(angle) * 0.6 + (Math.random() - 0.5) * 0.08,
          label: 1
        });
      }
    } else if (type === 'xor') {
      // 4 Quadrants XOR
      for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 1.8;
        const y = (Math.random() - 0.5) * 1.8;
        const label = (x * y > 0) ? 1 : 0;
        this.dataPoints.push({
          x: x + (Math.random() - 0.5) * 0.05,
          y: y + (Math.random() - 0.5) * 0.05,
          label
        });
      }
    }
  }

  // --- Neural Network Forward & Backward Pass ---

  forward(x1, x2) {
    // Hidden Layer: h_j = tanh(w1_0j * x1 + w1_1j * x2 + b1_j)
    const hidden = [];
    for (let j = 0; j < this.hiddenDim; j++) {
      const z = x1 * this.weights1[0][j] + x2 * this.weights1[1][j] + this.bias1[j];
      hidden[j] = Math.tanh(z);
    }

    // Output Layer: y_hat = sigmoid(sum(h_j * w2_j) + b2)
    let zOut = this.bias2;
    for (let j = 0; j < this.hiddenDim; j++) {
      zOut += hidden[j] * this.weights2[j];
    }
    const yHat = 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, zOut))));

    return { hidden, yHat };
  }

  trainEpoch() {
    let totalLoss = 0;
    let correct = 0;

    // Gradient accumulators
    const dW1 = [new Array(this.hiddenDim).fill(0), new Array(this.hiddenDim).fill(0)];
    const dB1 = new Array(this.hiddenDim).fill(0);
    const dW2 = new Array(this.hiddenDim).fill(0);
    let dB2 = 0;

    const N = this.dataPoints.length;

    for (let i = 0; i < N; i++) {
      const pt = this.dataPoints[i];
      const { hidden, yHat } = this.forward(pt.x, pt.y);

      // Binary Cross-Entropy Loss: - (y log(yHat) + (1-y) log(1-yHat))
      const eps = 1e-7;
      const loss = -(pt.label * Math.log(yHat + eps) + (1 - pt.label) * Math.log(1 - yHat + eps));
      totalLoss += loss;

      const pred = yHat >= 0.5 ? 1 : 0;
      if (pred === pt.label) correct++;

      // Error at output: dZ_out = yHat - y (for Sigmoid + BCE)
      const dZOut = yHat - pt.label;
      dB2 += dZOut;

      for (let j = 0; j < this.hiddenDim; j++) {
        dW2[j] += dZOut * hidden[j];

        // Backprop to hidden: dZ_h = dZ_out * w2_j * (1 - tanh^2(z))
        const dZh = dZOut * this.weights2[j] * (1 - hidden[j] * hidden[j]);
        dW1[0][j] += dZh * pt.x;
        dW1[1][j] += dZh * pt.y;
        dB1[j] += dZh;
      }
    }

    // Gradient Descent parameter updates
    const lr = this.learningRate / N;
    for (let j = 0; j < this.hiddenDim; j++) {
      this.weights2[j] -= lr * dW2[j];
      this.weights1[0][j] -= lr * dW1[0][j];
      this.weights1[1][j] -= lr * dW1[1][j];
      this.bias1[j] -= lr * dB1[j];
    }
    this.bias2 -= lr * dB2;

    this.epoch++;
    const avgLoss = totalLoss / N;
    const accuracy = (correct / N) * 100;

    this.history.loss.push(avgLoss);
    this.history.accuracy.push(accuracy);
    if (this.history.loss.length > 80) {
      this.history.loss.shift();
      this.history.accuracy.shift();
    }

    this.updateStats(avgLoss, accuracy);
    this.updateConfusionMatrix();
  }

  toggleTrain() {
    this.isTraining = !this.isTraining;
    if (this.btnTrain) {
      if (this.isTraining) {
        this.btnTrain.innerHTML = '<span class="btn-icon">⏸</span> Tạm dừng';
        this.btnTrain.classList.add('btn-active');
        if (window.cyberAudio) window.cyberAudio.playClick();
        this.loopTraining();
      } else {
        this.btnTrain.innerHTML = '<span class="btn-icon">▶</span> Tiếp tục huấn luyện';
        this.btnTrain.classList.remove('btn-active');
      }
    }
  }

  stepEpochs(num) {
    for (let i = 0; i < num; i++) {
      this.trainEpoch();
    }
    if (window.cyberAudio) window.cyberAudio.playEpoch();
    this.render();
  }

  loopTraining() {
    if (!this.isTraining) return;

    for (let k = 0; k < 2; k++) {
      this.trainEpoch();
    }

    this.render();

    if (this.epoch % 20 === 0 && window.cyberAudio) {
      window.cyberAudio.playEpoch();
    }

    requestAnimationFrame(() => this.loopTraining());
  }

  updateStats(loss, accuracy) {
    if (this.labelEpoch) this.labelEpoch.textContent = this.epoch;
    if (this.labelLoss) this.labelLoss.textContent = loss.toFixed(4);
    if (this.labelAccuracy) this.labelAccuracy.textContent = `${accuracy.toFixed(1)}%`;
  }

  updateConfusionMatrix() {
    let tp = 0, tn = 0, fp = 0, fn = 0;
    this.dataPoints.forEach(pt => {
      const { yHat } = this.forward(pt.x, pt.y);
      const pred = yHat >= 0.5 ? 1 : 0;
      if (pt.label === 1 && pred === 1) tp++;
      else if (pt.label === 0 && pred === 0) tn++;
      else if (pt.label === 0 && pred === 1) fp++;
      else if (pt.label === 1 && pred === 0) fn++;
    });

    const precision = (tp + fp > 0) ? (tp / (tp + fp)) : 0;
    const recall = (tp + fn > 0) ? (tp / (tp + fn)) : 0;
    const f1 = (precision + recall > 0) ? (2 * (precision * recall) / (precision + recall)) : 0;

    if (this.cmTP) this.cmTP.textContent = tp;
    if (this.cmTN) this.cmTN.textContent = tn;
    if (this.cmFP) this.cmFP.textContent = fp;
    if (this.cmFN) this.cmFN.textContent = fn;
    if (this.cmPrecision) this.cmPrecision.textContent = `${(precision * 100).toFixed(1)}%`;
    if (this.cmF1) this.cmF1.textContent = f1.toFixed(3);
  }

  // --- Rendering ---

  render() {
    this.renderDecisionBoundary();
    this.renderLossChart();
  }

  renderDecisionBoundary() {
    const w = this.displayW || this.canvas.clientWidth || 360;
    const h = this.displayH || this.canvas.clientHeight || 320;
    this.ctx.clearRect(0, 0, w, h);

    // Render decision contour field (low-res grid scaled up for 60fps performance)
    const res = 24;
    const cellW = w / res;
    const cellH = h / res;

    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        // Map pixel coords to normalized space [-1.2, 1.2]
        const x = ((i + 0.5) / res - 0.5) * 2.4;
        const y = ((j + 0.5) / res - 0.5) * 2.4;

        const { yHat } = this.forward(x, y);

        // Alpha shading based on probability
        if (yHat >= 0.5) {
          const confidence = (yHat - 0.5) * 2;
          this.ctx.fillStyle = `rgba(16, 185, 129, ${0.1 + confidence * 0.35})`;
        } else {
          const confidence = (0.5 - yHat) * 2;
          this.ctx.fillStyle = `rgba(14, 165, 233, ${0.1 + confidence * 0.35})`;
        }
        this.ctx.fillRect(i * cellW, j * cellH, cellW + 1, cellH + 1);
      }
    }

    // Grid center axes
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(w / 2, 0);
    this.ctx.lineTo(w / 2, h);
    this.ctx.moveTo(0, h / 2);
    this.ctx.lineTo(w, h / 2);
    this.ctx.stroke();

    // Render Data Points
    this.dataPoints.forEach(pt => {
      const px = ((pt.x / 2.4) + 0.5) * w;
      const py = ((pt.y / 2.4) + 0.5) * h;

      this.ctx.beginPath();
      this.ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      if (pt.label === 1) {
        this.ctx.fillStyle = '#10B981';
        this.ctx.strokeStyle = '#FFFFFF';
      } else {
        this.ctx.fillStyle = '#0EA5E9';
        this.ctx.strokeStyle = '#070B14';
      }
      this.ctx.lineWidth = 1.5;
      this.ctx.fill();
      this.ctx.stroke();
    });
  }

  renderLossChart() {
    const w = this.chartDisplayW || this.chartCanvas.clientWidth || 360;
    const h = this.chartDisplayH || this.chartCanvas.clientHeight || 175;
    this.chartCtx.clearRect(0, 0, w, h);

    if (this.history.loss.length < 2) {
      this.chartCtx.fillStyle = '#64748B';
      this.chartCtx.font = '11px JetBrains Mono, monospace';
      this.chartCtx.fillText('Đang chờ dữ liệu huấn luyện...', 15, h / 2);
      return;
    }

    // Draw grid lines
    this.chartCtx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    this.chartCtx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const y = (h / 4) * i;
      this.chartCtx.beginPath();
      this.chartCtx.moveTo(0, y);
      this.chartCtx.lineTo(w, y);
      this.chartCtx.stroke();
    }

    // Draw Loss Curve (Amber)
    const maxLoss = 1.5;
    this.chartCtx.beginPath();
    this.chartCtx.strokeStyle = '#F59E0B';
    this.chartCtx.lineWidth = 2;
    this.history.loss.forEach((loss, idx) => {
      const x = (idx / (this.history.loss.length - 1)) * w;
      const y = Math.max(5, Math.min(h - 5, h - (loss / maxLoss) * h));
      if (idx === 0) this.chartCtx.moveTo(x, y);
      else this.chartCtx.lineTo(x, y);
    });
    this.chartCtx.stroke();

    // Draw Accuracy Curve (Emerald)
    this.chartCtx.beginPath();
    this.chartCtx.strokeStyle = '#10B981';
    this.chartCtx.lineWidth = 1.8;
    this.history.accuracy.forEach((acc, idx) => {
      const x = (idx / (this.history.accuracy.length - 1)) * w;
      const y = h - (acc / 100) * (h - 10) - 5;
      if (idx === 0) this.chartCtx.moveTo(x, y);
      else this.chartCtx.lineTo(x, y);
    });
    this.chartCtx.stroke();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.mlPlayground = new MLPlayground();
});
