"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { DragyService, type DragyData } from "../../services/dragyService";
import { SegmentTiming } from "../../components/SegmentTiming";

export default function AnalysisPage() {
  const searchParams =useSearchParams();
  const carId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisData, setAnalysisData] = useState<DragyData | null>(null);
  const [accelerationAnomalies,setAccelerationAnomalies] = useState<any[]>([]);
  const [gpsErrors, setGpsErrors] = useState<any[]>([]);
  const [AccelerationChart, setAccelerationChart] = useState<any>(null);
  const [RouteMap, setRouteMap] = useState<any>(null);

  // Dynamically import client-sidecomponents
  useEffect(() => {
    const loadComponents = async () => {
      const chartModule = await import('../../components/AccelerationChart');
      setAccelerationChart(() => chartModule.AccelerationChart);
      
      const mapModule = await import('../../components/RouteMap');
      setRouteMap(() =>mapModule.RouteMap);
    };
    
    loadComponents();
  }, []);

  useEffect(() => {
    if (!carId) {
      setError("No car ID provided");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        // Fetch data from Dragy API
        const data = await DragyService.fetchCarData(carId);
        setAnalysisData(data);
        console.log("AnalysisData", data);
        // Analyze data if graphData exists
        if (data.graphData && data.graphData.dataInfo) {
          // Analyze acceleration spikes
          const anomalies =DragyService.analyzeAccelerationSpikes(data.graphData.dataInfo.dataArr);
          setAccelerationAnomalies(anomalies);
          
          // Detect GPS errors
          const errors = DragyService.detectGPSErrors(data.graphData);
          setGpsErrors(errors);
        }
      } catch(err){
setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [carId]);

if (!carId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900to-blacktext-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="py-8 text-center">
           <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Dragy Analyzer
            </h1>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 max-w-3xl mx-auto">
            <div className="text-red-400 text-center">
              No car ID provided. Please go back to the home page and enter a valid Dragy leaderboard URL.
            </div>
         </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-brfrom-gray-900 to-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="py-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-rfrom-blue-400 to-cyan-400 bg-clip-text text-transparent">
           Dragy Analyzer
          </h1>
          <p className="mt-2 text-gray-400 max-w-2xl mx-auto">
            Deep diagnostics for drag racing: from GPS trajectory to micro-accelerationspikes
          </p>
        </header>

        {loading && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xlp-6 md:p-8 max-w-3xl mx-auto">
            <div className="flexitems-center justify-center">
              <svg className="animate-spin h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.1355.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-3">Analyzing data for car ID: {carId}</span>
            </div>
          </div>
        )}

        {error&& (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 max-w-3xl mx-auto">
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
              {error}
</div>
          </div>
        )}

        {analysisData && (
          <div className="space-y-8">
            <div className="flex justify-betweenitems-center">
              <h2 className="text-2xl font-bold">Analysis Results</h2>
<div className="flex gap-2">
               <a href="/dragy-analyzer"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  Analyze Another
                </a>
                {analysisData && (
                  <a 
                    href={`https://www.godragy.com/leaderboards/${encodeURIComponent(analysisData.brand_name)}/${encodeURIComponent(analysisData.models)}-${carId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                  >
                    Original Report
                  </a>
)}
             </div>
</div>

{/* CarInfo Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Car Information</h3>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400">Car ID</p>
                  <p className="font-mono">{carId}</p>
                </div>
                {analysisData && (
<>
                    <div>
                      <p className="text-gray-400">Brand</p>
                      <p>{analysisData.brand_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Model</p>
                      <p>{analysisData.models || "N/A"}</p>
                   </div>
                  </>
)}
              </div>
            </div>

            {/* Acceleration Analysis */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xlfont-bold mb-4">AccelerationAnalysis</h3>
             <div className="mb-4">
                <h4 className="text-lg font-medium mb-2">Acceleration Anomalies</h4>
                {accelerationAnomalies.length > 0 ? (
                  <div className="space-y-2">
                    {accelerationAnomalies.map((anomaly,index)=> (
<div key={index} className={`p-3 rounded-lg ${
                        anomaly.type === 'spike' ? 'bg-yellow-900/30 border border-yellow-700' :
                        anomaly.type === 'drop' ? 'bg-orange-900/30 border border-orange-700' :
                        'bg-purple-900/30 border border-purple-700'
                      }`}>
                        <p className={
                          anomaly.type === 'spike' ? 'text-yellow-200' :
                          anomaly.type === 'drop' ? 'text-orange-200' :
                          'text-purple-200'
                        }>
                          {anomaly.message}
                        </p>
                        <p className="text-sm text-gray-400">At {anomaly.time.toFixed(3)}s</p>
                      </div>
                    ))}
</div>
                ) : (
<p className="text-gray-400">No significant acceleration anomalies detected</p>
                )}
              </div>
              
              {analysisData.graphData?.dataInfo?.dataArr && analysisData.graphData.dataInfo.dataArr.length > 0 && AccelerationChart ? (
               <AccelerationChart dataPoints={analysisData.graphData.dataInfo.dataArr} />
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-900/50 rounded-lg">
                  <p className="text-gray-500">No acceleration data available</p>
</div>
              )}
</div>

{/* GPS Route & Errors */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">GPS Route & Signal Quality</h3>
              <div className="mb-4">
                <h4 className="text-lg font-medium mb-2">GPS Signal Issues</h4>
                {gpsErrors.length > 0 ? (
                  <div className="space-y-2">
                    {gpsErrors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                        <p className="text-red-200">{error.message}</p>
                        <p className="text-sm text-gray-400">At {error.time.toFixed(3)}s</p>
                     </div>
                   ))}
</div>
                ) : (
                  <p className="text-gray-400">GPS signal quality appears stable throughout the run</p>
                )}
              </div>
              
              {analysisData.graphData?.dataInfo?.dataArr && analysisData.graphData.dataInfo.dataArr.length>0 && RouteMap? (
                <RouteMap dataPoints={analysisData.graphData.dataInfo.dataArr} />
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-900/50 rounded-lg">
                  <p className="text-gray-500">No GPSdataavailable</p>
                </div>
              )}
            </div>

            {/* Segment Timing */}
            {analysisData.graphData?.dataInfo?.detail && analysisData.graphData.dataInfo.detail.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xlp-6">
<h3 className="text-xl font-bold mb-4">Segment Timing Insights</h3>
                <SegmentTiming detailData={analysisData.graphData.dataInfo.detail} />
              </div>
            )}

            {/* Weather & Conditions */}
            <div className="bg-gray-800/50 backdrop-blur-smrounded-xl p-6">
<h3 className="text-xl font-bold mb-4">Weather& Conditions</h3>
              {analysisData.graphData?.weatherInfo?.main ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4bg-gray-900/50 rounded-lg">
                    <p className="text-gray-400">Temperature</p>
                    <p className="text-xl">{analysisData.graphData.weatherInfo.main.temp}°C</p>
                  </div>
                  <div className="p-4 bg-gray-900/50rounded-lg">
                    <p className="text-gray-400">Humidity</p>
                    <p className="text-xl">{analysisData.graphData.weatherInfo.main.humidity}%</p>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <p className="text-gray-400">Pressure</p>
<p className="text-xl">{analysisData.graphData.weatherInfo.main.pressure} hPa</p>
                  </div>
                  {(() => {
                    const da = analysisData.graphData.weatherInfo.main.daValue !== undefined 
                      ? analysisData.graphData.weatherInfo.main.daValue 
                      : DragyService.calculateDensityAltitude(analysisData.graphData.weatherInfo.main);
                    return da !== null ? (
                      <div className="p-4 bg-gray-900/50rounded-lg">
                        <p className="text-gray-400">Density Altitude</p>
                        <p className="text-xl">{da} ft</p>
                      </div>
                    ) : null;
                  })()}
               </div>
              ) :(
               <div className="h-32 flex items-center justify-center bg-gray-900/50 rounded-lg">
                  <p className="text-gray-500">Weatherinformation not available</p>
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="py-8 text-center text-gray-500 text-sm">
          <p>Dragy Analyzer - Advanced drag racing data analysis</p>
        </footer>
      </div>
</div>
  );
}