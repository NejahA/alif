// In-memory data store with comprehensive seed data for BrandNew AI Workflow Hub

export const initialAgents = [
  {
    id: "agent-1",
    name: "Architect Prime",
    role: "System Architect & Lead Reasoner",
    avatar: "🤖",
    color: "#6366f1",
    model: "Gemini 2.0 Flash (Reasoning)",
    temperature: 0.2,
    contextLimit: "1M tokens",
    status: "ready",
    systemPrompt: "You are an elite enterprise software architect. Analyze system requirements, decompose complex problems into modular components, identify concurrency bottlenecks, and propose resilient scalable architectures with precise design patterns.",
    tools: ["Code Sandbox", "Dependency Visualizer", "Architecture Validator"],
    metrics: { tasksCompleted: 142, avgLatency: "480ms", reliability: "99.8%" },
    tags: ["Architecture", "System Design", "High-Performance"]
  },
  {
    id: "agent-2",
    name: "CodeCraft Sentinel",
    role: "Full-Stack Implementation & Refactoring",
    avatar: "⚡",
    color: "#10b981",
    model: "Claude 3.7 Sonnet (Hybrid)",
    temperature: 0.4,
    contextLimit: "200k tokens",
    status: "ready",
    systemPrompt: "You are an expert full-stack engineer proficient in React, Node.js, TypeScript, and modern distributed systems. Write immaculate, production-grade code adhering to Clean Code principles, robust error boundaries, and optimal performance.",
    tools: ["AST Parser", "Linter Engine", "Test Generator", "Git Blame Analyzer"],
    metrics: { tasksCompleted: 389, avgLatency: "620ms", reliability: "99.4%" },
    tags: ["Frontend", "Backend", "Clean Code"]
  },
  {
    id: "agent-3",
    name: "DeepPulse Analyst",
    role: "Context Extraction & Document Synthesis",
    avatar: "🔍",
    color: "#06b6d4",
    model: "GPT-4o (Multimodal)",
    temperature: 0.1,
    contextLimit: "128k tokens",
    status: "idle",
    systemPrompt: "You are a research synthesis engine capable of deep semantic analysis across massive multi-page documents, codebases, and structured technical data. Extract actionable insights, cross-reference contradictions, and cite exact passages.",
    tools: ["Vector Indexer", "Regex Extractor", "Citation Anchor", "Table Parser"],
    metrics: { tasksCompleted: 215, avgLatency: "390ms", reliability: "99.9%" },
    tags: ["Research", "Documents", "Vector Search"]
  },
  {
    id: "agent-4",
    name: "Veritas QA & Security",
    role: "Vulnerability Auditor & Adversarial Tester",
    avatar: "🛡️",
    color: "#f59e0b",
    model: "DeepSeek R1 (Chain of Thought)",
    temperature: 0.3,
    contextLimit: "64k tokens",
    status: "ready",
    systemPrompt: "You are an aggressive security auditor and QA test designer. Conduct thorough threat modeling, detect OWASP Top 10 vulnerabilities, verify input sanitation, and generate comprehensive fuzzing test vectors.",
    tools: ["Security Scanner", "Fuzzing Engine", "Memory Leak Detector"],
    metrics: { tasksCompleted: 178, avgLatency: "710ms", reliability: "99.6%" },
    tags: ["Security", "Testing", "Threat Modeling"]
  }
];

