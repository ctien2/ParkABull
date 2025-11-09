'use client'

import { useState, useEffect } from 'react';
import FullPageMapbox from '@/components/map/full-page-mapbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function FurnasLotLiveCVPage() {
    const [departures, setDepartures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [departureTime, setDepartureTime] = useState('');
    
    // Live CV data from video_parking_detector.py
    const [cvData, setCvData] = useState({
        free: 0,
        occupied: 0,
        total: 0,
        last_updated: 'Never',
        error: null
    });

    // Set current time when dialog opens
    useEffect(() => {
        if (dialogOpen && !departureTime) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setDepartureTime(`${hours}:${minutes}`);
        }
    }, [dialogOpen, departureTime]);

    // Handler functions
    const handleSubmitSchedule = async () => {
        if (!departureTime) {
            console.error('Please select a departure time');
            return;
        }

        console.log('Selected departure time:', departureTime);
        setDialogOpen(false);
        setDepartureTime('');

        // TODO: Implement API call
    };

    const handleLeavingSoon = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/leaving-soon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lot_name: 'Furnas Hall Parking',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update leaving status');
            }

            const data = await response.json();
            console.log('Leaving soon updated:', data);
        } catch (error) {
            console.error('Error updating leaving status:', error);
        }
    };

    // Fetch live CV data
    useEffect(() => {
        const fetchLiveCVData = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/lot/live-cv-data', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch live CV data');
                }

                const data = await response.json();
                setCvData({
                    free: data.free || 0,
                    occupied: data.occupied || 0,
                    total: data.total || 0,
                    last_updated: data.last_updated || 'Unknown',
                    error: null
                });
            } catch (error) {
                console.error('Error fetching live CV data:', error);
                setCvData(prev => ({
                    ...prev,
                    error: error.message
                }));
            } finally {
                setLoading(false);
            }
        };

        fetchLiveCVData();

        // Poll every 2 seconds for real-time updates
        const interval = setInterval(fetchLiveCVData, 2000);
        return () => clearInterval(interval);
    }, []);

    // Determine availability status
    const getAvailabilityStatus = () => {
        if (cvData.total === 0) return { text: 'Unknown', color: 'text-gray-600' };
        const percentFree = (cvData.free / cvData.total) * 100;
        if (percentFree > 50) return { text: 'Available', color: 'text-green-600' };
        if (percentFree > 20) return { text: 'Limited', color: 'text-orange-600' };
        return { text: 'Full', color: 'text-red-600' };
    };

    const status = getAvailabilityStatus();

    return (
        <FullPageMapbox
            center={[-78.7863533685218, 43.00247044789438]}
            zoom={18}
            leftSidebar={
                <div className="p-6 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Furnas Hall Parking</h1>
                        <p className="text-sm text-muted-foreground">University at Buffalo - North Campus</p>
                        <Badge className="mt-2" variant="secondary">
                            🎥 Live Computer Vision
                        </Badge>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-lg font-semibold mb-3">Availability</p>
                            {cvData.error ? (
                                <div className="space-y-2">
                                    <p className="text-sm text-red-600">⚠️ {cvData.error}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Make sure the computer vision script is running
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-4xl font-bold ${status.color}`}>
                                            {cvData.free}
                                        </span>
                                        <span className="text-muted-foreground">/ {cvData.total} spaces</span>
                                    </div>
                                    <Badge className="mt-3" variant="default">{status.text}</Badge>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Last updated: {cvData.last_updated}
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-lg font-semibold mb-3">Occupancy Details</p>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Free Spots</span>
                                    <span className="text-lg font-bold text-green-600">{cvData.free}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Occupied Spots</span>
                                    <span className="text-lg font-bold text-red-600">{cvData.occupied}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total Capacity</span>
                                    <span className="text-lg font-bold">{cvData.total}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <p className="text-lg font-semibold">Lot Information</p>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Operating Hours</h4>
                                <p className="text-sm text-muted-foreground">24/7 Access</p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Parking Fee</h4>
                                <p className="text-sm text-muted-foreground">$2.50/hour • $15.00/day</p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Permit Required</h4>
                                <p className="text-sm text-muted-foreground">Blue or Gold permit</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            }
            rightSidebar={
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
                                            className="w-full h-14 text-2xl font-semibold text-center tracking-wider"
                                            placeholder="--:--"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">
                                        Select when you plan to leave the parking lot
                                    </p>
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

                    <Button size="lg" className="w-full h-14 text-lg font-semibold" variant="destructive"
                        onClick={handleLeavingSoon}>
                        Leaving Soon
                    </Button>

                    <Card className="flex-1 flex flex-col min-h-0">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Live Statistics</CardTitle>
                            <CardDescription>Real-time computer vision analysis</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0 pb-4">
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Free Spaces</span>
                                        <span className="text-2xl font-bold text-green-600">{cvData.free}</span>
                                    </div>
                                </div>
                                
                                <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-950">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Occupied Spaces</span>
                                        <span className="text-2xl font-bold text-red-600">{cvData.occupied}</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg border">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Total Detected</span>
                                        <span className="text-2xl font-bold">{cvData.total}</span>
                                    </div>
                                </div>

                                {cvData.total > 0 && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                            <span>Occupancy Rate</span>
                                            <span>{Math.round((cvData.occupied / cvData.total) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div 
                                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                                                style={{ width: `${(cvData.occupied / cvData.total) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            }
        />
    );
}
