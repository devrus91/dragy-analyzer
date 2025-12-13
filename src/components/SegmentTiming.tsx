"use client";

import { Detail } from '../services/dragyService';

interface SegmentTimingProps {
  detailData: Detail[];
}

export function SegmentTiming({ detailData }: SegmentTimingProps) {
  // Filter and sort segment data
  const segments = detailData;

  if (segments.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center bg-gray-900/50 rounded-lg">
        <p className="text-gray-500">No segment timing data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Segment</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time (s)</th>
              {segments[0].speed && <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Speed (s)</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {segments.map((segment, index) => (
            <tr key={index}>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{segment.name}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{segment.time?.toFixed(3) || 'N/A'}s</td>
                {segment.speed && <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{segment.speed?.toFixed(3) || 'N/A'}</th>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}