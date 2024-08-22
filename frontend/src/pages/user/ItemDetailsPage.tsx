// import CountDown from '@/components/common/CountDown';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { usePlaceBid } from '@/hooks/bidHooks';
// import { useGetItemDetails } from '@/hooks/itemHooks';
// import { useState } from 'react';
// import toast from 'react-hot-toast';
// import { useParams } from 'react-router-dom';

// function ItemDetails() {
//     const { id } = useParams<{ id: string }>();
//     const { data, isLoading, isError, refetch } = useGetItemDetails(id!);
//     const [bidAmount, setBidAmount] = useState('');
//     const { mutate: placeBid, isPending: isBidPending } = usePlaceBid();

//     if (isLoading) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 Loading...
//             </div>);
//     };
//     if (isError) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 Error fetching item details
//             </div>
//         );
//     };
//     if (!data || !data.item) return <div className="flex justify-center items-center h-screen">Item not found</div>;

//     const item = data.item;

//     const handleBid = () => {
//         if (parseFloat(bidAmount) > item.currentPrice) {
//             placeBid({
//                 amount: parseFloat(bidAmount),
//                 itemId: id!,
//                 timestamp: new Date().toISOString()
//             }, {
//                 onSuccess: () => {
//                     toast.success("Bid placed successfully!");
//                     refetch();
//                     setBidAmount('');
//                 },
//                 onError: (error: Error) => {
//                     toast.error(error.message);
//                 },
//             });
//         } else {
//             toast.error("Bid amount must be greater than current price");
//         }
//     };


//     return (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//             <Card>
//                 <CardContent>
//                     <div className="flex flex-col md:flex-row gap-8">
//                         <div className="w-full md:w-1/2">
//                             <img src={item.image} alt={item.name} className="w-full h-auto rounded-lg" />
//                         </div>
//                         <div className="w-full md:w-1/2">
//                             <CardTitle className="text-3xl font-bold">{item.name}</CardTitle>
//                             <p className="text-lg mb-4">{item.description}</p>
//                             <p className="text-xl font-bold mb-4">Current Bid: ${item.currentPrice.toFixed(2)}</p>
//                             <div className="text-lg font-semibold mb-4">
//                                 Time Left: <CountDown endTime={new Date(item.auctionEndTime)} />
//                             </div>
//                             <div className="flex gap-4 mb-4">
//                                 <Input
//                                     type="number"
//                                     value={bidAmount}
//                                     onChange={(e) => setBidAmount(e.target.value)}
//                                     placeholder={`Min bid > $${(item.currentPrice).toFixed(2)}`}
//                                     className="flex-grow"
//                                 />
//                                 <Button
//                                     onClick={handleBid}
//                                     disabled={
//                                         parseFloat(bidAmount) <= item.currentPrice || new Date(item.auctionEndTime) <= new Date() || isBidPending}
//                                 >
//                                     Submit Bid
//                                 </Button>
//                             </div>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }

// export default ItemDetails;