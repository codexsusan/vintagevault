
import { useDeleteItem } from "@/hooks/itemHooks";
import { Row, Table } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { ItemData } from "./Columns";
import { useQueryClient } from "@tanstack/react-query";

export default function ActionCell({ row, table }: {
    row: Row<ItemData>, table: Table<ItemData>
}) {
    const data = row.original
    const queryClient = useQueryClient();

    const { mutate: deleteItem } = useDeleteItem();

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
                        deleteItem(data._id, {
                            onSuccess: () => {
                                toast.success("Item deleted successfully");
                                queryClient.invalidateQueries({
                                    queryKey: ["getItems", {
                                        page: table.getState().pagination.pageIndex + 1,
                                        limit: table.getState().pagination.pageSize
                                    }]
                                });
                            },
                            onError: (error) => {
                                toast.error(error.message);
                            }
                        });
                    }}
                >
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}