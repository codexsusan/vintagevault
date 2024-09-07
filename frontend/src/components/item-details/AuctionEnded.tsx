import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDownloadInvoice, useGetItemInvoice } from '@/hooks/invoiceHooks';
import { GetItemDetailsResponse } from '@/services/itemService';
import { Download, Info, ReceiptText } from 'lucide-react';
import { Button } from '../ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const AuctionEnded = ({
    itemData,
}: {
    id: string;
    itemData: GetItemDetailsResponse;
    triggerRefetch: () => void;
}) => {
    const { item } = itemData;
    const totalBids = item.bids.length;
    const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

    const { data: invoice, isError } = useGetItemInvoice(itemData.item._id, item.user?.isWinner ?? false);
    const { mutate: downloadInvoice, isPending: isDownloading } = useDownloadInvoice();

    const handleDownloadInvoice = () => {
        if (invoice && invoice.data) {
            downloadInvoice(invoice.data._id);
        }
    };

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
                {!isError && invoice && invoice.data && (
                    <div className='flex gap-x-4'>
                        <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="flex gap-x-3">
                                    <ReceiptText className="w-5 h-5" />
                                    <p>View Invoice</p>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[100vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Invoice</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4">
                                    <iframe
                                        src={invoice.data.invoiceUrl}
                                        title="Invoice"
                                        width="100%"
                                        height="600px"
                                        className="border-0"
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                        
                        <Button
                            variant="default"
                            className="flex gap-x-3"
                            onClick={handleDownloadInvoice}
                            disabled={isDownloading}
                        >
                            <Download className='w-5 h-5' />
                            <p>{isDownloading ? 'Downloading...' : 'Download Invoice'}</p>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AuctionEnded;