import { AutoBidDialog } from '@/components/AutoBidDialog';
import CountDown from '@/components/common/CountDown';
import Tooltip from '@/components/custom/tooltip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useGetAutoBidConfig, useToggleAutoBid } from '@/hooks/autoBidHooks';
import { usePlaceBid } from '@/hooks/bidHooks';
import { useGetItemDetails } from '@/hooks/itemHooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

const bidSchema = z.object({
    amount: z.string().refine(
        (value) => parseFloat(value) > 0,
        {
            message: `Bid amount must be greater than 0`,
        }
    ),
    itemId: z.string(),
    isAutoBid: z.boolean(),
});

function ItemDetails() {
    useDocumentTitle("Item Details");

    const { id } = useParams<{ id: string }>();
    const { data: itemData, isLoading: itemLoading, isError: itemError, refetch } = useGetItemDetails(id!);
    const { data: autoBidConfigResponse, isLoading: configLoading, refetch: refetchConfig } = useGetAutoBidConfig();
    const [isAutoBidDialogOpen, setIsAutoBidDialogOpen] = useState(false);
    const toggleAutoBid = useToggleAutoBid();
    const placeBid = usePlaceBid();

    const bidForm = useForm<z.infer<typeof bidSchema>>({
        resolver: zodResolver(bidSchema),
        defaultValues: {
            amount: "0",
            itemId: id!,
            isAutoBid: false,
        },
    });

    const autoBidConfig = autoBidConfigResponse?.data;

    useEffect(() => {
        if (autoBidConfig && itemData) {
            const isAutoBid = autoBidConfig.activeBids.find((bid) => bid.itemId === id) !== undefined;
            bidForm.setValue('isAutoBid', isAutoBid);
        }
    }, [autoBidConfig, itemData, id]);

    if (itemLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    if (itemError || !itemData || !itemData.item) {
        return <div className="flex justify-center items-center h-screen">Error fetching item details</div>;
    }

    const item = itemData.item;
    const totalBids = item.bids.length;

    const submitBid = async (values: z.infer<typeof bidSchema>) => {
        if (parseFloat(values.amount) <= item.currentPrice) {
            toast.error("Bid amount must be greater than the current price");
            return;
        }

        await placeBid.mutateAsync({
            itemId: values.itemId,
            amount: parseFloat(values.amount),
            isAutoBid: values.isAutoBid,
            timestamp: new Date().toISOString(),
        }, {
            onSuccess: () => {
                toast.success("Bid placed successfully!");
                refetch();
                refetchConfig();
            },
            onError: (error: Error) => {
                toast.error(error.message);
            },
        });
        bidForm.reset();
    };

    const handleAutoBidToggle = async (checked: boolean) => {
        if (checked && !autoBidConfig) {
            return;
        }

        await toggleAutoBid.mutateAsync(id!);
        bidForm.setValue('isAutoBid', checked);
        toast.success(checked ? "Auto-bid activated" : "Auto-bid deactivated");
    };

    const { isValid, isSubmitting } = bidForm.formState;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2 py-10 flex items-center overflow-hidden border-0">
                    <img src={item.image} alt={item.name} className="w-full h-auto" />
                </div>
                <div className='py-10 space-y-10 w-full'>
                    <h2 className='text-3xl font-bold text-gray-700 leading-relaxed'>
                        {item.name}
                    </h2>
                    <Card className='p-6 w-full'>
                        <div className='flex justify-between items-center'>
                            <div>
                                <p className='text-lg font-normal leading-relaxed'>Current Price</p>
                                <p className='text-4xl font-semibold leading-relaxed text-gray-600'>$ {item.currentPrice.toFixed(2)}</p>
                                <p className='text-gray-600'>{totalBids > 0 ? `Total Bids: ${totalBids}` : 'Be the first to bid!'}</p>
                            </div>
                            <div className=''>
                                <p>Time Left:</p>
                                <CountDown classname='text-gray-600 text-xl font-semibold' endTime={new Date(item.auctionEndTime)} />
                            </div>
                        </div>
                        <Form {...bidForm}>
                            <form onSubmit={bidForm.handleSubmit(submitBid)} className="space-y-2 mt-4 w-full">
                                <FormField
                                    control={bidForm.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bid Amount</FormLabel>
                                            <div className='flex'>
                                                <Button size={"icon"} variant={"secondary"} disabled>$</Button>
                                                <FormControl>
                                                    <Input
                                                        type='number'
                                                        placeholder={`Min bid > $${(item.currentPrice).toFixed(2)}`}
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormDescription>
                                                Your bid must be greater than the current price of the item.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Tooltip text={autoBidConfigResponse === undefined ? "You haven't configured Auto-Bid" : new Date(item.auctionEndTime) <= new Date() ? "Auction has ended" : ""}>
                                    <FormField
                                        control={bidForm.control}
                                        name="isAutoBid"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base cursor-pointer">
                                                        Auto Bid
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Auto bid when your other outbids your current bid.
                                                    </FormDescription>
                                                </div>
                                                <FormControl className='cursor-pointer'>
                                                    <Switch
                                                        disabled={configLoading || autoBidConfigResponse === undefined || new Date(item.auctionEndTime) <= new Date()}
                                                        checked={field.value}
                                                        onCheckedChange={handleAutoBidToggle}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </Tooltip>

                                <Button
                                    className="w-full"
                                    disabled={
                                        new Date(item.auctionEndTime) <= new Date() || !isValid || isSubmitting || parseFloat(bidForm.watch('amount')) <= item.currentPrice
                                    }
                                    type="submit"
                                >
                                    <span>Submit Bid</span>
                                </Button>
                            </form>
                        </Form>
                        <AutoBidDialog
                            data={autoBidConfigResponse?.data}
                            isOpen={isAutoBidDialogOpen}
                            onClose={() => {
                                setIsAutoBidDialogOpen(false);
                                refetchConfig();
                            }}
                            itemId={id!}
                        >
                            <Button
                                className='mt-5 w-full'
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsAutoBidDialogOpen(true);
                                }}
                                variant={"secondary"}
                            >
                                {
                                    autoBidConfigResponse === undefined ? <span> Configure Auto-Bid</span> : <span>Update Auto-Bid</span>
                                }
                            </Button>
                        </AutoBidDialog>
                    </Card>
                </div>
            </div>
            <div className='mt-0 md:mt-5 text-gray-500 text-base font-medium'>
                {item.description}
            </div>
        </div>
    )
}

export default ItemDetails