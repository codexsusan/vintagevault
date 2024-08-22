import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface AutoBidDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfigureAutoBid: (maxBidAmount: number, alertPercentage: number) => void;
}

function AutoBidDialog({ isOpen, onClose, onConfigureAutoBid }: AutoBidDialogProps) {
    const [maxBidAmount, setMaxBidAmount] = useState('');
    const [alertPercentage, setAlertPercentage] = useState('');

    const handleSubmit = () => {
        onConfigureAutoBid(parseFloat(maxBidAmount), parseFloat(alertPercentage));
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configure Auto-Bid</DialogTitle>
                    <DialogDescription>
                        Set up your auto-bid parameters for this item.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input
                        type="number"
                        value={maxBidAmount}
                        onChange={(e) => setMaxBidAmount(e.target.value)}
                        placeholder="Maximum Bid Amount"
                    />
                    <Input
                        type="number"
                        value={alertPercentage}
                        onChange={(e) => setAlertPercentage(e.target.value)}
                        placeholder="Alert Percentage (0-100)"
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Configure Auto-Bid</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default AutoBidDialog;