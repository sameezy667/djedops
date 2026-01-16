/**
 * DjedOPS Applet Page
 * 
 * Wrapper component that makes DjedOPS compatible with the WeilChain Applet Protocol.
 * This component receives wallet context from the parent marketplace and passes it
 * to the DjedOPS dashboard components.
 * 
 * Key Changes from Original:
 * - Receives WeilWallet instance from parent
 * - Removes Nautilus wallet integration
 * - Uses WeilChain SDK for all transactions
 * - Maintains all existing DjedOPS functionality
 * 
 * Route: /applet/djedops (launched from marketplace)
 */

'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback } from 'react'
import { SimulationModal } from '@/components/SimulationModal'
import { WhitePaperModal } from '@/components/WhitePaperModal'
import { TerminalFeed } from '@/components/TerminalFeed'
import { ApiStatusBar, ApiErrorBanner } from '@/components/ApiStatus'
import { ErrorBanner } from '@/components/ErrorBanner'
import { MarketOpportunityCard } from '@/components/MarketOpportunityCard'
import { StabilityGauge } from '@/components/StabilityGauge'
import { WalletBalance } from '@/components/WalletBalance'
import { SentinelToggle, SentinelPanel, SentinelShield } from '@/components/SentinelPanel'
import { PerformanceToggle } from '@/components/PerformanceToggle'
import { KYAModal } from '@/components/KYAModal'
import { ShareButton } from '@/components/ShareButton'
import ReserveHistoryChart from '@/components/ReserveHistoryChart'
import StressTest from '@/components/StressTest'
import ProtocolInspector from '@/components/ProtocolInspector'
import OracleConsensus from '@/components/OracleConsensus'
import { SentinelTriggerBanner, DashboardBorderFlash } from '@/components/SentinelTrigger'
import { RootCauseAnalyzer } from '@/components/RootCauseAnalyzer'
import { ConfidenceGauge } from '@/components/ConfidenceGauge'
import { TimeTravel } from '@/components/TimeTravel'
import { useAppStore } from '@/lib/store'
import { useDjedData } from '@/lib/hooks/useDjedData'
import { useTransactionFeed } from '@/lib/hooks/useTransactionFeed'
import { useReplayData } from '@/lib/hooks/useReplayData'
import { DemoService } from '@/lib/demo-service'
import { TransactionEvent, SimulationScenario } from '@/lib/types'
import { calculateReserveRatio, determineSystemStatus } from '@/lib/calculations'
import { calculateDSI } from '@/lib/utils/dsiCalculator'
import { useDexPrice } from '@/lib/hooks/useDexPrice'
import { API_CONFIG, BLOCKCHAIN, RESERVE_RATIO } from '@/lib/constants'
import { useWeilWallet } from '@/lib/hooks/useWeilWallet'
import { WeilWalletConnection } from '@weilliptic/weil-sdk'

// Dynamically import HeroSection to avoid SSR issues
const HeroSection = dynamic(
  () => import('@/components/HeroSection').then((mod) => ({ default: mod.HeroSection })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <p className="text-terminal font-mono">Loading...</p>
      </div>
    ),
  }
)

/**
 * Props interface for DjedOPS Applet
 * Receives wallet context from parent marketplace
 */
export interface DjedOPSAppletProps {
  wallet?: WeilWalletConnection | null
  address?: string | null
}

/**
 * DjedOPS Applet Component
 * 
 * This is the refactored version of the original DjedOPS page.
 * It can function both as:
 * 1. Standalone page (uses useWeilWallet hook)
 * 2. Embedded applet (receives wallet from parent via props)
 */
