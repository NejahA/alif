'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import CyberDefenseGame from '@/components/CyberDefenseGame';
import PromptHackerSandbox from '@/components/PromptHackerSandbox';
import MultiAgentSwarmVisualizer from '@/components/MultiAgentSwarmVisualizer';
import AgentMemoryGraph from '@/components/AgentMemoryGraph';
import ThreatHunterMatrix from '@/components/ThreatHunterMatrix';
import KubernetesAutoscaler from '@/components/KubernetesAutoscaler';
import InfrastructureTycoon from '@/components/InfrastructureTycoon';
import TokenFleetRouter from '@/components/TokenFleetRouter';
import DatasetSynthesizer from '@/components/DatasetSynthesizer';
import EdgePingBenchmark from '@/components/EdgePingBenchmark';
import RateLimitStressTester from '@/components/RateLimitStressTester';
import PipelineBuilder from '@/components/PipelineBuilder';
import MetricsChart from '@/components/MetricsChart';
import InteractiveDemo from '@/components/InteractiveDemo';
import AgentFineTuner from '@/components/AgentFineTuner';
import VectorDatabaseVisualizer from '@/components/VectorDatabaseVisualizer';
import QueryProfiler from '@/components/QueryProfiler';
import DbMigrationRunner from '@/components/DbMigrationRunner';
import DbReplicationMonitor from '@/components/DbReplicationMonitor';
import ServiceMeshGraph from '@/components/ServiceMeshGraph';
import KafkaQueueVisualizer from '@/components/KafkaQueueVisualizer';
import AgentLogsDebugger from '@/components/AgentLogsDebugger';
import DiagnosticRepairConsole from '@/components/DiagnosticRepairConsole';
import Integrations from '@/components/Integrations';
import WebhookTester from '@/components/WebhookTester';
import EdgeRegionDeployer from '@/components/EdgeRegionDeployer';
import CloudProviderSwitcher from '@/components/CloudProviderSwitcher';
import FailoverSimulator from '@/components/FailoverSimulator';
import RateLimiterSimulator from '@/components/RateLimiterSimulator';
import LoadTester from '@/components/LoadTester';
import CdnCacheManager from '@/components/CdnCacheManager';
import SecretVault from '@/components/SecretVault';
import BudgetGuard from '@/components/BudgetGuard';
import EdgePingTester from '@/components/EdgePingTester';
import SystemStatusTimeline from '@/components/SystemStatusTimeline';
import ApiPlayground from '@/components/ApiPlayground';
import SecurityMatrix from '@/components/SecurityMatrix';
import AuditLogStream from '@/components/AuditLogStream';
import OrgWorkspaceSwitcher from '@/components/OrgWorkspaceSwitcher';
import CodeExportModal from '@/components/CodeExportModal';
import RoiCalculator from '@/components/RoiCalculator';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';
import DashboardModal from '@/components/DashboardModal';
import LiveCopilotDrawer from '@/components/LiveCopilotDrawer';

export default function Home() {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  return (
    <main style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Background Grids & Aurora Effects */}
      <div className="bg-grid"></div>
      <div className="aurora-glow-1"></div>
      <div className="aurora-glow-2"></div>

      {/* Main Page Layout */}
      <Navbar onOpenDashboard={() => setIsDashboardOpen(true)} />
      <Hero onOpenDashboard={() => setIsDashboardOpen(true)} />
      <Features />
      <CyberDefenseGame />
      <PromptHackerSandbox />
      <MultiAgentSwarmVisualizer />
      <AgentMemoryGraph />
      <ThreatHunterMatrix />
      <KubernetesAutoscaler />
      <InfrastructureTycoon />
      <TokenFleetRouter />
      <DatasetSynthesizer />
      <EdgePingBenchmark />
      <RateLimitStressTester />
      <MetricsChart />
      <PipelineBuilder />
      <AgentFineTuner />
      <VectorDatabaseVisualizer />
      <QueryProfiler />
      <DbMigrationRunner />
      <DbReplicationMonitor />
      <ServiceMeshGraph />
      <KafkaQueueVisualizer />
      <InteractiveDemo />
      <AgentLogsDebugger />
      <DiagnosticRepairConsole />
      <Integrations />
      <WebhookTester />
      <EdgeRegionDeployer />
      <CloudProviderSwitcher />
      <FailoverSimulator />
      <RateLimiterSimulator />
      <LoadTester />
      <CdnCacheManager />
      <SecretVault />
      <BudgetGuard />
      <EdgePingTester />
      <SystemStatusTimeline />
      <ApiPlayground />
      <SecurityMatrix />
      <AuditLogStream />
      <OrgWorkspaceSwitcher />
      <CodeExportModal />
      <RoiCalculator onOpenDashboard={() => setIsDashboardOpen(true)} />
      <Pricing onOpenDashboard={() => setIsDashboardOpen(true)} />
      <Testimonials />
      <FaqSection />
      <Footer />

      {/* Live Workspace Modal */}
      <DashboardModal 
        isOpen={isDashboardOpen} 
        onClose={() => setIsDashboardOpen(false)} 
      />

      {/* Floating AI Copilot Assistant */}
      <LiveCopilotDrawer />
    </main>
  );
}
