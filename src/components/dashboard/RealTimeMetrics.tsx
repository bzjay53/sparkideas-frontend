'use client';

import React, { useState, useEffect } from 'react';
import { LinearCard } from '@/components/ui';

interface MetricData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit?: string;
  format?: 'number' | 'percentage' | 'currency' | 'time';
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

interface RealTimeMetricsProps {
  title: string;
  metrics: MetricData[];
  updateInterval?: number;
  columns?: 1 | 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
}

const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({
  title,
  metrics: initialMetrics,
  updateInterval = 30000,
  columns = 4,
  size = 'md'
}) => {
  const [metrics, setMetrics] = useState<MetricData[]>(initialMetrics);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Color mappings
  const colorClasses = {
    primary: 'text-blue-600 bg-blue-50',
    success: 'text-green-600 bg-green-50',
    warning: 'text-yellow-600 bg-yellow-50',
    danger: 'text-red-600 bg-red-50',
    info: 'text-purple-600 bg-purple-50'
  };

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    stable: '➡️'
  };

  // Format value based on type
  const formatValue = (value: number, format: string = 'number', unit: string = '') => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `₩${value.toLocaleString()}`;
      case 'time':
        if (value < 60) return `${value}초`;
        if (value < 3600) return `${Math.floor(value / 60)}분`;
        return `${Math.floor(value / 3600)}시간`;
      default:
        return `${value.toLocaleString()}${unit}`;
    }
  };

  // Get trend color
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Simulate real-time data updates
  const updateMetrics = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedMetrics = metrics.map(metric => {
        // Generate realistic changes
        const changePercent = (Math.random() - 0.5) * 20; // ±10% change
        const newValue = Math.max(0, metric.value + (metric.value * changePercent / 100));
        const change = newValue - metric.value;
        
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (Math.abs(change) > metric.value * 0.02) { // 2% threshold
          trend = change > 0 ? 'up' : 'down';
        }
        
        return {
          ...metric,
          value: Math.round(newValue),
          change: Math.round(change),
          trend
        };
      });
      
      setMetrics(updatedMetrics);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to update metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup auto-updates
  useEffect(() => {
    const interval = setInterval(updateMetrics, updateInterval);
    return () => clearInterval(interval);
  }, [updateInterval, metrics]);

  // Grid column classes
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  // Size classes
  const sizeClasses = {
    sm: { card: 'p-3', text: 'text-lg', label: 'text-xs' },
    md: { card: 'p-4', text: 'text-2xl', label: 'text-sm' },
    lg: { card: 'p-6', text: 'text-3xl', label: 'text-base' }
  };

  const sizeClass = sizeClasses[size];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <div className="flex items-center space-x-2">
          {/* Real-time indicator */}
          <div className="flex items-center space-x-1">
            <div 
              className={`w-2 h-2 rounded-full ${
                isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
              }`}
            />
            <span className="text-xs text-gray-500">
              {isLoading ? '업데이트 중' : '실시간'}
            </span>
          </div>
          
          {/* Manual refresh */}
          <button
            onClick={updateMetrics}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg 
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={`grid ${gridClasses[columns]} gap-4`}>
        {metrics.map((metric, index) => {
          const colorClass = colorClasses[metric.color || 'primary'];
          
          return (
            <LinearCard 
              key={index} 
              padding="none" 
              shadow="sm" 
              className={`${sizeClass.card} transition-all duration-300 hover:shadow-md ${
                isLoading ? 'opacity-70' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Icon and Label */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {metric.icon && (
                      <span className="text-lg">{metric.icon}</span>
                    )}
                    <span className={`${sizeClass.label} text-gray-600 font-medium`}>
                      {metric.label}
                    </span>
                  </div>
                  
                  {/* Value */}
                  <div className={`${sizeClass.text} font-bold text-gray-900`}>
                    {formatValue(metric.value, metric.format, metric.unit)}
                  </div>
                  
                  {/* Change Indicator */}
                  <div className="flex items-center space-x-1 mt-1">
                    <span className={`text-xs ${getTrendColor(metric.trend)}`}>
                      {trendIcons[metric.trend]}
                    </span>
                    <span className={`text-xs font-medium ${getTrendColor(metric.trend)}`}>
                      {metric.change > 0 ? '+' : ''}{formatValue(Math.abs(metric.change), metric.format, metric.unit)}
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className={`w-3 h-3 rounded-full ${colorClass.split(' ')[1]}`} />
              </div>
            </LinearCard>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-400 text-right">
        마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
      </div>
    </div>
  );
};

export default RealTimeMetrics;