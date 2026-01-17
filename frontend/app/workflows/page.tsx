'use client';

import { useState } from 'react';
import { WorkflowBuilder } from '../../components/WorkflowBuilder';
import { WorkflowExecutionLog } from '../../components/WorkflowExecutionLog';
import { SemanticCommandBar } from '../../components/SemanticCommandBar';
import { useWeilChain } from '@/lib/context/WeilChainContext';
import { ParsedIntent } from '@/lib/intent-engine';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function WorkflowsPage() {
  const { isConnected } = useWeilChain();
  const [activeTab, setActiveTab] = useState<'builder' | 'history'>('builder');
  const [generatedWorkflow, setGeneratedWorkflow] = useState<ParsedIntent | null>(null);

  /**
   * Handle workflow generation from semantic command bar
   */
  const handleWorkflowGenerated = (result: ParsedIntent) => {
    console.log('Workflow generated:', result);
    setGeneratedWorkflow(result);
    // The WorkflowBuilder will receive this via props and add the nodes
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Semantic Command Bar - Always available with Cmd+K */}
      <SemanticCommandBar 
        onWorkflowGenerated={handleWorkflowGenerated}
      />

      {/* Header */}
      <div className="border-b border-[#39FF14]/30">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#39FF14] font-mono mb-2">
                [WORKFLOW_COMPOSER]
              </h1>
              <p className="text-neutral-400 font-mono text-sm">
                Chain applets into automated multi-step workflows
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('builder')}
                className={`px-6 py-2 font-mono text-sm transition-colors ${
                  activeTab === 'builder'
                    ? 'bg-[#39FF14] text-black'
                    : 'border border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14]/10'
                }`}
              >
                [BUILDER]
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-2 font-mono text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'bg-[#39FF14] text-black'
                    : 'border border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14]/10'
                }`}
              >
                [EXECUTION_HISTORY]
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Required Banner */}
      {!isConnected && (
        <div className="border-b border-yellow-500/30 bg-yellow-900/20">
          <div className="max-w-[1800px] mx-auto px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <div className="text-yellow-500 font-bold text-sm">
                  [WALLET_CONNECTION_REQUIRED]
                </div>
                <div className="text-yellow-300/70 font-mono text-xs">
                  Connect your WeilWallet to create and deploy workflows
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-8 py-8">
        {activeTab === 'builder' ? (
          <WorkflowBuilder generatedWorkflow={generatedWorkflow} />
        ) : (
          <WorkflowExecutionLog />
        )}
      </div>
    </div>
  );
}
