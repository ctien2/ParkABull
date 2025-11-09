import FullPageMapbox from '@/components/map/full-page-mapbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function FurnasLotPage() {
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
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Availability</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-green-600">87</span>
                                <span className="text-muted-foreground">/ 150 spaces</span>
                            </div>
                            <Badge className="mt-3" variant="default">Available</Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Lot Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                    <Button size="lg" className="w-full h-14 text-lg font-semibold">
                        Submit Parking
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
