import AuctionEnded from '@/components/item-details/AuctionEnded';
import AuctionNotEnded from '@/components/item-details/AuctionNotEnded';
import BiddingHistoryTable from '@/components/item-details/BiddingHistoryTable';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetItemDetails } from '@/hooks/itemHooks';
import { useConfetti } from '@/hooks/useConfetti';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useRealtimeItemUpdates } from '@/hooks/useRTItemUpdate';
import { AlertCircle } from "lucide-react";
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';


function ItemDetails() {
    useDocumentTitle("Item Details");
    const confetti = useConfetti();

    const { id } = useParams<{ id: string }>();
    const { data: itemData, isLoading, isError, refetch } = useGetItemDetails(id!);

    useRealtimeItemUpdates(id!);

    useEffect(() => {
        // TODO: Might implement (P5)
        if (itemData?.item?.awarded && itemData?.item?.user?.isWinner) {
            confetti.onOpen();
        }

        setTimeout(() => {
            confetti.onClose();
        }, 10000);
    }, [itemData?.item?.awarded, itemData?.item?.user?.isWinner]);

    const triggerRefetch = () => {
        refetch();
    };

    if (isLoading) {
        return <ItemDetailsSkeleton />;
    }

    if (isError || !itemData || !itemData.item) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        There was an error fetching the item details. Please try again later.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }


    const { item } = itemData;


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-1/2">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-auto rounded-lg shadow-lg object-cover aspect-square"
                    />
                </div>
                <div className="w-full lg:w-1/2 space-y-6">
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                        {item.name}
                    </h1>
                    <div className="prose max-w-none">
                        <h2 className="text-xl font-semibold text-gray-700">Description</h2>
                        <p className="text-gray-600">{item.description}</p>
                    </div>
                    {item.awarded ? (
                        <AuctionEnded id={id!} itemData={itemData} triggerRefetch={triggerRefetch} />
                    ) : (
                        <AuctionNotEnded id={id!} itemData={itemData} triggerRefetch={triggerRefetch} />
                    )}
                </div>
            </div>
            <BiddingHistoryTable id={id!} />
        </div>
    );
}

function ItemDetailsSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col lg:flex-row gap-8">
                <Skeleton className="w-full lg:w-1/2 h-96" />
                <div className="w-full lg:w-1/2 space-y-6">
                    <Skeleton className="h-10 w-3/4" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    );
}

export default ItemDetails;