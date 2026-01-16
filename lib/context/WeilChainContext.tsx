/**
 * WeilChain Context Provider
 * 
 * Manages global WeilWallet connection state and provides it to all components.
 * This is the single source of truth for wallet interactions throughout the app.
 * 
 * Based on @weilliptic/weil-sdk from https://github.com/weilliptic-public/wadk.git
 * 
 * Usage:
 * ```tsx
 * // In _app.tsx or layout.tsx:
 * <WeilChainProvider>
 *   <YourApp />
 * </WeilChainProvider>
 * 
 * // In any component:
 * const { wallet, isConnected, connect } = useWeilChain()
 * ```
 */

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { WeilWalletConnection } from '@weilliptic/weil-sdk'
import { useWAuth } from '@/lib/hooks/useWAuth'

/**
 * WeilChain connection state interface
 */
export interface WeilChainState {
  wallet: WeilWalletConnection | null
  address: string | null
  isConnected: boolean
  isInstalled: boolean
  chainId: string | null
  error: string | null
  protocolStatus: 'OPTIMAL' | 'CRITICAL' // Cross-app communication state
}

/**
 * WeilChain context interface
 */
export interface WeilChainContextValue extends WeilChainState {
  connect: () => Promise<void>
  disconnect: () => void
  executeContract: (contractAddress: string, method: string, params: any) => Promise<any>
  setProtocolStatus: (status: 'OPTIMAL' | 'CRITICAL') => void // Cross-app communication
}

/**
 * WeilChain Context
 */
const WeilChainContext = createContext<WeilChainContextValue | undefined>(undefined)

/**
 * Provider Props
 */
export interface WeilChainProviderProps {
  children: ReactNode
  mockMode?: boolean // Enable mock mode for demo without actual wallet
}

/**
 * WeilChain Provider Component
 * 
 * Wraps the application and provides WeilWallet access to all child components.
 * Handles connection lifecycle, state management, and wallet events.
 * 
 * Now integrates with useWAuth hook for unified wallet connection state.
 */
export function WeilChainProvider({ children, mockMode = false }: WeilChainProviderProps) {
  // Use the WAuth hook for actual wallet connection
  const wauth = useWAuth();
  
  const [protocolStatus, setProtocolStatusState] = useState<'OPTIMAL' | 'CRITICAL'>('OPTIMAL');

  /**
   * Check if WeilWallet is installed
   */
  const checkWalletInstalled = useCallback((): boolean => {
    // Enable mock mode via environment or prop
    const useMockMode = mockMode || process.env.NEXT_PUBLIC_MOCK_CONTRACT === 'true'
    
    if (useMockMode) {
      console.log('🎭 Mock mode enabled')
      return true
    }

    if (typeof window === 'undefined') return false
    
    // Check for WAuth wallet
    const win = window as any;
    return !!(win.WeilWallet || win.wauth || win.weilliptic || win.weilWallet);
  }, [mockMode])

  /**
   * Initialize wallet connection
   */
  const connect = useCallback(async () => {
    // Delegate to WAuth hook
    await wauth.connect();
  }, [wauth])

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(() => {
    // Delegate to WAuth hook
    wauth.disconnect();
    setProtocolStatusState('OPTIMAL'); // Reset to optimal on disconnect
  }, [wauth])

  /**
   * Set protocol status (Cross-app communication)
   * Allows applets to signal critical states to other applets
   */
  const setProtocolStatus = useCallback((status: 'OPTIMAL' | 'CRITICAL') => {
    console.log('🚨 Protocol Status Changed:', status)
    setProtocolStatusState(status);
  }, [])

  /**
   * Execute contract method
   * 
   * Wrapper for wallet.contracts.execute() with error handling and mock support.
   * 
   * @param contractAddress - Contract address (hex, no 0x prefix)
   * @param method - Method name to call
   * @param params - Method parameters object
   * @returns Contract execution result
   */
  const executeContract = useCallback(
    async (contractAddress: string, method: string, params: any): Promise<any> => {
      if (!wauth.isConnected && !mockMode) {
        throw new Error('Wallet not connected. Call connect() first.')
      }

      try {
        // Mock mode response
        if (mockMode || process.env.NEXT_PUBLIC_MOCK_CONTRACT === 'true') {
          console.log(`🎭 Mock contract call: ${method}`, params)
          return { success: true, mock: true }
        }

        // Real contract execution using the wallet
        if (wauth.wallet?.contracts?.execute) {
          const result = await wauth.wallet.contracts.execute(
            contractAddress,
            method,
            params
          );
          return result;
        }

        throw new Error('Wallet does not support contract execution');
      } catch (error) {
        console.error(`Contract execution failed (${method}):`, error)
        throw error
      }
    },
    [wauth.isConnected, wauth.wallet, mockMode]
  )

  // Build the state object from WAuth hook
  const state: WeilChainState = {
    wallet: wauth.wallet as any, // Cast to WeilWalletConnection type
    address: wauth.address,
    isConnected: wauth.isConnected,
    isInstalled: checkWalletInstalled(),
    chainId: null, // WAuth doesn't track chainId yet
    error: wauth.error,
    protocolStatus,
  };

  /**
   * Context value
   */
  const value: WeilChainContextValue = {
    ...state,
    connect,
    disconnect,
    executeContract,
    setProtocolStatus,
  }

  return (
    <WeilChainContext.Provider value={value}>
      {children}
    </WeilChainContext.Provider>
  )
}

/**
 * Hook to access WeilChain context
 * 
 * @throws Error if used outside WeilChainProvider
 * @returns WeilChain context value
 */
export function useWeilChain(): WeilChainContextValue {
  const context = useContext(WeilChainContext)
  
  if (context === undefined) {
    throw new Error('useWeilChain must be used within a WeilChainProvider')
  }
  
  return context
}

/**
 * Export for convenience
 */
export default WeilChainProvider
