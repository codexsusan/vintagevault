import { Dialog, DialogContent } from '@radix-ui/react-dialog'
import React from 'react'
import { DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'

interface InvoicePreviewDialogProps {
    isInvoiceDialogOpen: boolean;
    setIsInvoiceDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    invoiceUrl: string;
    children: React.ReactNode;
}


const InvoicePreviewDialog = (
    { isInvoiceDialogOpen, setIsInvoiceDialogOpen, invoiceUrl, children }:
        InvoicePreviewDialogProps) => {
    return (
        <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Invoice</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <iframe
                        src={invoiceUrl}
                        title="Invoice"
                        width="100%"
                        height="600px"
                        className="border-0"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default InvoicePreviewDialog
