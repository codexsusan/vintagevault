import CountDown from '@/components/common/CountDown';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGetItemDetails } from '@/hooks/itemHooks';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading, isError } = useGetItemDetails(id!);
    const [bidAmount, setBidAmount] = useState('');
    // const placeBid = usePlaceBid();

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (isError) {
        
        return <div className="flex justify-center items-center h-screen">Error fetching item details</div>
    };
    if (!data || !data.item) return <div className="flex justify-center items-center h-screen">Item not found</div>;

    const item = data.item;

    const handleBid = () => {
        if (parseFloat(bidAmount) > item.currentPrice) {
            // placeBid.mutate({ itemId: id, amount: parseFloat(bidAmount) });
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-1/2">
                            <img src={item.image} alt={item.name} className="w-full h-auto rounded-lg" />
                        </div>
                        <div className="w-full md:w-1/2">
                            <p className="text-lg mb-4">{item.description}</p>
                            <p className="text-xl font-bold mb-4">Current Bid: ${item.currentPrice.toFixed(2)}</p>
                            <div className="text-lg font-semibold mb-4">
                                Time Left: <CountDown endTime={new Date(item.auctionEndTime)} />
                            </div>
                            <div className="flex gap-4 mb-4">
                                <Input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    placeholder={`Min bid > $${(item.currentPrice ).toFixed(2)}`}
                                    className="flex-grow"
                                />
                                <Button
                                    onClick={handleBid}
                                    disabled={parseFloat(bidAmount) <= item.currentPrice || new Date(item.auctionEndTime) <= new Date()}
                                >
                                    Submit Bid
                                </Button>
                            </div>
                            {/* {placeBid.isError && (
                                <p className="text-red-500">Error placing bid. Please try again.</p>
                            )}
                            {placeBid.isSuccess && (
                                <p className="text-green-500">Bid placed successfully!</p>
                            )} */}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default ItemDetails;