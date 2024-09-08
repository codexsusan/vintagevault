import { useDownloadInvoice } from '@/hooks/invoiceHooks';
import { CellContext } from '@tanstack/react-table';
import { Download, Eye, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Invoice, Item } from './ItemBidList';

const InvoiceColumn = ({ info }: { info: CellContext<Item, Invoice | null> }) => {
    const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
    const { mutate: downloadInvoice, isPending: isDownloading } = useDownloadInvoice();

    const handleDownloadInvoice = () => {
        if (item.invoice) {
            downloadInvoice(item.invoice._id);
        }
    };

    const item = info.row.original;
    return item.status === 'won' && item.invoice ? (
        <div className="flex justify-center space-x-2">
            <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Preview Invoice"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[100vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Invoice</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <iframe
                            src={item.invoice.url!}
                            title="Invoice"
                            width="100%"
                            height="600px"
                            className="border-0"
                        />
                    </div>
                </DialogContent>
            </Dialog>
            <Button
                variant="ghost"
                size="icon"
                title="Download Invoice"
                onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadInvoice();
                }}
                disabled={isDownloading}
            >
                {isDownloading ? <Loader2 className="animate-spin h-4 w-4" /> : <Download className="h-4 w-4" />}
                {/* <Download className="h-4 w-4" /> */}
            </Button>
        </div>
    ) : null;
}

export default InvoiceColumn
