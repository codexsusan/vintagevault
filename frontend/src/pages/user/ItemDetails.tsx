import AuctionEnded from '@/components/item-details/AuctionEnded';
import AuctionNotEnded from '@/components/item-details/AuctionNotEnded';
import BiddingHistory from '@/components/item-details/BiddingHistory';
import { useGetItemDetails } from '@/hooks/itemHooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useParams } from 'react-router-dom';

function ItemDetails() {
    useDocumentTitle("Item Details");
    const { id } = useParams<{ id: string }>();
    const { data: itemData, isLoading: itemLoading, isError: itemError, refetch } = useGetItemDetails(id!);

    const triggerRefetch = () => {
        refetch();
    };

    if (itemLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    if (itemError || !itemData || !itemData.item) {
        return <div className="flex justify-center items-center h-screen">Error fetching item details</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2 py-10 flex items-center overflow-hidden border-0">
                    <img src={itemData.item.image} alt={itemData.item.name} className="w-full h-auto" />
                </div>
                <div className='py-10 space-y-10 w-full'>
                    <h2 className='text-3xl font-bold text-gray-700 leading-relaxed'>
                        {itemData.item.name}
                    </h2>
                    {
                        itemData.item.awarded ?
                            <AuctionEnded id={id!} itemData={itemData} triggerRefetch={triggerRefetch} /> :
                            <AuctionNotEnded id={id!} itemData={itemData} triggerRefetch={triggerRefetch} />
                    }
                </div>
            </div>
            <div className='space-y-2'>
                <h3 className='text-xl font-semibold'>Description:</h3>
                <p className=' text-gray-500 text-base font-medium'>
                    {itemData.item.description}
                </p>
            </div>
            <div>
                <BiddingHistory id={id!} />
            </div>
        </div>
    );
}

export default ItemDetails