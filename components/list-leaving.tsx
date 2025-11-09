import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Departure {
    section: string;
    spot: number;
    time: string;
    timeUntil: string;
}

interface ListLeavingProps {
    departures?: Departure[];
}

export default function ListLeaving({ departures }: ListLeavingProps) {
    // Default mock data if no departures provided
    const defaultDepartures: Departure[] = [
        { section: 'A', spot: 23, time: '2:30 PM', timeUntil: '15 min' },
        { section: 'B', spot: 45, time: '3:00 PM', timeUntil: '45 min' },
        { section: 'A', spot: 12, time: '3:15 PM', timeUntil: '1 hr' },
        { section: 'C', spot: 67, time: '4:00 PM', timeUntil: '1.5 hr' },
        { section: 'B', spot: 31, time: '4:30 PM', timeUntil: '2 hr' },
        { section: 'A', spot: 8, time: '5:00 PM', timeUntil: '2.5 hr' },
        { section: 'C', spot: 89, time: '5:30 PM', timeUntil: '3 hr' },
        { section: 'B', spot: 54, time: '6:00 PM', timeUntil: '3.5 hr' },
    ];

    const displayDepartures = departures || defaultDepartures;

    return (
        <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="">
                <CardTitle className="text-lg">Upcoming Departures</CardTitle>
                <CardDescription>Spots opening up soon</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pb-4">
                <ScrollArea className="h-full pr-4">
                    <div className="space-y-3">
                        {displayDepartures.map((departure, index) => (
                            <div 
                                key={index}
                                className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Section {departure.section} - Spot {departure.spot}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Leaving at {departure.time}
                                    </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    {departure.timeUntil}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

