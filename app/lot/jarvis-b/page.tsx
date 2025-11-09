'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import ListLeaving from '@/components/list-leaving';

export default function JarvisBLotPage() {
    const [departures, setDepartures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [departureTime, setDepartureTime] = useState('');
    const [hasClickedLeavingSoon, setHasClickedLeavingSoon] = useState(false);
    const [lotData, setLotData] = useState({
        available_spots: 0,
        leaving_soon: 0,
        total_spots: 0
    });
    const [videoError, setVideoError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isInRange, setIsInRange] = useState<boolean>(false);
    const [locationChecked, setLocationChecked] = useState<boolean>(false);

    // Jarvis B Hall Parking lot coordinates (you can adjust these)
    const LOT_LATITUDE = 43.003778;
    const LOT_LONGITUDE = -78.786947;
    const RANGE_THRESHOLD = 10; // Very large threshold for testing - accepts any location

    // Check if user is in range of the parking lot
    const checkIfInRange = (userLat: number, userLon: number): boolean => {
        const latDiff = Math.abs(LOT_LATITUDE - userLat);
        const lonDiff = Math.abs(LOT_LONGITUDE - userLon);
        return latDiff <= RANGE_THRESHOLD && lonDiff <= RANGE_THRESHOLD;
    };

    // Request location on page load
    useEffect(() => {
        const requestLocation = async () => {
            try {
                const location = await getUserLocation();
                const inRange = checkIfInRange(location.latitude, location.longitude);
                setIsInRange(inRange);
                setUserLocation(location);
                console.log('✅ Location obtained:', location, 'In range:', inRange);
                console.log('✅ userLocation state will be set to:', location);
            } catch (error) {
                console.error('❌ Location error:', error);
                setLocationError(error instanceof Error ? error.message : 'Failed to get location');
                setIsInRange(false);
            } finally {
                setLocationChecked(true);
                console.log('✅ Location check complete');
            }
        };
        
        requestLocation();
    }, []);

    // Set current time when dialog opens
    useEffect(() => {
        if (dialogOpen && !departureTime) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setDepartureTime(`${hours}:${minutes}`);
        }
    }, [dialogOpen, departureTime]);

    // Get user location
    const getUserLocation = (): Promise<{ latitude: number; longitude: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    setUserLocation(location);
                    setLocationError(null);
                    resolve(location);
                },
                (error) => {
                    let errorMessage = 'Unable to retrieve location';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                    }
                    setLocationError(errorMessage);
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    };

    // Handler functions - accessible throughout the component
    const handleSubmitSchedule = async () => {
        if (!departureTime) {
            console.error('Please select a departure time');
            return;
        }

        try {
            // Get user location
            let location;
            try {
                location = await getUserLocation();
                console.log('User location obtained:', location);
            } catch (locationErr) {
                console.warn('Could not get location:', locationErr);
                // Continue without location if it fails
            }

            const response = await fetch('http://localhost:5001/api/submit-schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lot_name: 'Jarvis B',
                    departure_time: departureTime,
                    location: location || null, // Include location if available
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit schedule');
            }

            const data = await response.json();
            console.log('Schedule submitted:', data);

            // Close dialog and reset form
            setDialogOpen(false);
            setDepartureTime('');
            setLocationError(null);

            // Show success message to user
        } catch (error) {
            console.error('Error submitting schedule:', error);
            // Show error message to user
        }
    };

    const handleLeavingSoon = async () => {
        console.log('🔵 Button clicked! Current state:', {
            userLocation,
            hasClickedLeavingSoon,
            isInRange
        });
        
        // Check if user has location
        if (!userLocation) {
            console.error('❌ Cannot use Leaving Soon: no location');
            return;
        }

        console.log('✅ Proceeding with leaving soon request...');
        try {
            const response = await fetch('http://localhost:5001/api/leaving-soon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lot_name: 'Jarvis B',
                    user_latitude: userLocation.latitude,
                    user_longitude: userLocation.longitude,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update leaving status');
            }

            const data = await response.json();
            console.log('Leaving soon updated:', data);

            // Update lot data with new values
            if (data.available_spots !== undefined) {
                setLotData({
                    available_spots: data.available_spots,
                    leaving_soon: data.leaving_soon || 0,
                    total_spots: data.total_spots || 150
                });
            }

            // Update departures list if included
            if (data.departures) {
                setDepartures(data.departures);
            }

            setHasClickedLeavingSoon(true);
            // Show success message to user
        } catch (error) {
            console.error('Error updating leaving status:', error);
            // Show error message to user
        }
    };

    // Fetch departures on component mount - only after location is checked
    useEffect(() => {
        // Don't fetch data until location permission has been resolved
        if (!locationChecked) {
            return;
        }

        const fetchOccupancy = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/lot/jarvisb?lot_name=Jarvis%20B', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch occupancy');
                }

                const data = await response.json();
                setDepartures(data.departures || []); // Assuming backend returns {departures: [...]}

                // Update lot data with values from API
                if (data.available_spots !== undefined) {
                    setLotData({
                        available_spots: data.available_spots,
                        leaving_soon: data.leaving_soon || 0,
                        total_spots: data.total_spots || 150
                    });
                }
            } catch (error) {
                console.error('Error fetching departures:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOccupancy();

        // Auto-refresh every 5 seconds for real-time updates (matches backend CV update rate)
        const interval = setInterval(fetchOccupancy, 5000);
        return () => clearInterval(interval);
    }, [locationChecked]);

    // Show loading screen while waiting for location permission
    if (!locationChecked) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Card className="w-96">
                    <CardHeader>
                        <CardTitle>Location Permission Required</CardTitle>
                        <CardDescription>
                            Please allow location access to use this parking service
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center p-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            Waiting for location permission...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full">
            {/* Left Sidebar */}
            <div className="w-96 h-full overflow-y-auto border-r bg-background">
                <div className="p-6 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Jarvis B Parking Lot</h1>
                        <p className="text-sm text-muted-foreground">University at Buffalo - North Campus</p>
                    </div>

                    <Card>
                        <CardContent>
                            <p className="text-lg font-semibold">Availability</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-green-600">{lotData.available_spots}</span>
                                <span className="text-muted-foreground">/ {lotData.total_spots} spaces</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <p className="text-lg font-semibold">Leaving Soon</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-orange-600">{lotData.leaving_soon}</span>
                                <span className="text-muted-foreground">/ {lotData.total_spots} spaces</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="space-y-4">
                            <p className="text-lg font-semibold">Lot Information</p>

                            <div>
                                <h4 className="font-semibold text-sm mb-1">Operating Hours</h4>
                                <p className="text-sm text-muted-foreground">24/7 Access</p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Permit Required</h4>
                                <p className="text-sm text-muted-foreground">Faculty permit required 8am to 3pm.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Middle Video Section */}
            <div className="flex-1 bg-muted/20 flex items-center justify-center p-6">
                <div className="w-full h-full max-w-6xl max-h-full flex flex-col items-center justify-center gap-4">
                    {videoError && (
                        <div className="text-red-500 text-sm">{videoError}</div>
                    )}
                    <video
                        className="w-full h-full object-cover rounded-lg shadow-lg bg-black"
                        loop
                        muted
                        autoPlay
                        playsInline
                        preload="auto"
                        onError={(e) => {
                            const target = e.target as HTMLVideoElement;
                            console.error('Video error:', target.error);
                            setVideoError(`Video error: ${target.error?.message || 'Unknown error'}`);
                        }}
                        onLoadedMetadata={(e) => {
                            const target = e.target as HTMLVideoElement;
                            console.log('Video metadata loaded:', {
                                duration: target.duration,
                                videoWidth: target.videoWidth,
                                videoHeight: target.videoHeight
                            });
                        }}
                        onCanPlay={() => console.log('Video can play')}
                        src="/parking_lot_video_slow.mp4"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-96 h-full overflow-y-auto border-l bg-background">
                <div className="p-6 flex flex-col h-full space-y-4">
                    <Button size="lg" className="w-full h-14 text-lg font-semibold"
                        onClick={() => setDialogOpen(true)}>
                        Submit Schedule
                    </Button>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Submit Your Departure Schedule</DialogTitle>
                                <DialogDescription>
                                    Let others know when you'll be leaving.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-6">
                                <div className="space-y-3">
                                    <label htmlFor="departure-time" className="text-sm font-semibold text-foreground">
                                        Departure Time
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="departure-time"
                                            type="time"
                                            value={departureTime}
                                            onChange={(e) => setDepartureTime(e.target.value)}
                                            className="w-full h-14 text-2xl font-semibold text-center tracking-wider [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5"
                                            placeholder="--:--"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">
                                        Select when you plan to leave the parking lot
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground text-center">
                                        📍 Your location will be shared when submitting
                                    </p>
                                    {locationError && (
                                        <p className="text-xs text-red-500 text-center">
                                            {locationError}
                                        </p>
                                    )}
                                    {userLocation && (
                                        <p className="text-xs text-green-600 text-center">
                                            ✓ Location obtained
                                        </p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmitSchedule} className="w-full sm:w-auto" disabled={!departureTime}>
                                    Submit Schedule
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Location Warning */}
                    {locationError && (
                        <Card className="border-orange-500">
                            <CardContent className="pt-6">
                                <p className="text-sm text-orange-600 font-semibold">⚠️ Location Required</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Please enable location services to use the "Leaving Soon" feature.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {userLocation && !isInRange && (
                        <Card className="border-red-500">
                            <CardContent className="pt-6">
                                <p className="text-sm text-red-600 font-semibold">🚫 Out of Range</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    You must be at the parking lot to use the "Leaving Soon" feature.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Button size="lg" className="w-full h-14 text-lg font-semibold" variant="destructive"
                        onClick={handleLeavingSoon}
                        disabled={hasClickedLeavingSoon || !userLocation}>
                        {hasClickedLeavingSoon ? 'Leaving Soon' : 'Leaving Soon'}
                    </Button>

                    <ListLeaving departures={departures} />
                </div>
            </div>
        </div>
    );
}
