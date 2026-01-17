/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: lib/hooks/useWAuth.ts
 * PURPOSE: React hook for Weilliptic wallet (WAuth) connection
 * 
 * This hook manages the connection state for the Weilliptic browser wallet
 * extension. It now uses the backend API to handle all WeilChain operations,
 * eliminating the need for direct CLI interaction.
 * 
 * FEATURES:
 * - Auto-detection of Weilliptic wallet extension
 * - Backend API integration for wallet operations
 * - Connection/disconnection flow
 * - Persistent connection state (localStorage)
 * - Address retrieval
 * - Error handling with user-friendly messages
 * 
 * USAGE:
 * ```typescript
 * const { isConnected, address, connect, disconnect, error } = useWAuth();
 * ```
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { BackendAPIClient } from '../api-client';
import { detectInjectedWeilWallet, getConnectedAddress } from '../weil-sdk-wrapper';
import type { InjectedWallet } from '../weil-sdk-wrapper';

interface UseWAuthReturn {
  isConnected: boolean;
  address: string | null;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  wallet: InjectedWallet | null;
}

const STORAGE_KEY = 'wauth_connected';

export function useWAuth(): UseWAuthReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<InjectedWallet | null>(null);

  /**
   * Connect to Weilliptic wallet
   */
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check multiple injection points that WAuth might use
      const win = window as any;
      let wallet = null;
      
      // Try common injection points (case-sensitive!)
      const injectionPoints = [
        'WeilWallet',      // <- THE CORRECT ONE (capital W)
        'wauth',
        'weilliptic', 
        'weilWallet',
        'weillipticWallet',
        'weil'
      ];
      
      for (const point of injectionPoints) {
        if (win[point]) {
          wallet = win[point];
          console.log(`[WAuth] Found wallet at window.${point}`);
          
          // Safely log wallet structure
          try {
            console.log('[WAuth] Wallet structure:', Object.keys(wallet));
            
            // Safely access properties that might be getters or undefined
            const safeProps: any = {};
            const propsToCheck = ['isConnected', 'isSetup', 'isUnlocked', 'accounts', 'selectedAddress', 'account', 'WM'];
            
            for (const prop of propsToCheck) {
              try {
                const value = wallet[prop];
                // Don't call functions, just check if they exist
                if (typeof value === 'function') {
                  safeProps[prop] = '<function>';
                } else if (value !== undefined) {
                  // For WM, log its structure too
                  if (prop === 'WM' && value && typeof value === 'object') {
                    safeProps[prop] = {
                      keys: Object.keys(value),
                      hasAddress: 'address' in value,
                      hasSelectedAddress: 'selectedAddress' in value,
                    };
                  } else {
                    safeProps[prop] = value;
                  }
                }
              } catch (e) {
                // Property access might throw, skip it
                safeProps[prop] = '<error>';
              }
            }
            
            console.log('[WAuth] Wallet properties:', safeProps);
          } catch (e) {
            console.log('[WAuth] Could not inspect wallet properties:', e);
          }
          
          // Don't call any async methods that might hang
          // Just use the wallet as-is
          break;
        }
      }
      
      // Now try SDK detection
      const detectedWallet = detectInjectedWeilWallet();
      setWallet(detectedWallet);

      // Get connected address from the wallet first
      const walletAddress = await getConnectedAddress(detectedWallet);

      if (!walletAddress) {
        throw new Error('Failed to retrieve wallet address. Please ensure WAuth is unlocked and you have an active account.');
      }

      // Try to verify connection with backend API (optional - don't fail if backend is down)
      try {
        const response = await BackendAPIClient.connectWallet(walletAddress);
        if (response.success) {
          console.log('[WAuth] Backend verified connection:', response.address);
        } else {
          console.warn('[WAuth] Backend verification returned error:', response.message);
        }
      } catch (backendError: any) {
        console.warn('[WAuth] Backend verification failed (continuing anyway):', backendError.message);
        // Continue - wallet is connected even if backend is unavailable
      }

      // Update state - connection is successful even without backend
      setAddress(walletAddress);
      setIsConnected(true);

      // Persist connection
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, 'true');
      }

      console.log('[WAuth] Connected:', walletAddress);
    } catch (err: any) {
      console.error('[WAuth] Connection failed:', err);
      
      // Provide helpful error messages
      if (err.name === 'WeilWalletNotFoundError' || err.message?.includes('not detected') || err.message?.includes('not found')) {
        setError('WAuth wallet extension not installed. Please install the extension to connect.');
      } else if (err.message?.includes('rejected')) {
        setError('Connection cancelled. Please approve the connection in your WAuth wallet.');
      } else if (err.message?.includes('retrieve wallet address') || err.message?.includes('created an account')) {
        setError('⚠️ NO ACCOUNT FOUND: Please open WAuth extension and CREATE or IMPORT an account first!');
      } else {
        setError('Connection failed. Please ensure WAuth is installed, unlocked, and has an active account.');
      }
      
      setIsConnected(false);
      setAddress(null);
      setWallet(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setWallet(null);
    setError(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }

    console.log('[WAuth] Disconnected');
  }, []);

  /**
   * Auto-reconnect on mount if previously connected
   * Only attempt if wallet extension is actually present to avoid console errors
   */
  useEffect(() => {
    const wasConnected = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true';

    if (wasConnected) {
      // Check if wallet exists before trying to connect
      const win = window as any;
      const hasWallet = win.WeilWallet || win.wauth || win.weilliptic || win.weilWallet || win.weillipticWallet || win.weil;
      
      if (hasWallet) {
        console.log('[WAuth] Auto-reconnecting from localStorage...');
        // Silently try to reconnect
        connect().catch((err) => {
          console.log('[WAuth] Auto-reconnect failed:', err);
          // Clear stored connection state if reconnection fails
          localStorage.removeItem(STORAGE_KEY);
        });
      } else {
        // Wallet not installed, clear the stored state
        console.log('[WAuth] Wallet not detected, clearing stored connection state');
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    
    // Also listen for wallet extension events (if the wallet becomes available)
    const checkWalletPeriodically = setInterval(() => {
      const win = window as any;
      const hasWallet = win.WeilWallet || win.wauth || win.weilliptic || win.weilWallet;
      
      // If wallet is detected and we're supposed to be connected but aren't, try to reconnect
      if (hasWallet && wasConnected && !isConnected) {
        console.log('[WAuth] Wallet detected during periodic check, attempting reconnect...');
        connect().catch(() => {
          localStorage.removeItem(STORAGE_KEY);
        });
      }
    }, 2000); // Check every 2 seconds
    
    return () => clearInterval(checkWalletPeriodically);
  }, [connect, isConnected]);

  return {
    isConnected,
    address,
    isLoading,
    error,
    connect,
    disconnect,
    wallet,
  };
}
