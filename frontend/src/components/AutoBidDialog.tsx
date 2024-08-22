import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useConfigureAutoBid } from "@/hooks/autoBidHooks";
import { GetAutoBidConfigResponse } from "@/services/autoBidService";

const autoBidFormSchema = z.object({
    maxBidAmount: z.number().min(0.01, "Maximum bid amount must be greater than 0"),
    bidAlertPercentage: z.number().min(1, "Percentage must be between 1 and 100").max(100, "Percentage must be between 1 and 100"),
});

type AutoBidFormValues = z.infer<typeof autoBidFormSchema>;

interface AutoBidDialogProps {
    data: GetAutoBidConfigResponse["data"] | undefined;
    isOpen: boolean;
    onClose: () => void;
    itemId: string;
    children?: React.ReactNode;

}

export function AutoBidDialog({ data, isOpen, onClose, itemId, children }: AutoBidDialogProps) {
    const { mutate: configureAutoBid, isPending } = useConfigureAutoBid();
    const form = useForm<AutoBidFormValues>({
        resolver: zodResolver(autoBidFormSchema),
        defaultValues: {
            maxBidAmount: data?.maxBidAmount || 0,
            bidAlertPercentage: data?.bidAlertPercentage || 0,
        },
    });

    function onSubmit(data: AutoBidFormValues, event: React.FormEvent) {
        event.preventDefault();
        configureAutoBid({
            ...data,
            itemId: itemId
        }, {
            onSuccess: () => {
                toast.success("Auto-bid configured successfully!");
                onClose();
            },
            onError: (error: Error) => {
                toast.error(error.message);
            },
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="font-inter">
                <DialogHeader>
                    <DialogTitle>Configure Auto-Bid</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Set up your auto-bid parameters for this item.
                </DialogDescription>
                <Form {...form}>
                    <form onSubmit={(event) => form.handleSubmit((data) => onSubmit(data, event))(event)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="maxBidAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Maximum Bid Amount</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bidAlertPercentage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bid Alert Percentage</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={isPending}
                            >Configure Auto-Bid</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}