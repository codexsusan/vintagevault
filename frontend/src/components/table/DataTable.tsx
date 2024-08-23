import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink
} from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    pageCount: number
    pageIndex: number
    pageSize: number
    onPageChange: (page: number) => void
    refetch: () => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    pageIndex,
    pageSize,
    onPageChange,
    refetch,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: {
            pagination: {
                pageIndex: pageIndex - 1,
                pageSize,
            },
        },
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const newState = updater({ pageIndex: pageIndex - 1, pageSize });
                onPageChange(newState.pageIndex + 1);
            }
        },
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
        meta: { refetch },
    })

    const getPageRange = () => {
        const range = [];
        const totalPages = pageCount;
        const currentPage = pageIndex;
        const displayedPages = 5;

        let start = Math.max(1, currentPage - Math.floor(displayedPages / 2));
        let end = Math.min(totalPages, start + displayedPages - 1);

        if (end - start + 1 < displayedPages) {
            start = Math.max(1, end - displayedPages + 1);
        }

        for (let i = start; i <= end; i++) {
            range.push(i);
        }

        return range;
    };

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <Button
                                className="gap-1 pl-2.5"
                                variant={"ghost"}
                                size={"default"}
                                disabled={pageIndex === 1}
                                onClick={() => onPageChange(pageIndex - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span>Previous</span>
                            </Button>
                        </PaginationItem>

                        {getPageRange().map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    onClick={() => onPageChange(page)}
                                    isActive={page === pageIndex}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        {pageCount > getPageRange()[getPageRange().length - 1] && (
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                        )}

                        <PaginationItem>
                            <Button
                                className="gap-1 pl-2.5"
                                variant={"ghost"}
                                size={"default"}
                                disabled={pageIndex === pageCount}
                                onClick={() => onPageChange(pageIndex + 1)}
                            >
                                <span>Next</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}