export const initialWorkflows = [
  {
    id: "wf-1",
    name: "Autonomous Feature Specification & Code Generation",
    description: "End-to-end pipeline that takes a high-level product feature request, designs the schema, generates robust code, and validates against security criteria.",
    status: "active",
    category: "Software Development",
    createdAt: "2026-10-14T09:00:00Z",
    nodes: [
      {
        id: "node-1",
        label: "Feature Request Ingestion",
        type: "input",
        agentId: null,
        status: "completed",
        config: { inputFormat: "Markdown Spec", schemaValidation: true },
        output: "Raw feature requirement: 'Build real-time prompt telemetry and variable substitution workbench'",
        x: 80,
        y: 120
      },
      {
        id: "node-2",
        label: "Architecture Decomposition",
        type: "agent",
        agentId: "agent-1",
        status: "completed",
        config: { model: "Gemini 2.0 Flash", maxTokens: 1500 },
        output: "Defined 4 REST routes, SSE event bus for streaming tokens, reactive state store, and CSS variable token system.",
        x: 360,
        y: 120
      },
      {
        id: "node-3",
        label: "Component & API Implementation",
        type: "agent",
        agentId: "agent-2",
        status: "running",
        config: { framework: "React + Express", testCoverage: ">90%" },
        output: "Generating modular React components and Express controllers...",
        x: 640,
        y: 120
      },
      {
        id: "node-4",
        label: "Security & Edge-Case Audit",
        type: "agent",
        agentId: "agent-4",
        status: "idle",
        config: { owaspCheck: true, sanitizeHtml: true },
        output: "Awaiting upstream code stream...",
        x: 920,
        y: 120
      }
    ],
    connections: [
      { from: "node-1", to: "node-2" },
      { from: "node-2", to: "node-3" },
      { from: "node-3", to: "node-4" }
    ]
  },
  {
    id: "wf-2",
    name: "Deep Technical Research & Multi-Document Synthesizer",
    description: "Ingests multiple technical documents, cross-references architectural trade-offs, and outputs an executive synthesis with decision matrix.",
    status: "ready",
    category: "Knowledge & Research",
    createdAt: "2026-10-14T08:30:00Z",
    nodes: [
      {
        id: "node-201",
        label: "Document Corpus Ingestion",
        type: "input",
        agentId: null,
        status: "completed",
        config: { fileTypes: [".md", ".json", ".txt"], maxDocs: 10 },
        output: "Ingested 3 system design documents and API specs.",
        x: 100,
        y: 100
      },
      {
        id: "node-202",
        label: "Semantic Entity & Citation Analysis",
        type: "agent",
        agentId: "agent-3",
        status: "ready",
        config: { chunkOverlap: 120, similarityThreshold: 0.82 },
        output: "Indexed 18 core design patterns and verified consistency across 4 modules.",
        x: 420,
        y: 100
      },
      {
        id: "node-203",
        label: "Decision Matrix Formulation",
        type: "agent",
        agentId: "agent-1",
        status: "idle",
        config: { format: "Markdown Table + Trade-offs" },
        output: "Pending trigger...",
        x: 740,
        y: 100
      }
    ],
    connections: [
      { from: "node-201", to: "node-202" },
      { from: "node-202", to: "node-203" }
    ]
  }
];

export const initialPrompts = [
  {
    id: "prompt-1",
    title: "System Design & Microservice Decomposer",
    category: "Architecture",
    version: "v2.4",
    variables: ["system_name", "throughput_qps", "primary_bottleneck", "sla_target"],
    template: `You are the Lead Systems Architect evaluating the architecture for {{system_name}}.
Target Throughput: {{throughput_qps}} req/sec with an SLA target of {{sla_target}}.
Primary identified bottleneck: {{primary_bottleneck}}.

Provide:
1. High-level component decomposition diagram in ASCII/Mermaid.
2. Caching & partition strategy to mitigate {{primary_bottleneck}}.
3. Failure mode analysis (circuit breakers, fallbacks, backpressure).
4. Concrete technology choices with verifiable trade-offs.`,
    sampleInputs: {
      system_name: "BrandNew Telemetry Pipeline",
      throughput_qps: "50,000",
      primary_bottleneck: "Write Amplification on Time-Series Store",
      sla_target: "p99 < 80ms"
    },
    performanceScore: 94,
    latency: "510ms"
  },
  {
    id: "prompt-2",
    title: "Zero-Shot Adversarial Security Reviewer",
    category: "Security",
    version: "v1.8",
    variables: ["target_code", "runtime_env", "user_input_surface"],
    template: `Act as a senior offensive security researcher auditing the following component:
Environment: {{runtime_env}}
Exposed Attack Surface: {{user_input_surface}}

Source Code:
\`\`\`
{{target_code}}
\`\`\`

Detect:
- Remote code execution or SSRF vectors
- Injection vulnerabilities (SQL, NoSQL, Prototype Pollution)
- Insecure direct object references (IDOR)
- Concurrency race conditions or unhandled promise rejections.`,
    sampleInputs: {
      runtime_env: "Node.js 20 Express Microservice",
      user_input_surface: "REST JSON payload + Query Params",
      target_code: "app.post('/api/run', (req, res) => {\n  const script = req.body.command;\n  eval(script);\n});"
    },
    performanceScore: 98,
    latency: "630ms"
  },
  {
    id: "prompt-3",
    title: "Prompt Chain Refiner & Few-Shot Optimizer",
    category: "Prompt Engineering",
    version: "v3.1",
    variables: ["original_prompt", "target_model", "desired_output_format"],
    template: `Analyze this raw prompt for optimization:
Model Target: {{target_model}}
Desired Format: {{desired_output_format}}

Raw Prompt:
"""
{{original_prompt}}
"""

Rewrite this prompt using structured role-playing, XML delimiters, step-by-step thinking instructions, negative constraints, and high-efficiency few-shot anchors.`,
    sampleInputs: {
      original_prompt: "Summarize this article and make it sound smart.",
      target_model: "Claude 3.7 / GPT-4o",
      desired_output_format: "JSON with 'key_takeaways', 'controversial_points', and 'actionable_steps'"
    },
    performanceScore: 96,
    latency: "420ms"
  }
];

