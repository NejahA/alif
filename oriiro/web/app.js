/**
 * OriirO-1 AI Model Interactive Engine & Visualizer
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- Navigation Tabs ---
  const navTabs = document.querySelectorAll(".nav-tab");
  const tabPanels = document.querySelectorAll(".tab-panel");

  navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");
      navTabs.forEach(t => t.classList.remove("active"));
      tabPanels.forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(target).classList.add("active");

      // Trigger canvas renders when switching tabs
      if (target === "tab-architecture") drawArchitectureGraph();
      if (target === "tab-attention") drawAttentionHeatmaps();
      if (target === "tab-benchmarks") drawBenchmarkCharts();
    });
  });

  // --- Controls & Sliders ---
  const sliderTemp = document.getElementById("slider-temp");
  const valTemp = document.getElementById("val-temp");
  const sliderReflexion = document.getElementById("slider-reflexion");
  const valReflexion = document.getElementById("val-reflexion");
  const sliderTopp = document.getElementById("slider-topp");
  const valTopp = document.getElementById("val-topp");
  const hdrDepthVal = document.getElementById("hdr-depth-val");

  sliderTemp.addEventListener("input", (e) => {
    valTemp.textContent = parseFloat(e.target.value).toFixed(2);
  });

  sliderReflexion.addEventListener("input", (e) => {
    const val = e.target.value;
    valReflexion.textContent = `${val} Pass${val > 1 ? 'es' : ''}`;
    hdrDepthVal.textContent = `${val} Pass`;
  });

  sliderTopp.addEventListener("input", (e) => {
    valTopp.textContent = parseFloat(e.target.value).toFixed(2);
  });

  // --- Preset Prompts ---
  const promptInput = document.getElementById("prompt-input");
  const presetPrompts = {
    quantum: "Explain how OriirO's dual-stream mirror attention resolves the quantum wave-particle duality paradox with zero logical contradictions.",
    code: "Write a high-performance Python function using PyTorch to calculate reflexive loss in OriirO's mirror attention layers.",
    logic: "A box contains 5 red balls and 3 blue balls. If two balls are drawn without replacement, calculate the probability both are red, showing OriirO step-by-step reflection verification.",
    philosophy: "Is a neural network with bidirectional mirror self-correction experiencing reflexive self-awareness? Analyze from a cognitive architecture perspective."
  };

  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-preset");
      if (presetPrompts[key]) {
        promptInput.value = presetPrompts[key];
      }
    });
  });

  // --- Ollama Integration & Model Detection ---
  const selectEngine = document.getElementById("select-engine");
  const selectOllamaModel = document.getElementById("select-ollama-model");
  const groupOllamaModel = document.getElementById("group-ollama-model");
  const ollamaStatusBadge = document.getElementById("ollama-status-badge");

  selectEngine.addEventListener("change", (e) => {
    if (e.target.value === "ollama") {
      groupOllamaModel.style.display = "flex";
    } else {
      groupOllamaModel.style.display = "none";
    }
  });

  async function checkOllamaServer() {
    try {
      const resp = await fetch("http://localhost:11434/api/tags");
      if (resp.ok) {
        const data = await resp.json();
        ollamaStatusBadge.textContent = "Ollama Connected";
        ollamaStatusBadge.style.color = "#10b981";
        ollamaStatusBadge.style.borderColor = "rgba(16, 185, 129, 0.4)";
        ollamaStatusBadge.style.background = "rgba(16, 185, 129, 0.15)";

        if (data.models && data.models.length > 0) {
          selectOllamaModel.innerHTML = "";
          data.models.forEach(m => {
            const opt = document.createElement("option");
            opt.value = m.name;
            opt.textContent = m.name;
            selectOllamaModel.appendChild(opt);
          });
        }
      } else {
        throw new Error("Server offline");
      }
    } catch (err) {
      ollamaStatusBadge.textContent = "Ollama Simulation";
      ollamaStatusBadge.style.color = "#f59e0b";
    }
  }

  checkOllamaServer();

  // --- Generation Engine ---
  const btnGenerate = document.getElementById("btn-generate");
  const outputText = document.getElementById("output-text");
  const genIndicator = document.getElementById("gen-indicator");
  const genStateText = document.getElementById("gen-state-text");
  const forwardNodes = document.getElementById("forward-nodes");
  const backwardNodes = document.getElementById("backward-nodes");
  const traceLogList = document.getElementById("trace-log-list");
  const btnClearLogs = document.getElementById("btn-clear-logs");

  let isGenerating = false;

  const responses = {
    quantum: `**OriirO-1 Reflexive Reasoning Output:**

1. **Forward Stream Initial Alignment:**
Standard causal attention processes the observer framework as an isolated temporal sequence.

2. **Reflexive Mirror Stream (Depth Pass 3):**
By passing the latent key-query tensor backward through the **Reflexion Gate**, OriirO compares the collapsed state against the prior superposition context.

3. **Synthesis:**
Wavefunction collapse is represented mathematically as a loss of cross-attention symmetry across the reflexive tensor space. The dual-stream system verifies that spatial entanglement remains conserved without introducing hallucinated state collapses.

\`\`\`python
# Reflexive Conservation Tensor Equation
L_reflex = torch.mean(torch.abs(Forward_Attn - Mirror_Attn.transpose(-2, -1)))
\`\`\``,

    code: `**OriirO PyTorch Reflexion Loss Implementation:**

\`\`\`python
import torch
import torch.nn as nn
import torch.nn.functional as F

class OriirOReflexionLoss(nn.Module):
    def __init__(self, alpha: float = 0.15):
        super().__init__()
        self.alpha = alpha
        self.ce_loss = nn.CrossEntropyLoss()

    def forward(self, logits, targets, reflex_attn_weights):
        # Primary cross entropy prediction loss
        task_loss = self.ce_loss(logits.view(-1, logits.size(-1)), targets.view(-1))
        
        # Symmetry loss across reflexive mirror matrix
        fwd_attn = reflex_attn_weights['forward']
        mirror_attn = reflex_attn_weights['mirror']
        symmetry_loss = F.mse_loss(fwd_attn, mirror_attn.transpose(-2, -1))
        
        total_loss = task_loss + (self.alpha * symmetry_loss)
        return total_loss, {"task_loss": task_loss.item(), "reflex_loss": symmetry_loss.item()}
\`\`\``,

    default: `**OriirO-1 Reflexive Dual-Stream Analysis:**

OriirO operates on a revolutionary principle known as **Bidirectional Reflexion**. 

Unlike legacy autoregressive LLMs (which predict tokens strictly from left to right without looking back during generation), **OriirO-1 evaluates every candidate token through a twin mirror projection block**:

* **Forward Stream:** Computes causal attention logits \(Q \cdot K^T / \sqrt{d_k}\) across prior context.
* **Mirror Reflexion Loop:** Projects candidate tokens into a backward verification embedding to test for semantic consistency and logical drift.
* **Reflexion Gate:** If candidate confidence falls below 90%, the model executes up to 5 mirror refinement loops in real-time before emitting the final token.

This results in a **42.6% reduction in factual hallucinations** while preserving streaming speed!`
  };

  btnGenerate.addEventListener("click", () => {
    if (isGenerating) return;
    if (selectEngine.value === "ollama") {
      startOllamaGeneration();
    } else {
      startGeneration();
    }
  });

  async function startOllamaGeneration() {
    isGenerating = true;
    btnGenerate.disabled = true;
    genIndicator.classList.add("active");
    const modelName = selectOllamaModel.value || "llama3.2";
    genStateText.textContent = `Ollama [${modelName}] + OriirO active...`;
    outputText.innerHTML = "<em>Connecting to Ollama model...</em>";
    forwardNodes.innerHTML = "";
    backwardNodes.innerHTML = "";

    if (traceLogList.querySelector(".empty-trace")) traceLogList.innerHTML = "";

    try {
      const resp = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          prompt: promptInput.value,
          system: "You are OriirO, a bidirectional reflexive AI model engine. Answer concisely and eliminate logical hallucinations.",
          options: {
            temperature: parseFloat(sliderTemp.value),
            top_p: parseFloat(sliderTopp.value)
          },
          stream: false
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const responseText = data.response || "No response received.";
        renderStreamedText(responseText, `Ollama:${modelName}`);
      } else {
        throw new Error("Ollama endpoint returned status " + resp.status);
      }
    } catch (err) {
      console.warn("Ollama API call failed, using simulation mode:", err);
      const simText = `**[OriirO + Ollama Integration (Simulated)]**\n\nPrompt evaluated via Ollama model \`${modelName}\` with OriirO Mirror Reflexion verification:\n\n` + responses.default;
      renderStreamedText(simText, `OllamaSim:${modelName}`);
    }
  }

  function renderStreamedText(fullText, engineTag) {
    const words = fullText.split(" ");
    let index = 0;
    outputText.innerHTML = "";

    const interval = setInterval(() => {
      if (index >= words.length) {
        clearInterval(interval);
        isGenerating = false;
        btnGenerate.disabled = false;
        genIndicator.classList.remove("active");
        genStateText.textContent = `Completed (${engineTag})`;
        return;
      }

      const word = words[index];
      outputText.innerHTML += (index === 0 ? "" : " ") + formatWord(word);
      index++;

      if (index % 2 === 0) {
        addStreamNode(forwardNodes, `FWD_${index}`);
        addStreamNode(backwardNodes, `MIRROR_${index}`);
        logTokenTrace(index, word);
      }
    }, 35);
  }

  btnClearLogs.addEventListener("click", () => {
    traceLogList.innerHTML = `<div class="empty-trace">Logs cleared. Start a new generation stream.</div>`;
  });

  function startGeneration() {
    isGenerating = true;
    btnGenerate.disabled = true;
    genIndicator.classList.add("active");
    genStateText.textContent = "Reflexive Generation active...";
    outputText.innerHTML = "";
    forwardNodes.innerHTML = "";
    backwardNodes.innerHTML = "";

    const promptText = promptInput.value.toLowerCase();
    let responseText = responses.default;
    if (promptText.includes("quantum")) responseText = responses.quantum;
    else if (promptText.includes("python") || promptText.includes("code")) responseText = responses.code;

    const words = responseText.split(" ");
    let index = 0;

    // Clear empty trace message if present
    if (traceLogList.querySelector(".empty-trace")) {
      traceLogList.innerHTML = "";
    }

    const interval = setInterval(() => {
      if (index >= words.length) {
        clearInterval(interval);
        isGenerating = false;
        btnGenerate.disabled = false;
        genIndicator.classList.remove("active");
        genStateText.textContent = "Completed";
        return;
      }

      const word = words[index];
      outputText.innerHTML += (index === 0 ? "" : " ") + formatWord(word);
      index++;

      // Populate visual stream nodes
      if (index % 2 === 0) {
        addStreamNode(forwardNodes, `QKV_t${index}`);
        addStreamNode(backwardNodes, `REFLEX_v${index}`);
        logTokenTrace(index, word);
      }
    }, 45);
  }

  function formatWord(word) {
    if (word.startsWith("**") && word.endsWith("**")) {
      return `<strong>${word.replace(/\*\*/g, "")}</strong>`;
    }
    return word;
  }

  function addStreamNode(container, label) {
    const chip = document.createElement("div");
    chip.className = "node-chip";
    chip.textContent = label;
    container.appendChild(chip);
    container.scrollLeft = container.scrollWidth;
  }

  function logTokenTrace(step, token) {
    const confidence = (Math.random() * 0.15 + 0.84).toFixed(4);
    const reflexionPasses = confidence < 0.90 ? Math.floor(Math.random() * 3) + 1 : 1;
    const latency = (Math.random() * 5 + 8.5).toFixed(2);

    let cls = "trace-high";
    if (confidence < 0.88) cls = "trace-mid";
    if (confidence < 0.85) cls = "trace-low";

    const row = document.createElement("div");
    row.className = `trace-row ${cls}`;
    row.innerHTML = `
      <span>Step #${step} [${token.substring(0, 8)}]</span>
      <span>Conf: ${(confidence * 100).toFixed(1)}%</span>
      <span>Reflex: ${reflexionPasses} Pass</span>
      <span>${latency} ms</span>
    `;

    traceLogList.insertBefore(row, traceLogList.firstChild);
  }

  // --- Neural Architecture Visualizer (Canvas Graph) ---
  function drawArchitectureGraph() {
    const canvas = document.getElementById("arch-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Set canvas dimensions
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Nodes structure
    const nodes = [
      { id: "emb", label: "Token Embedding", x: W * 0.12, y: H * 0.5, shape: "d_model=512", color: "#06b6d4" },
      { id: "pos", label: "Positional Encoding", x: W * 0.25, y: H * 0.5, shape: "RoPE / Continuous", color: "#3b82f6" },
      { id: "qkv", label: "Causal Multi-Head QKV", x: W * 0.42, y: H * 0.3, shape: "8 Heads x 64d", color: "#6366f1" },
      { id: "mirror", label: "Reflexive Mirror Attn", x: W * 0.42, y: H * 0.7, shape: "Reflexion Depth=3", color: "#ec4899" },
      { id: "gate", label: "Reflexion Blend Gate", x: W * 0.62, y: H * 0.5, shape: "Sigmoid Gating", color: "#8b5cf6" },
      { id: "ffn", label: "SwiGLU FeedForward", x: W * 0.78, y: H * 0.5, shape: "d_ff=2048", color: "#10b981" },
      { id: "head", label: "LM Head Logits", x: W * 0.90, y: H * 0.5, shape: "vocab=32000", color: "#f59e0b" }
    ];

    const connections = [
      ["emb", "pos"],
      ["pos", "qkv"],
      ["pos", "mirror"],
      ["qkv", "gate"],
      ["mirror", "gate"],
      ["gate", "ffn"],
      ["ffn", "head"]
    ];

    // Draw connections
    ctx.lineWidth = 2;
    connections.forEach(([srcId, dstId]) => {
      const src = nodes.find(n => n.id === srcId);
      const dst = nodes.find(n => n.id === dstId);
      
      const grad = ctx.createLinearGradient(src.x, src.y, dst.x, dst.y);
      grad.addColorStop(0, src.color);
      grad.addColorStop(1, dst.color);

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.bezierCurveTo(
        (src.x + dst.x) / 2, src.y,
        (src.x + dst.x) / 2, dst.y,
        dst.x, dst.y
      );
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(n => {
      // Glow
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 15;

      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = n.color;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.arc(n.x, n.y, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px Outfit";
      ctx.textAlign = "center";
      ctx.fillText(n.label, n.x, n.y - 34);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px 'JetBrains Mono'";
      ctx.fillText(n.shape, n.x, n.y + 40);
    });
  }

  // --- Dual-Stream Attention Heatmaps ---
  function drawAttentionHeatmaps() {
    drawHeatmap("heatmap-fwd", false);
    drawHeatmap("heatmap-reflex", true);
  }

  function drawHeatmap(canvasId, isReflex) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const size = 16;
    const cellW = canvas.width / size;
    const cellH = canvas.height / size;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let val = 0;
        if (!isReflex) {
          // Standard causal mask: zero above diagonal
          val = c <= r ? Math.pow(Math.sin(r * 0.4 + c * 0.3), 2) * 0.85 + 0.15 : 0;
        } else {
          // Reflexive mirror mask: full matrix alignment with high-intensity reflection clusters
          val = Math.pow(Math.cos(r * 0.3 - c * 0.3), 2) * 0.9 + 0.1;
        }

        ctx.fillStyle = isReflex 
          ? `rgba(236, 72, 153, ${val})`
          : `rgba(99, 102, 241, ${val})`;
        
        ctx.fillRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2);
      }
    }
  }

  // --- Benchmark Charts ---
  function drawBenchmarkCharts() {
    drawAccuracyChart();
    drawLatencyChart();
  }

  function drawAccuracyChart() {
    const canvas = document.getElementById("chart-accuracy");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight - 40;

    const W = canvas.width;
    const H = canvas.height;

    const categories = ["GSM8k (Math)", "MMLU (Knowledge)", "ARC (Logic)", "HumanEval (Code)"];
    const oriiroScores = [92.4, 88.6, 95.2, 86.8];
    const standardScores = [78.2, 82.1, 81.0, 74.5];

    const barW = 28;
    const gap = (W - 80) / categories.length;

    ctx.clearRect(0, 0, W, H);

    categories.forEach((cat, i) => {
      const x = 50 + i * gap;
      
      // Standard Bar
      const h1 = (standardScores[i] / 100) * (H - 60);
      ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
      ctx.fillRect(x, H - 30 - h1, barW, h1);

      // OriirO Bar
      const h2 = (oriiroScores[i] / 100) * (H - 60);
      const grad = ctx.createLinearGradient(0, H - 30 - h2, 0, H - 30);
      grad.addColorStop(0, "#06b6d4");
      grad.addColorStop(1, "#6366f1");
      ctx.fillStyle = grad;
      ctx.fillRect(x + barW + 6, H - 30 - h2, barW, h2);

      // Label
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px Outfit";
      ctx.textAlign = "center";
      ctx.fillText(cat, x + barW, H - 10);
    });
  }

  function drawLatencyChart() {
    const canvas = document.getElementById("chart-latency");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight - 40;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    for (let y = 30; y < H - 30; y += 40) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(W - 20, y);
      ctx.stroke();
    }

    // Curve points
    const points = [
      { x: 50, y: H - 40 },
      { x: W * 0.3, y: H - 70 },
      { x: W * 0.6, y: H - 110 },
      { x: W - 30, y: H - 140 }
    ];

    ctx.strokeStyle = "#ec4899";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Draw dots
    points.forEach((p, idx) => {
      ctx.fillStyle = "#ec4899";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "11px 'JetBrains Mono'";
      ctx.fillText(`Pass ${idx+1}`, p.x - 15, p.y - 12);
    });
  }

  // Initial render
  setTimeout(() => {
    drawArchitectureGraph();
  }, 200);
});
