/**
 * API Hooks with TypeScript Support
 * React hooks for type-safe API calls
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse, LoadingState } from '@/types';

// ============================================================================
// Generic API Hook
// ============================================================================

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading('loading');
    setError(null);

    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
        setLoading('success');
        options.onSuccess?.(response.data);
      } else {
        const errorMessage = response.error?.message || 'Unknown error occurred';
        setError(errorMessage);
        setLoading('error');
        options.onError?.(response.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      setLoading('error');
      options.onError?.(err);
    }
  }, [apiCall, options]);

  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }
  }, [execute, options.immediate]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    refetch,
    execute,
  };
}

// ============================================================================
// Specific API Hooks
// ============================================================================

// Health & System
export const useHealth = () => {
  return useApi(() => api.health(), { immediate: true });
};

// Pain Points
export const usePainPoints = (params?: Parameters<typeof api.painPoints.list>[0]) => {
  return useApi(() => api.painPoints.list(params), { immediate: true });
};

export const usePainPoint = (id: string) => {
  return useApi(() => api.painPoints.get(id), { 
    immediate: !!id 
  });
};

export const usePainPointStats = () => {
  return useApi(() => api.painPoints.stats(), { immediate: true });
};

// Business Ideas
export const useBusinessIdeas = (params?: Parameters<typeof api.businessIdeas.list>[0]) => {
  return useApi(() => api.businessIdeas.list(params), { immediate: true });
};

export const useBusinessIdea = (id: string) => {
  return useApi(() => api.businessIdeas.get(id), { 
    immediate: !!id 
  });
};

// Analytics
export const useAnalyticsOverview = () => {
  return useApi(() => api.analytics.overview(), { immediate: true });
};

export const useTrendingKeywords = (params?: Parameters<typeof api.analytics.trendingKeywords>[0]) => {
  return useApi(() => api.analytics.trendingKeywords(params), { immediate: true });
};

export const usePerformanceMetrics = () => {
  return useApi(() => api.analytics.performance(), { immediate: true });
};

// Telegram
export const useTelegramStats = (days: number = 7) => {
  return useApi(() => api.telegram.stats(days), { immediate: true });
};

// ============================================================================
// Mutation Hooks (for POST/PUT/DELETE operations)
// ============================================================================

export function useMutation<T, P = void>(
  mutationFn: (params: P) => Promise<ApiResponse<T>>,
  options: {
    onSuccess?: (data: T, params: P) => void;
    onError?: (error: any, params: P) => void;
    onSettled?: (data: T | null, error: any, params: P) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (params: P) => {
    setLoading('loading');
    setError(null);

    try {
      const response = await mutationFn(params);
      
      if (response.success && response.data) {
        setData(response.data);
        setLoading('success');
        options.onSuccess?.(response.data, params);
      } else {
        const errorMessage = response.error?.message || 'Unknown error occurred';
        setError(errorMessage);
        setLoading('error');
        options.onError?.(response.error, params);
      }
      
      options.onSettled?.(response.data || null, response.error, params);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      setLoading('error');
      options.onError?.(err, params);
      options.onSettled?.(null, err, params);
    }
  }, [mutationFn, options]);

  const reset = useCallback(() => {
    setData(null);
    setLoading('idle');
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
}

// Specific Mutation Hooks
export const useTriggerDataCollection = () => {
  return useMutation(() => api.painPoints.collect());
};

export const useGenerateBusinessIdeas = () => {
  return useMutation((params: Parameters<typeof api.businessIdeas.generate>[0]) => 
    api.businessIdeas.generate(params)
  );
};

export const useSendTelegramDigest = () => {
  return useMutation(() => api.telegram.sendDigest());
};

export const useSendTelegramTest = () => {
  return useMutation(() => api.telegram.test());
};

// ============================================================================
// Polling Hook
// ============================================================================

export function usePolling<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: {
    interval: number; // milliseconds
    enabled?: boolean;
    onData?: (data: T) => void;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!options.enabled) return;

    const poll = async () => {
      try {
        setLoading('loading');
        const response = await apiCall();
        
        if (response.success && response.data) {
          setData(response.data);
          setLoading('success');
          options.onData?.(response.data);
        } else {
          setError(response.error?.message || 'Polling error');
          setLoading('error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
        setLoading('error');
      }
    };

    // Initial call
    poll();

    // Set up interval
    const intervalId = setInterval(poll, options.interval);

    return () => clearInterval(intervalId);
  }, [apiCall, options.interval, options.enabled, options.onData]);

  return { data, loading, error };
}

// Real-time Analytics Polling
export const useRealtimeAnalytics = (enabled: boolean = true) => {
  return usePolling(
    () => api.analytics.overview(),
    {
      interval: 30000, // 30 seconds
      enabled,
    }
  );
};

// Real-time Performance Monitoring
export const useRealtimePerformance = (enabled: boolean = true) => {
  return usePolling(
    () => api.analytics.performance(),
    {
      interval: 60000, // 1 minute
      enabled,
    }
  );
};