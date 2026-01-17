'use client';

import { useState, useEffect } from 'react';
import { WorkflowBuilder } from '../../components/WorkflowBuilder';
import { WorkflowExecutionLog } from '../../components/WorkflowExecutionLog';
import { SemanticCommandBar } from '../../components/SemanticCommandBar';
import { useWeilChain } from '@/lib/context/WeilChainContext';
import { ParsedIntent } from '@/lib/intent-engine';
import { useSearchParams } from 'next/navigation';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function WorkflowsPage() {
  const { isConnected, address, wallet, connect } = useWeilChain();
  const [activeTab, setActiveTab] = useState<'builder' | 'history'>('builder');
  const [generatedWorkflow, setGeneratedWorkflow] = useState<ParsedIntent | null>(null);
  const searchParams = useSearchParams();

  /**
   * Debug: Log connection state
   */
  console.log('[WorkflowsPage] Connection State:', { 
    isConnected, 
    address, 
    hasWallet: !!wallet,
    localStorage: typeof window !== 'undefined' ? localStorage.getItem('wauth_connected') : null
  });

  /**
   * Auto-load workflow from URL params (from arbitrage page)
   */
  useEffect(() => {
    const autoConfigParam = searchParams?.get('autoConfig');
    if (autoConfigParam) {
      try {
        const config = JSON.parse(autoConfigParam);
        
        // Create optimized arbitrage workflow
        const arbitrageWorkflow: ParsedIntent = {
          action: config.signal === 'MINT DJED' ? 'mint' : 'redeem',
          amount: 1000, // Default $1000 trade
          applets: [
            {
              id: 'price-oracle',
              name: 'Price Oracle',
              description: 'Monitor DEX and protocol prices in real-time',
              category: 'defi',
              config: {
                dexPrice: config.dexPrice,
                protocolPrice: config.protocolPrice,
                spread: config.spread,
                refreshInterval: 15,
              },
            },
            {
              id: 'arb-hunter',
              name: 'Arb-Hunter',
              description: 'Detect and execute profitable arbitrage opportunities',
              category: 'defi',
              config: {
                signal: config.signal,
                minSpread: 0.5, // 0.5% minimum
                expectedProfit: config.expectedProfit,
                liquidity: config.liquidity,
                autoExecute: config.autoExecute || false,
              },
            },
            {
              id: 'mev-shield',
              name: 'MEV Shield',
              description: 'Protect against frontrunning and sandwich attacks',
              category: 'security',
              config: {
                maxSlippage: 0.5, // 0.5% max slippage
                usePrivateMempool: true,
                flashbotsProtection: true,
              },
            },
            {
              id: 'gas-optimizer',
              name: 'Gas Optimizer',
              description: 'Optimize transaction gas fees for maximum profit',
              category: 'optimization',
              config: {
                strategy: 'fast', // Execute quickly to capture arbitrage
                maxGasPrice: 150, // gwei
                estimateProfit: config.expectedProfit,
              },
            },
          ],
          confidence: 0.95,
          reasoning: `Arbitrage opportunity detected: ${config.signal} with ${config.spread.toFixed(2)}% spread. Expected profit: $${config.expectedProfit.toFixed(2)} on $1000 trade. This workflow will monitor prices, execute the arbitrage with MEV protection, and optimize gas fees.`,
        };

        setGeneratedWorkflow(arbitrageWorkflow);
        setActiveTab('builder'); // Ensure builder tab is active
        
        console.log('[WorkflowsPage] Auto-loaded arbitrage workflow:', arbitrageWorkflow);
      } catch (error) {
        console.error('[WorkflowsPage] Failed to parse autoConfig:', error);
      }
    }
  }, [searchParams]);

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
            <div className="flex items-center justify-between">
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
              <button
                onClick={connect}
                className="px-4 py-2 bg-[#39FF14] text-black font-mono text-sm hover:bg-[#39FF14]/80 transition-colors"
              >
                [CONNECT_WALLET]
              </button>
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
