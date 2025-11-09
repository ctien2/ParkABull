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

export default function FurnasLotPage() {
    const [departures, setDepartures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [departureTime, setDepartureTime] = useState('');

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
        //     const response = await fetch('http://localhost:5001/api/submit-schedule', {
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
            // Show success message to user
        } catch (error) {
            console.error('Error updating leaving status:', error);
            // Show error message to user
        }
    };

    // Fetch departures on component mount
    useEffect(() => {
        const fetchOccupancy = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/lot/furnas?lot_name=Furnas Hall Parking', {
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
        <FullPageMapbox
            center={[-78.7863533685218, 43.00247044789438]}
            zoom={18}
            leftSidebar={
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
                        onClick={handleLeavingSoon}>
                        Leaving Soon
                    </Button>

                    <Card className="flex-1 flex flex-col min-h-0">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Upcoming Departures</CardTitle>
                            <CardDescription>Spots opening up soon</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0 pb-4">
                            <ScrollArea className="h-full pr-4">
                                <div className="space-y-3">
                                    {/* Schedule Items */}
                                    <div className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Section A - Spot 23</p>
                                            <p className="text-xs text-muted-foreground">Leaving at 2:30 PM</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">15 min</Badge>
                                    </div>

                                    <div className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Section B - Spot 45</p>
                                            <p className="text-xs text-muted-foreground">Leaving at 3:00 PM</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">45 min</Badge>
                                    </div>

                                    <div className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Section A - Spot 12</p>
                                            <p className="text-xs text-muted-foreground">Leaving at 3:15 PM</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">1 hr</Badge>
                                    </div>

                                    <div className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Section C - Spot 67</p>
                                            <p className="text-xs text-muted-foreground">Leaving at 4:00 PM</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">1.5 hr</Badge>
                                    </div>

                                    <div className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Section B - Spot 31</p>
                                            <p className="text-xs text-muted-foreground">Leaving at 4:30 PM</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">2 hr</Badge>
                                    </div>

                                    <div className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Section A - Spot 8</p>
                                            <p className="text-xs text-muted-foreground">Leaving at 5:00 PM</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">2.5 hr</Badge>
                                    </div>

                                    <div className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Section C - Spot 89</p>
                                            <p className="text-xs text-muted-foreground">Leaving at 5:30 PM</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">3 hr</Badge>
                                    </div>

                                    <div className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Section B - Spot 54</p>
                                            <p className="text-xs text-muted-foreground">Leaving at 6:00 PM</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">3.5 hr</Badge>
                                    </div>
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            }
        />
    );
}
