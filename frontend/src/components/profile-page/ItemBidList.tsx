import { useGetUserBiddingHistory } from "@/hooks/userHooks";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Bot, ChevronDown, ChevronRight, User } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import CustomLoading from "../common/CustomLoading";
import InvoiceColumn from "./InvoiceColumn";
import { UserBiddingHistoryQueryParams } from "@/services/userService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Bid {
    _id: string;
    amount: number;
    timestamp: string;
    isAutoBid: boolean;
}

export interface Invoice {
    _id: string;
    url: string;
}

export interface Item {
    _id: string;
    name: string;
    description: string;
    startingPrice: number;
    currentPrice: number;
    auctionEndTime: string;
    image: string;
    awarded: boolean;
    status: string;
    invoice: Invoice | null;
    bids: Bid[];
}

const ItemBidList = () => {
    const [status, setStatus] = useState<UserBiddingHistoryQueryParams["status"]>('all');
    const { data: userBiddingHistory, isLoading, isError, refetch } = useGetUserBiddingHistory({ status });
    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    const columnHelper = createColumnHelper<Item>()

    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            cell: info => info.getValue(),
            header: () => <span>Item Name</span>,
        }),
        columnHelper.accessor('currentPrice', {
            cell: info => `$${info.getValue()}`,
            header: () => <span>Current Price</span>,
        }),
        columnHelper.accessor('status', {
            cell: info => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${info.getValue() === 'won' ? 'bg-green-100 text-green-800' :
                        info.getValue() === 'lost' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                    }`}>
                    {info.getValue().charAt(0).toUpperCase() + info.getValue().slice(1)}
                </span>
            ),
            header: () => <span>Status</span>,
        }),
        columnHelper.accessor('auctionEndTime', {
            cell: info => new Date(info.getValue()).toLocaleString(),
            header: () => <span>Auction End Time</span>,
        }),
        columnHelper.accessor('invoice', {
            cell: info => <InvoiceColumn info={info} />,
            header: () => <span className="text-center block">Invoice</span>,
        }),
    ], [columnHelper])

    const table = useReactTable({
        data: userBiddingHistory?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const toggleRowExpansion = (rowId: string) => {
        setExpandedRows(prev =>
            prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
        );
    };

    const handleStatusChange = (value: string) => {
        console.log(`status: ${value}`);
        setStatus(value as UserBiddingHistoryQueryParams['status']);
        // refetch();
    };

    useEffect(() => {
        refetch();
    }, [status, refetch]);

    if (isError) {
        return <div className="flex justify-center items-center">Error fetching user data</div>;
    }

    return (
        <section className="md:flex-1">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-amber-900">Your Bidding History</h2>
                <Select onValueChange={handleStatusChange} value={status}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <CustomLoading isLoading={isLoading} />
                {!isLoading && userBiddingHistory && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300">
                            <thead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        <th className="py-2 px-4 border-b text-left bg-gray-100"></th>
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id} className="py-2 px-4 border-b text-left bg-gray-100">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map(row => (
                                    <React.Fragment key={row.id}>
                                        <tr
                                            className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                            onClick={() => toggleRowExpansion(row.id)}
                                        >
                                            <td className="py-2 px-4 border-b">
                                                {expandedRows.includes(row.id) ? (
                                                    <ChevronDown className="text-gray-500" size={20} />
                                                ) : (
                                                    <ChevronRight className="text-gray-500" size={20} />
                                                )}
                                            </td>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className="py-2 px-4 border-b">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                        {expandedRows.includes(row.id) && (
                                            <tr>
                                                <td colSpan={columns.length + 1} className="p-0 border-b bg-gray-50">
                                                    <div className="px-4 py-2">
                                                        <h4 className="font-semibold mb-2 text-lg text-amber-900">Your Bids</h4>
                                                        <ul className="space-y-2">
                                                            {row.original.bids.map((bid: Bid) => (
                                                                <li key={bid._id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                                                                    <div className="flex items-center space-x-2">
                                                                        {bid.isAutoBid ? (
                                                                            <Bot className="text-blue-500" size={20} />
                                                                        ) : (
                                                                            <User className="text-green-500" size={20} />
                                                                        )}
                                                                        <span className={`font-medium ${bid.isAutoBid ? 'text-blue-600' : 'text-green-600'}`}>
                                                                            ${bid.amount.toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-sm text-gray-600">
                                                                        {new Date(bid.timestamp).toLocaleString()}
                                                                    </span>
                                                                    <span className={`text-xs px-2 py-1 rounded-full ${bid.isAutoBid
                                                                            ? 'bg-blue-100 text-blue-800'
                                                                            : 'bg-green-100 text-green-800'
                                                                        }`}>
                                                                        {bid.isAutoBid ? 'Auto Bid' : 'Manual Bid'}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {!isLoading && (!userBiddingHistory || userBiddingHistory.data.length === 0) && (
                    <p className="text-center text-gray-500 py-4 border">No bidding history available.</p>
                )}
            </div>
        </section>
    )
}

export default ItemBidList