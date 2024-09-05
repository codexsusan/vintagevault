import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { useGetItemBids } from "@/hooks/itemHooks";



const BiddingHistoryTable = ({ id }: { id: string }) => {

    const { data, isLoading, isError } = useGetItemBids(id);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (isError || !data) {
        return <div className="flex justify-center items-center h-screen">Error fetching item details</div>;
    }

    const bids = data.data;

    return (
        <div>
            <h3 className='text-xl font-semibold'>Bidding History</h3>
            <div className='flex flex-col gap-y-4 mt-2'>

                <Table>
                    <TableCaption>A list of bid for this item</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Full Name</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Autobid</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bids.map((bid) => (
                            <TableRow key={bid._id}>
                                <TableCell className="font-medium min-w-max w-2/6">{bid.user.name}</TableCell>
                                <TableCell className="w-1/6">{new Date(bid.timestamp).toLocaleString().split(",")[0]}</TableCell>
                                <TableCell className="w-1/6">{new Date(bid.timestamp).toLocaleString().split(",")[1]}</TableCell>
                                <TableCell className="w-1/6">{bid.isAutoBid ? "Yes" : "No"}</TableCell>
                                <TableCell className="w-1/6 text-right">{bid.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        {
                            bids.length === 0 &&
                            <TableRow>
                                <TableCell colSpan={5} className="h-20 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default BiddingHistoryTable
