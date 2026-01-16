/**
 * React Hooks for WeilChain Wallet Integration
 * 
 * Provides React hooks for managing WeilWallet connection state,
 * contract interactions, and real-time updates.
 * 
 * Usage:
 * ```tsx
 * const { isConnected, address, connect, disconnect } = useWeilWallet()
 * const { applets, loading, error } = useAppletRegistry()
 * ```
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWeilChain } from '@/lib/context/WeilChainContext'
import { getWeilSDK, type AppletMetadata, type WeilWalletState } from '../weil-sdk'

/**
 * Hook for managing WeilWallet connection state
 * 
 * DEPRECATED: Use useWeilChain() from WeilChainContext instead.
 * This hook is kept for backward compatibility.
 * 
 * @returns Wallet state and control functions
 */
export function useWeilWallet() {
  // Delegate to context
  return useWeilChain()
}

/**
 * Hook for fetching and managing applet registry data
 * 
 * Provides real-time access to registered applets with pagination support.
 * Automatically refreshes when wallet connection changes.
 * 
 * @param autoLoad - Whether to automatically load applets on mount
 * @param pageSize - Number of applets to load per page
 * @returns Applet data, loading state, and control functions
 */
export function useAppletRegistry(autoLoad: boolean = true, pageSize: number = 20) {
  const [applets, setApplets] = useState<AppletMetadata[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const sdk = getWeilSDK()
  const { isConnected } = useWeilWallet()

  /**
   * Load applets from registry
   */
  const loadApplets = useCallback(
    async (page: number = 0, append: boolean = false) => {
      setLoading(true)
      setError(null)

      try {
        const offset = page * pageSize
        const fetchedApplets = await sdk.listApplets(offset, pageSize)

        if (append) {
          setApplets(prev => [...prev, ...fetchedApplets])
        } else {
          setApplets(fetchedApplets)
        }

        setHasMore(fetchedApplets.length === pageSize)
        setCurrentPage(page)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load applets'
        setError(errorMessage)
        console.error('Failed to load applets:', err)
      } finally {
        setLoading(false)
      }
    },
    [sdk, pageSize]
  )

  /**
   * Load next page of applets
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadApplets(currentPage + 1, true)
    }
  }, [loading, hasMore, currentPage, loadApplets])

  /**
   * Refresh applet list
   */
  const refresh = useCallback(() => {
    loadApplets(0, false)
  }, [loadApplets])

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad && isConnected) {
      loadApplets()
    }
  }, [autoLoad, isConnected, loadApplets])

  return {
    applets,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  }
}

/**
 * Hook for interacting with a specific applet
 * 
 * Provides access control, installation tracking, and rating management
 * for individual applets.
 * 
 * @param appletId - ID of the applet to interact with
 * @returns Applet state and interaction functions
 */
export function useApplet(appletId: string) {
  const [applet, setApplet] = useState<AppletMetadata | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sdk = getWeilSDK()
  const { isConnected, address } = useWeilWallet()

  /**
   * Load applet metadata
   */
  const loadApplet = useCallback(async () => {
    if (!appletId) return

    setLoading(true)
    setError(null)

    try {
      const data = await sdk.getApplet(appletId)
      setApplet(data)

      // Check access if connected
      if (isConnected) {
        const access = await sdk.checkAccess(appletId)
        setHasAccess(access)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load applet'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [appletId, isConnected, sdk])

  /**
   * Purchase access to applet
   */
  const purchaseAccess = useCallback(async () => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)
    setError(null)

    try {
      const success = await sdk.monetizeApplet(appletId)
      if (success) {
        setHasAccess(true)
        // Reload to update install count
        await loadApplet()
      }
      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to purchase access'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [appletId, isConnected, sdk, loadApplet])

  /**
   * Increment install counter
   */
  const trackInstall = useCallback(async () => {
    try {
      await sdk.incrementInstalls(appletId)
    } catch (err) {
      console.error('Failed to track install:', err)
    }
  }, [appletId, sdk])

  /**
   * Submit rating for applet
   */
  const submitRating = useCallback(
    async (rating: number) => {
      if (!hasAccess) {
        throw new Error('Must have access to rate applet')
      }

      setLoading(true)
      setError(null)

      try {
        const success = await sdk.updateRating(appletId, rating)
        if (success) {
          // Reload to update average rating
          await loadApplet()
        }
        return success
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit rating'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [appletId, hasAccess, sdk, loadApplet]
  )

  // Load applet on mount
  useEffect(() => {
    loadApplet()
  }, [loadApplet])

  return {
    applet,
    hasAccess,
    loading,
    error,
    purchaseAccess,
    trackInstall,
    submitRating,
    refresh: loadApplet,
  }
}