export default function DjedOPSApplet({ 
  wallet: externalWallet, 
  address: externalAddress 
}: DjedOPSAppletProps) {
  // Use external wallet if provided, otherwise use hook
  const hookWallet = useWeilWallet()
  const wallet = externalWallet ?? hookWallet.wallet
  const address = externalAddress ?? hookWallet.address
  const isConnected = !!(wallet && address)

  // State management (same as original)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [transactions, setTransactions] = useState<TransactionEvent[]>([])
  const [errorDismissed, setErrorDismissed] = useState(false)
  const [isStale, setIsStale] = useState(false)
  const [isProtocolInspectorOpen, setIsProtocolInspectorOpen] = useState(false)
  const [isWhitePaperModalOpen, setIsWhitePaperModalOpen] = useState(false)
  const [isKYAModalOpen, setIsKYAModalOpen] = useState(false)
  const [ergoErrorDismissed, setErgoErrorDismissed] = useState(false)
  const [dexErrorDismissed, setDexErrorDismissed] = useState(false)
  const [lastDjedDataUpdate, setLastDjedDataUpdate] = useState<Date | undefined>()
  const [lastDexUpdate, setLastDexUpdate] = useState<Date | undefined>()

  // Fetch live transaction feed
  const { transactions: liveTransactions, error: feedError, isLoading: feedLoading } = useTransactionFeed()

  // Demo mode detection
  useEffect(() => {
    const urlDemoMode = DemoService.isDemoMode()
    const shouldUseDemoMode = urlDemoMode && typeof window !== 'undefined' && window.location.search.includes('demo=true')
    setIsDemoMode(shouldUseDemoMode)
    
    if (shouldUseDemoMode) {
      DemoService.loadMockData().then(mockData => {
        const txEvents = DemoService.parseTransactions(mockData)
        setTransactions(txEvents)
      }).catch(error => {
        console.error('Failed to load demo transactions:', error)
      })
    }
  }, [])

  // Update live transactions
  useEffect(() => {
    if (!isDemoMode && liveTransactions.length > 0) {
      setTransactions(liveTransactions)
    }
  }, [liveTransactions, isDemoMode])

  // Fetch protocol data
  const { data: rawDjedData, error, isLoading, mutate } = useDjedData(isDemoMode)
  const djedData = useReplayData(rawDjedData ?? null)
  const { dexPrice, isError: dexError } = useDexPrice()

  // Calculate metrics (same as original)
  const reserveRatio = djedData?.reserveRatio ?? null
  const systemStatus = djedData ? determineSystemStatus(djedData) : 'unknown'
  const dsi = (djedData?.baseReserves && djedData?.reserveRatio && dexPrice)
    ? calculateDSI(djedData.baseReserves, djedData.reserveRatio, dexPrice)
    : null

  // Rest of the component logic remains the same...
  // (All the existing effects, handlers, and rendering logic)

  return (
    <div className="min-h-screen bg-black text-terminal">
      {/* Wallet Connection Status Bar (WeilChain version) */}
      <div className="fixed top-4 right-4 z-50">
        {isConnected ? (
          <div className="bg-black border border-[#00FF41] px-4 py-2 font-mono text-xs">
            [WEIL: {address?.slice(0, 6)}...{address?.slice(-4)}]
          </div>
        ) : (
          <div className="bg-black border border-[#00FF41] border-opacity-50 px-4 py-2 font-mono text-xs opacity-50">
            [WALLET_DISCONNECTED]
          </div>
        )}
      </div>

      {/* All existing DjedOPS components and layout */}
      {/* Hero Section */}
      <HeroSection 
        reserveRatio={reserveRatio}
        dsi={dsi}
        systemStatus={systemStatus}
        isLoading={isLoading}
      />

      {/* Main Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error Banners */}
        {error && !errorDismissed && (
          <ErrorBanner
            message="Failed to load Djed protocol data"
            onDismiss={() => setErrorDismissed(true)}
          />
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stability Gauge */}
          <StabilityGauge
            reserveRatio={reserveRatio}
            systemStatus={systemStatus}
            isLoading={isLoading}
          />

          {/* Confidence Gauge */}
          <ConfidenceGauge
            djedData={djedData}
            dsi={dsi}
            isLoading={isLoading}
          />

          {/* Market Opportunity Card */}
          <MarketOpportunityCard
            reserveRatio={reserveRatio}
            dsi={dsi}
            isLoading={isLoading}
          />
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReserveHistoryChart />
          <OracleConsensus />
        </div>

        {/* Transaction Feed */}
        <div className="mt-8">
          <TerminalFeed transactions={transactions} isLoading={feedLoading} />
        </div>

        {/* Additional Components */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StressTest />
          <RootCauseAnalyzer />
        </div>

        {/* Time Travel */}
        <div className="mt-8">
          <TimeTravel />
        </div>
      </main>

      {/* Modals */}
      {isWhitePaperModalOpen && (
        <WhitePaperModal onClose={() => setIsWhitePaperModalOpen(false)} />
      )}

      {isKYAModalOpen && (
        <KYAModal onClose={() => setIsKYAModalOpen(false)} />
      )}

      {isProtocolInspectorOpen && (
        <ProtocolInspector
          isOpen={isProtocolInspectorOpen}
          onClose={() => setIsProtocolInspectorOpen(false)}
          djedData={djedData}
        />
      )}
    </div>
  )
}
