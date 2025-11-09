'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import ListLeaving from '@/components/list-leaving';

// Get API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function FurnasLotPage() {
    const [departures, setDepartures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [departureTime, setDepartureTime] = useState('');
    const [hasClickedLeavingSoon, setHasClickedLeavingSoon] = useState(false);

    // Set current time when dialog opens
    useEffect(() => {
        if (dialogOpen && !departureTime) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setDepartureTime(`${hours}:${minutes}`);
        }
    }, [dialogOpen, departureTime]);

    // Handler functions - accessible throughout the component
    const handleSubmitSchedule = async () => {
        if (!departureTime) {
            console.error('Please select a departure time');
            return;
        }

        console.log('Selected departure time:', departureTime);
        // Close dialog and reset form
        setDialogOpen(false);
        setDepartureTime('');

        // TODO: Implement API call
        // try {
        //     const response = await fetch(`${API_URL}/api/submit-schedule`, {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({
        //             lot_name: 'Furnas Hall Parking',
        //             departure_time: departureTime,
        //         }),
        //     });

        //     if (!response.ok) {
        //         throw new Error('Failed to submit schedule');
        //     }

        //     const data = await response.json();
        //     console.log('Schedule submitted:', data);
        //     // Show success message to user
        // } catch (error) {
        //     console.error('Error submitting schedule:', error);
        //     // Show error message to user
        // }
    };

    const handleLeavingSoon = () => {
        // Disable button after clicking
        setHasClickedLeavingSoon(true);
        console.log('Leaving soon clicked');
        // TODO: Implement API call when backend is ready
    };

    // Fetch departures on component mount
    useEffect(() => {
        const fetchOccupancy = async () => {
            try {
                const response = await fetch(`${API_URL}/api/lot/furnas?lot_name=Furnas`, {
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
            } catch (error) {
                console.error('Error fetching departures:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOccupancy();

        // Optional: Auto-refresh every 30 seconds for real-time updates
        const interval = setInterval(fetchOccupancy, 30000);
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="flex h-screen w-full">
            {/* Left Sidebar */}
            <div className="w-96 h-full overflow-y-auto border-r bg-background">
                <div className="p-6 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Furnas Hall Parking</h1>
                        <p className="text-sm text-muted-foreground">University at Buffalo - North Campus</p>
                    </div>

                    <Card>
                        <CardContent>
                            <p className="text-lg font-semibold">Availability</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-green-600">87</span>
                                <span className="text-muted-foreground">/ 150 spaces</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <p className="text-lg font-semibold">Leaving Soon</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-orange-600">5</span>
                                <span className="text-muted-foreground">/ 150 spaces</span>
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
            </div>

            {/* Middle Empty Space */}
            <div className="flex-1 bg-muted/20">
                {/* Empty space in the middle */}
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
                        onClick={handleLeavingSoon}
                        disabled={hasClickedLeavingSoon}>
                        {hasClickedLeavingSoon ? 'Leaving Soon' : 'Leaving Soon'}
                    </Button>

                    <ListLeaving departures={departures} />
                </div>
            </div>
        </div>
    );
}
