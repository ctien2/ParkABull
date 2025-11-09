import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Departure {
    time: string;
    count: number;
}

interface ListLeavingProps {
    departures?: Departure[];
}

export default function ListLeaving({ departures }: ListLeavingProps) {
    const displayDepartures = departures || [];

    return (
        <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="">
                <CardTitle className="text-lg">Upcoming Departures</CardTitle>
                <CardDescription>Spots opening up soon</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pb-4">
                <ScrollArea className="h-full pr-4">
                    <div className="space-y-3">
                        {displayDepartures.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No upcoming departures scheduled
                            </p>
                        ) : (
                            displayDepartures.map((departure, index) => (
                                <div 
                                    key={index}
                                    className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            Departing at {departure.time}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {departure.count} {departure.count === 1 ? 'vehicle' : 'vehicles'}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {departure.count}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