export const initialDocuments = [
  {
    id: "doc-1",
    name: "distributed_consensus_specs.md",
    size: "14.2 KB",
    type: "markdown",
    uploadedAt: "2026-10-14T09:15:00Z",
    tokenCount: 3420,
    summary: "Specifications for Raft leader election, heartbeats, log replication, and split-brain resolution protocols.",
    content: `# Distributed Consensus Protocol Specifications

## 1. Overview
This specification details the consensus algorithm governing our distributed state machine across multi-region clusters.

### Key Invariants:
- Election Safety: At most one leader can be elected in a given term.
- Leader Append-Only: A leader never overwrites or truncates its own log entries.
- Log Matching: If two logs contain an entry with the same index and term, then the logs are identical in all entries up through the given index.
- Leader Completeness: If a log entry is committed in a given term, then that entry will be present in the logs of the leaders for all higher-numbered terms.

## 2. Heartbeat & Failure Detection
- Leaders broadcast empty AppendEntries RPCs every 150ms.
- Follower election timeout randomized between 300ms and 600ms.
- Network partition handling: Quorum of (N/2 + 1) active nodes strictly enforced before committing any write.`
  },
  {
    id: "doc-2",
    name: "ai_agent_runtime_manifest.json",
    size: "8.7 KB",
    type: "json",
    uploadedAt: "2026-10-14T10:00:00Z",
    tokenCount: 2180,
    summary: "Manifest declaring sandbox capabilities, memory limits, and tool execution boundaries for autonomous agents.",
    content: `{
  "runtime": "BrandNew-AgentVM",
  "version": "2.4.0",
  "concurrency_limit": 16,
  "default_timeout_ms": 30000,
  "sandboxing": {
    "network_egress": "allowlist_only",
    "filesystem_access": "virtual_tmpfs",
    "max_memory_mb": 512,
    "max_cpu_percent": 80
  },
  "registered_toolchains": [
    "ast_parser",
    "vector_search",
    "git_operations",
    "test_runner",
    "crypto_verifier"
  ]
}`
  }
];

export const initialTelemetry = {
  totalExecutions: 1482,
  activeAgents: 4,
  avgResponseTimeMs: 468,
  tokenThroughputPerSec: 1840,
  cacheHitRatio: "88.4%",
  recentEvents: [
    { id: "ev-1", time: "11:28:14", type: "AGENT_EXEC", agent: "Architect Prime", status: "success", detail: "Decomposed API specification for Workflow #1" },
    { id: "ev-2", time: "11:29:05", type: "PROMPT_EVAL", agent: "Veritas QA", status: "success", detail: "Scored Prompt v2.4 (Security) at 98/100" },
    { id: "ev-3", time: "11:30:22", type: "WORKFLOW_TRIGGER", agent: "Orchestrator", status: "running", detail: "Triggered 'Autonomous Feature Specification' pipeline" },
    { id: "ev-4", time: "11:32:01", type: "DOC_ANALYSIS", agent: "DeepPulse Analyst", status: "success", detail: "Indexed 3,420 tokens in distributed_consensus_specs.md" }
  ]
};
