import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Link } from "react-router-dom"
import CountDown from "../common/CountDown"
import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"

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
        cell: ({ row }) => {
            const data = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <Link to={`/admin/item/update/${data._id}`}>
                            <DropdownMenuItem className="hover:cursor-pointer" >
                                Edit
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="hover:cursor-pointer"
                            onClick={() => {
                                // TODO: Delete
                                console.log("Delete");
                                console.log(data);
                            }}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]