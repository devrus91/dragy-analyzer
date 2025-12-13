"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DataPoint } from '../services/dragyService';
import L, { Icon } from 'leaflet';

// Create start icon
const startIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

// Create finish icon with flag emoji
const finishIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

interface RouteMapProps {
    dataPoints: DataPoint[];
}

export function RouteMap({ dataPoints }: RouteMapProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        // Fix for default marker icons in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    // Filter out points with invalid coordinates
    const validPoints = dataPoints.filter(
        point =>
            typeof point.latitude === 'number' &&
            typeof point.longitude === 'number' &&
            !isNaN(point.latitude) &&
            !isNaN(point.longitude) &&
            point.latitude !== 0 &&
            point.longitude !== 0
    );

    // Create array of [latitude, longitude] pairs
    const positions = validPoints.map(point => [point.latitude, point.longitude]);

    // Calculate bounds to fit the route
    let bounds: [[number, number], [number, number]] | undefined;
    if (positions.length > 0) {
        const latitudes = positions.map(pos => pos[0]);
        const longitudes = positions.map(pos => pos[1]);
        bounds = [
            [Math.min(...latitudes), Math.min(...longitudes)],
            [Math.max(...latitudes), Math.max(...longitudes)]
        ];
    }

    // Get the first and last positions
    const startPosition = positions.length > 0 ? positions[0] : null;
    const finishPosition = positions.length > 0 ? positions[positions.length - 1] : null;

    if (!isClient) {
        return (
            <div className="h-96 flex items-center justify-center bg-gray-900/50 rounded-lg">
                <p className="text-gray-500">Loading map...</p>
            </div>
        );
    }

    if (positions.length === 0) {
        return (
            <div className="h-96 flex items-center justify-center bg-gray-900/50 rounded-lg">
                <p className="text-gray-500">No valid GPS data available to display route</p>
            </div>
        );
    }

    return (
        <MapContainer
            bounds={bounds}
            className="h-96 rounded-lg"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline
                positions={positions as [number, number][]}
                color="#3b82f6"
                weight={4}
            />
            {startPosition && (
                <Marker
                    position={[startPosition[0], startPosition[1]]}
                    icon={startIcon}
                >
                    <Popup>🏁 Start Point</Popup>
                </Marker>
            )}
            {finishPosition && (
                <Marker
                    position={[finishPosition[0], finishPosition[1]]}
                    icon={finishIcon}
                >
                    <Popup>🚩 Finish Line</Popup>
                </Marker>
            )}
        </MapContainer>
    );
}
