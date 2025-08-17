'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { LinearCard } from '@/components/ui';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string | string[];
    backgroundColor?: string | string[];
    borderWidth?: number;
    tension?: number;
    fill?: boolean;
  }>;
}

interface RealTimeChartProps {
  type: 'line' | 'bar' | 'doughnut';
  title: string;
  data: ChartData;
  height?: number;
  options?: any;
  updateInterval?: number;
}

const defaultColors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  info: '#8B5CF6',
  success: '#22C55E',
  warning: '#F97316'
};

const RealTimeChart: React.FC<RealTimeChartProps> = ({
  type,
  title,
  data: initialData,
  height = 300,
  options = {},
  updateInterval = 30000 // 30 seconds
}) => {
  const [chartData, setChartData] = useState<ChartData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chartRef = useRef<any>(null);

  // Default chart options
  const getDefaultOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        title: {
          display: true,
          text: title,
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: defaultColors.primary,
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            title: (context: any) => {
              return context[0]?.label || '';
            },
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y || context.parsed || 0;
              
              if (type === 'doughnut') {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
              
              return `${label}: ${value}`;
            }
          }
        }
      },
      animation: {
        duration: 750,
        easing: 'easeInOutQuart' as const
      }
    };

    // Type-specific options
    if (type === 'line') {
      return {
        ...baseOptions,
        scales: {
          x: {
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              font: { size: 11 }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              font: { size: 11 }
            }
          }
        },
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6
          },
          line: {
            tension: 0.3
          }
        }
      };
    }

    if (type === 'bar') {
      return {
        ...baseOptions,
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: { size: 11 }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              font: { size: 11 }
            }
          }
        }
      };
    }

    if (type === 'doughnut') {
      return {
        ...baseOptions,
        cutout: '60%',
        plugins: {
          ...baseOptions.plugins,
          legend: {
            position: 'right' as const,
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 12 }
            }
          }
        }
      };
    }

    return baseOptions;
  };

  // Simulate real-time data updates
  const updateChartData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock updated data
      const newData = { ...chartData };
      
      if (type === 'line' || type === 'bar') {
        // Add new data point and remove oldest if too many points
        const currentTime = new Date().toLocaleTimeString('ko-KR', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        newData.labels = [...newData.labels, currentTime];
        if (newData.labels.length > 12) {
          newData.labels = newData.labels.slice(-12);
        }
        
        newData.datasets = newData.datasets.map(dataset => {
          const newValue = Math.floor(Math.random() * 50) + 10;
          const newDataArray = [...dataset.data, newValue];
          
          return {
            ...dataset,
            data: newDataArray.length > 12 ? newDataArray.slice(-12) : newDataArray
          };
        });
      } else if (type === 'doughnut') {
        // Update doughnut chart values
        newData.datasets = newData.datasets.map(dataset => ({
          ...dataset,
          data: dataset.data.map(() => Math.floor(Math.random() * 100) + 10)
        }));
      }
      
      setChartData(newData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to update chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup real-time updates
  useEffect(() => {
    if (updateInterval > 0) {
      intervalRef.current = setInterval(updateChartData, updateInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateInterval]);

  // Manual refresh function
  const handleManualRefresh = () => {
    updateChartData();
  };

  const renderChart = () => {
    const chartOptions = { ...getDefaultOptions(), ...options };
    
    switch (type) {
      case 'line':
        return <Line ref={chartRef} data={chartData} options={chartOptions} />;
      case 'bar':
        return <Bar ref={chartRef} data={chartData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut ref={chartRef} data={chartData} options={chartOptions} />;
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <LinearCard padding="lg" shadow="md" className="relative">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center space-x-2">
          {/* Real-time indicator */}
          <div className="flex items-center space-x-1">
            <div 
              className={`w-2 h-2 rounded-full ${
                isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
              }`}
            />
            <span className="text-xs text-gray-500">
              {isLoading ? '업데이트 중...' : '실시간'}
            </span>
          </div>
          
          {/* Manual refresh button */}
          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="수동 새로고침"
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

      {/* Chart Container */}
      <div className="relative" style={{ height: `${height}px` }}>
        {renderChart()}
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">데이터 업데이트 중...</span>
            </div>
          </div>
        )}
      </div>

      {/* Last update timestamp */}
      <div className="mt-3 text-xs text-gray-400 text-right">
        마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
      </div>
    </LinearCard>
  );
};

export default RealTimeChart;