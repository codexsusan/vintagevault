import { useGetItemBids } from '@/hooks/itemHooks';
import { Card } from '../ui/card';

const BiddingHistory = ({ id }: { id: string }) => {

    const { data: bidsData, isLoading, isError } = useGetItemBids(id);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (isError || !bidsData) {
        return <div className="flex justify-center items-center h-screen">Error fetching item details</div>;
    }
    return (
        <div>
            <h3 className='text-xl font-semibold'>Bidding History</h3>
            <div className='flex flex-col gap-y-4 mt-2'>
                {
                    bidsData.data.map((bid) => (
                        <Card key={bid._id} className='flex justify-between items-start p-3'>
                            <div className=''>
                                <p className='text-gray-600 text-xl font-semibold'>{bid.user.name}</p>
                                <p className='text-gray-600'>{new Date(bid.timestamp).toLocaleString().split(",")[0]}</p>
                                <p className='text-gray-600'>{new Date(bid.timestamp).toLocaleString().split(",")[1]}</p>
                            </div>
                            <div>
                                <p className='text-gray-600 text-xl font-semibold'>${bid.amount.toFixed(2)}</p>
                                <div>
                                    {
                                        bid.isAutoBid &&
                                        <Card
                                            className='bg-green-200 text-green-700 py-2 rounded-md flex justify-center items-center gap-x-2 text-sm'
                                        >
                                            <p>Autobid</p>
                                        </Card>
                                    }
                                </div>
                            </div>
                        </Card>
                    ))
                }
            </div>
        </div>
    )
}

export default BiddingHistory
