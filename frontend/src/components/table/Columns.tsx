import { ColumnDef } from "@tanstack/react-table"
import CountDown from "../common/CountDown"
import ActionCell from "./ActionCell"

export type ItemData = {
    _id: string
    name: string
    image: string
    startingPrice: number
    currentPrice: number
    auctionEndTime: string
}

export const columns: ColumnDef<ItemData>[] = [
    {
        accessorKey: "name",
        header: () => <div className="text-center">Name</div>,
        cell: ({ row }) => {
            return <div className="text-center">{row.getValue("name")}</div>
        },
        meta: {
            skipOnMobile: true
        }
    },
    {
        accessorKey: "image",
        header: () => <div className="text-center ">Image</div>,
        cell: ({ row }) => {
            return (
                <div className="flex justify-center items-center">
                    <img src={row.getValue("image")} alt="item-image" className="w-16 h-16 md:w-20 md:h-20 rounded-md object-cover" />
                </div>
            );
        },

    },
    {
        accessorKey: "startingPrice",
        header: () => <div className="text-center">Starting Price</div>,
        cell: ({ row }) => {
            return <div className="text-center">{row.getValue("startingPrice")}</div>
        },
        meta: {
            skipOnMobile: true,
        }
    },
    {
        accessorKey: "currentPrice",
        header: () => <div className="text-center">Current Price</div>,
        cell: ({ row }) => {
            return <div className="text-center">{row.getValue("currentPrice")}</div>
        },
    },
    {
        accessorKey: "auctionEndTime",
        header: () => <div className="text-center">Auction End In</div>,
        cell: ({ row }) => {
            const auctionEndTime = new Date(row.getValue("auctionEndTime"));

            return <div className="text-center">
                <CountDown endTime={auctionEndTime} />
            </div>
        },
    },
    {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row, table }) => <ActionCell row={row} table={table} />,

    },
]


