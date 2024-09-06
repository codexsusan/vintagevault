import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { useGetItemBids } from "@/hooks/itemHooks";
import { AlertCircle, Banknote, Bot, Calendar, Clock, User } from "lucide-react";

interface Bid {
    _id: string;
    user: {
        name: string;
    };
    timestamp: string;
    isAutoBid: boolean;
    amount: number;
}

const BiddingHistoryTable = ({ id }: { id: string }) => {
    const { data, isLoading, isError } = useGetItemBids(id);

    if (isLoading) {
        return <BiddingHistorySkeleton />;
    }

    if (isError || !data) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    There was an error fetching the bidding history. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    const bids: Bid[] = data.data;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Bidding History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/5">
                                    <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4" />
                                        <span>Bidder</span>
                                    </div>
                                </TableHead>
                                <TableHead className="w-1/5">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>Date</span>
                                    </div>
                                </TableHead>
                                <TableHead className="w-1/5">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4" />
                                        <span>Time</span>
                                    </div>
                                </TableHead>
                                <TableHead className="w-1/5">
                                    <div className="flex items-center space-x-2">
                                        <Bot className="h-4 w-4" />
                                        <span>Bid Type</span>
                                    </div>
                                </TableHead>
                                <TableHead className="w-1/5 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Banknote className="h-4 w-4" />
                                        <span>Amount</span>
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bids.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No bids have been placed yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bids.map((bid) => (
                                    <TableRow key={bid._id}>
                                        <TableCell className="font-medium">{bid.user.name}</TableCell>
                                        <TableCell>{new Date(bid.timestamp).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(bid.timestamp).toLocaleTimeString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={bid.isAutoBid ? "default" : "secondary"}>
                                                {bid.isAutoBid ? "Auto" : "Manual"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            ${bid.amount.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

const BiddingHistorySkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </CardContent>
    </Card>
);

export default BiddingHistoryTable;