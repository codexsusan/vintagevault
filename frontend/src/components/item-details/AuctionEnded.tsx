import { GetItemDetailsResponse } from '@/services/itemService';
import { Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AuctionEnded = ({
    itemData,
}: {
    id: string;
    itemData: GetItemDetailsResponse;
    triggerRefetch: () => void;
}) => {
    const { item } = itemData;
    const totalBids = item.bids.length;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Auction Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Final Bid Amount</p>
                        <p className="text-3xl font-bold text-gray-900">
                            ${item.currentPrice.toFixed(2)}
                        </p>
                    </div>
                    <Badge variant="secondary" className="text-lg">
                        {totalBids} {totalBids === 1 ? 'Bid' : 'Bids'}
                    </Badge>
                </div>
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-500">Auction Winner:</p>
                    <p className="text-lg font-semibold text-gray-900">{item.user?.name || 'N/A'}</p>
                </div>
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="flex items-center space-x-2 py-3">
                        <Info className="w-5 h-5 text-red-500" />
                        <p className="text-sm font-medium text-red-800">Auction has ended</p>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
};

export default AuctionEnded;