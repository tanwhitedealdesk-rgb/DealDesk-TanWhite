import React, { useEffect, useRef, useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '../../constants';
import { loadGoogleMapsScript } from '../../services/utils';

interface BuyerTargetMapProps {
    locations: string[];
}

const MAP_ID = 'af9f1e180df0a12509417f9f';

export const BuyerTargetMap: React.FC<BuyerTargetMapProps> = ({ locations }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    useEffect(() => {
        // Load the script if it's not already there
        if (!(window as any).google?.maps) {
            loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
        }
        
        // Poll for google.maps to be available
        const interval = setInterval(() => {
            if ((window as any).google?.maps && (window as any).google.maps.places) {
                clearInterval(interval);
                setIsMapLoaded(true);
            }
        }, 100);
        
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!isMapLoaded || !mapRef.current) return;

        const google = (window as any).google;

        // Initialize map if not already initialized
        if (!mapInstanceRef.current) {
            mapInstanceRef.current = new google.maps.Map(mapRef.current, {
                center: { lat: 33.7490, lng: -84.3880 }, // Default to Atlanta
                zoom: 9,
                mapId: MAP_ID,
                disableDefaultUI: true,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
            });
        }

        const map = mapInstanceRef.current;
        const placesService = new google.maps.places.PlacesService(map);

        // Feature Layers
        const localityLayer = map.getFeatureLayer('LOCALITY');
        const postalCodeLayer = map.getFeatureLayer('POSTAL_CODE');
        const countyLayer = map.getFeatureLayer('ADMINISTRATIVE_AREA_LEVEL_2');

        // Helper to fetch Place ID
        const getPlaceId = (query: string): Promise<string | null> => {
            return new Promise((resolve) => {
                const request = {
                    query: query,
                    fields: ['place_id', 'geometry'],
                };
                placesService.findPlaceFromQuery(request, (results: any[], status: any) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
                        resolve(results[0].place_id || null);
                    } else {
                        resolve(null);
                    }
                });
            });
        };

        // Process locations and apply styles
        const processLocations = async () => {
            const localityPlaceIds: string[] = [];
            const postalCodePlaceIds: string[] = [];
            const countyPlaceIds: string[] = [];
            
            // Parse location strings into type and value
            const parsedLocations = locations.map(loc => {
                const parts = loc.split(':');
                if (parts.length > 1) {
                    return { type: parts[0].trim(), value: parts.slice(1).join(':').trim() };
                }
                return { type: 'Location', value: loc };
            });

            const bounds = new google.maps.LatLngBounds();
            let hasBounds = false;

            for (const loc of parsedLocations) {
                let query = loc.value;
                let targetLayer = null;

                if (loc.type === 'Zip Code') {
                    targetLayer = 'postal';
                } else if (loc.type === 'City') {
                    query += ', GA'; 
                    targetLayer = 'locality';
                } else if (loc.type === 'County') {
                    query += ', GA';
                    targetLayer = 'county';
                } else if (loc.type === 'Neighborhood') {
                    query += ', Atlanta, GA';
                    targetLayer = 'locality'; // Neighborhoods often map to localities or sub-localities
                } else {
                    // Default fallback
                    query += ', GA';
                }

                // Get Place ID
                const request = {
                    query: query,
                    fields: ['place_id', 'geometry'],
                };
                
                await new Promise<void>((resolve) => {
                     placesService.findPlaceFromQuery(request, (results: any[], status: any) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
                            const placeId = results[0].place_id;
                            if (placeId) {
                                if (targetLayer === 'locality') localityPlaceIds.push(placeId);
                                else if (targetLayer === 'postal') postalCodePlaceIds.push(placeId);
                                else if (targetLayer === 'county') countyPlaceIds.push(placeId);
                                else {
                                    // Try to guess based on type if unknown
                                    if (loc.type === 'City') localityPlaceIds.push(placeId);
                                    else if (loc.type === 'Zip Code') postalCodePlaceIds.push(placeId);
                                    else countyPlaceIds.push(placeId);
                                }
                            }
                            
                            if (results[0].geometry && results[0].geometry.viewport) {
                                bounds.union(results[0].geometry.viewport);
                                hasBounds = true;
                            } else if (results[0].geometry && results[0].geometry.location) {
                                bounds.extend(results[0].geometry.location);
                                hasBounds = true;
                            }
                        }
                        resolve();
                    });
                });
            }

            if (hasBounds) {
                map.fitBounds(bounds);
            }

            // Apply styles
            const styleOptions = {
                fillColor: '#3b82f6', // Blue-500
                fillOpacity: 0.3,
                strokeColor: '#2563eb', // Blue-600
                strokeWeight: 2,
            };

            localityLayer.style = (feature: any) => {
                if (localityPlaceIds.includes(feature.placeId)) {
                    return styleOptions;
                }
            };

            postalCodeLayer.style = (feature: any) => {
                if (postalCodePlaceIds.includes(feature.placeId)) {
                    return styleOptions;
                }
            };

            countyLayer.style = (feature: any) => {
                if (countyPlaceIds.includes(feature.placeId)) {
                    return styleOptions;
                }
            };
        };

        processLocations();

    }, [isMapLoaded, locations]);

    return (
        <div ref={mapRef} className="w-full h-full rounded-xl" />
    );
};
