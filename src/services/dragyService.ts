export interface DragyData {
  id: number;
  brand_name: string;
  models: string;
  graphData: GraphData;
  // Add other fields as needed
}

export interface DataInfo{
    dataArr: DataPoint[];
    detail: Detail[];
}

export interface GraphData {
  dataInfo: DataInfo;
  weatherInfo: WeatherInfo;
  daValue: number;
  gMax?: number;
  brand?: string;
  model?: string;
  modelNumber: string;
  // Add other fields as needed
}

export interface DataPoint {
  time: number;        // seconds
  speed: number;       // km/h
  acceleration: number; // in g
  heading: number;
  latitude: number;
  longitude: number;
  altitude: number;
  satelliteNum: number;
  hAcc: number;
  vAcc: number;
  sAcc: number;
  fixType: number;
  // Add other fields as needed
}

export interface Detail {
  // Define the structure based on actual data
  [key: string]: any;
}

export interface WeatherInfo {
    main: MainWeatherInfo
    // Add other fields as needed
}

export interface MainWeatherInfo {
  temp: number;
  humidity: number;
  pressure: number;
  daValue?: number;
  // Add other fields as needed
}

export interface AccelerationAnomaly {
  type: 'spike' | 'drop' | 'deviation';
  time: number;
  value: number;
  delta?: number;
  message: string;
}

export interface GPSError {
  type: 'lowSatellites' | 'highHDOP' | 'nonRTK';
  time: number;
  value: number;
  message: string;
}

export class DragyService {
  static extractIdFromUrl(url: string): string | null {
    const regex = /\/leaderboards\/.+-(\d+)\/?/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  static async fetchCarData(id: string): Promise<DragyData> {
    try {
      const response = await fetch(`https://www.godragy.com/dragy/u_user/get_CarResults?id=${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      const data = responseData.data.carResults;
      console.log(data)
      // Parse graphData if it's a JSON string
      if (typeof data.graphData === 'string') {
        try {
          data.graphData = JSON.parse(data.graphData);
        } catch (parseError) {
          console.error('Error parsing graphData:', parseError);
          // If parsing fails, keep the original string
        }
      }

      if (typeof data.graphData?.weatherInfo === 'string') {
        try {
          data.graphData.weatherInfo = JSON.parse(data.graphData.weatherInfo);
        } catch (parseError) {
          console.error('Error parsing weatherInfo:', parseError);
          // If parsing fails, keep the original string
        }
      }

      if (typeof data.graphData?.dataInfo === 'string') {
        try {
          data.graphData.dataInfo = JSON.parse(data.graphData.dataInfo);
        } catch (parseError) {
          console.error('Error parsing dataInfo:', parseError);
          // If parsing fails, keep the original string
        }
      }
      
      return data;
    } catch (error) {
      throw new Error(`Error fetching data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static analyzeAccelerationSpikes(dataPoints: DataPoint[]): AccelerationAnomaly[] {
    const anomalies: AccelerationAnomaly[] = [];
    
    // Calculate rolling mean and standard deviation for 0.5s window
    const windowSize = 0.5; // seconds
    
    for (let i = 0; i < dataPoints.length; i++) {
      // Look for sharp acceleration spikes
      if (i > 0) {
        const deltaTime = dataPoints[i].time - dataPoints[i-1].time;
        const deltaAcceleration = Math.abs(dataPoints[i].acceleration - dataPoints[i-1].acceleration);
        
        // Spike detection: Δacceleration > 0.15 g within < 0.1 s
        if (deltaTime < 0.1 && deltaAcceleration > 0.15) {
          anomalies.push({
            type: 'spike',
            time: dataPoints[i].time,
            value: dataPoints[i].acceleration,
            delta: deltaAcceleration,
            message: `Sharp acceleration spike: ${deltaAcceleration.toFixed(3)}g in ${deltaTime.toFixed(3)}s`
          });
        }
      }
      
      // Look for power drops (rapid declines in acceleration)
      if (i > 0) {
        const deltaTime = dataPoints[i].time - dataPoints[i-1].time;
        const deltaAcceleration = dataPoints[i-1].acceleration - dataPoints[i].acceleration;
        
        // Power drop detection: decrease > 0.15 g within < 0.1 s
        if (deltaTime < 0.1 && deltaAcceleration > 0.15) {
          anomalies.push({
            type: 'drop',
            time: dataPoints[i].time,
            value: dataPoints[i].acceleration,
            delta: deltaAcceleration,
            message: `Power drop detected: ${deltaAcceleration.toFixed(3)}g decrease in ${deltaTime.toFixed(3)}s`
          });
        }
      }
      
      // Find points within the current window for rolling statistics
      const windowStart = dataPoints[i].time - windowSize;
      const windowPoints = dataPoints.filter(
        point => point.time >= windowStart && point.time <= dataPoints[i].time
      );
      
      if (windowPoints.length > 3) {
        // Calculate rolling mean
        const sum = windowPoints.reduce((acc, point) => acc + point.acceleration, 0);
        const mean = sum / windowPoints.length;
        
        // Calculate rolling standard deviation
        const squaredDiffs = windowPoints.map(point => Math.pow(point.acceleration - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / squaredDiffs.length;
        const stdDev = Math.sqrt(avgSquaredDiff);
        
        // Deviation detection: > 3σ from rolling mean
        const deviation = Math.abs(dataPoints[i].acceleration - mean);
        if (deviation > 3 * stdDev && stdDev > 0.01) { // Only if stdDev is significant
          anomalies.push({
            type: 'deviation',
            time: dataPoints[i].time,
            value: dataPoints[i].acceleration,
            message: `Unusual acceleration: ${deviation.toFixed(3)}g from mean (${mean.toFixed(3)}g)`
          });
        }
      }
    }
    
    return anomalies;
  }

  static detectGPSErrors(graphData: GraphData): GPSError[] {
    const errors: GPSError[] = [];

    const dataPoints = graphData.dataInfo.dataArr;
    for (const point of dataPoints) {
      // Check for low satellite count
      if (point.satelliteNum < 10) {
        errors.push({
          time: point.time,
          type: 'lowSatellites',
          value: point.satelliteNum,
          message: `Low satellite count: ${point.satelliteNum}`
        });
      }
      
      // Check for non-RTK fix type
      if (graphData.modelNumber == "DRG70" && point.fixType !== 3) {
        errors.push({
          time: point.time,
          type: 'nonRTK',
          value: point.fixType,
          message: `Non-RTK GPS fix: ${point.fixType} (RTK-fix recommended for precision)`
        });
      }
    }
    
    return errors;
  }

  static calculateDensityAltitude(weatherInfo: MainWeatherInfo): number | null {
    // If daValue is already provided, return it
    if (weatherInfo.daValue !== undefined) {
      return weatherInfo.daValue;
    }
    
    // If we have the required weather data, calculate it
    if (weatherInfo.temp !== undefined && 
        weatherInfo.pressure !== undefined && 
        weatherInfo.humidity !== undefined) {
      // Simplified calculation - in a real implementation, this would be more complex
      // This is just a placeholder to show the concept
      const temperatureK = weatherInfo.temp + 273.15; // Convert to Kelvin
      const pressureHpa = weatherInfo.pressure;
      
      // Very simplified formula - not scientifically accurate
      const densityAltitude = (1 - Math.pow(pressureHpa / 1013.25, 0.190284)) * 145366.45;
      return Math.round(densityAltitude);
    }
    
    return null;
  }
}