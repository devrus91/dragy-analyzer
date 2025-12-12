"use client";

import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DataPoint } from '../services/dragyService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AccelerationChartProps {
  dataPoints: DataPoint[];
}

export function AccelerationChart({ dataPoints }: AccelerationChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prepare data for the chart
  const times = dataPoints.map(point => point.time.toFixed(3));
  const accelerations = dataPoints.map(point => point.acceleration);
  const speeds = dataPoints.map(point => point.speed);

  const chartData = {
    labels: times,
    datasets: [
      {
        label: 'Acceleration (g)',
        data: accelerations,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Speed (km/h)',
        data: speeds,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Acceleration and Speed Over Time',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Acceleration (g)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Speed (km/h)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (!isClient) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-900/50 rounded-lg">
        <p className="text-gray-500">Loading chart...</p>
      </div>
    );
  }

  return (
    <div className="h-96">
      <Line options={options} data={chartData} />
    </div>
  );
}