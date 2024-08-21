import { useGetItems } from "@/hooks/itemHooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { QueryParams } from "@/services/itemService";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useDebounce from "@/hooks/useDebounce";
import { Link } from "react-router-dom";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

function Home() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('price');
    const [sortOrder, setSortOrder] = useState<QueryParams['sortOrder']>('asc');

    const debouncedSearch = useDebounce(search, 500);

    const { data, isLoading, isError } = useGetItems({ page, limit, search: debouncedSearch, sortBy, sortOrder });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleSort = (value: string) => {
        setSortBy('price');
        setSortOrder(value as QueryParams['sortOrder']);
        setPage(1);
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (isError) return <div className="flex justify-center items-center h-screen">Error fetching items</div>;

    const totalPages = data?.totalPages || 1;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8">Auction Items</h1>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <Input
                    type="text"
                    placeholder="Search by name or description..."
                    value={search}
                    onChange={handleSearch}
                    className="flex-grow"
                />
                <Select onValueChange={handleSort} value={sortOrder}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Sort by Price" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="asc">Price: Low to High</SelectItem>
                        <SelectItem value="desc">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data?.items.map((item) => (
                    <Card key={item._id} className="flex flex-col h-full">
                        <CardHeader className="p-4 flex-grow-0">
                            <div className="w-full h-48 relative overflow-hidden rounded-lg">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardTitle className="text-lg mb-2 line-clamp-2">{item.name}</CardTitle>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-3">{item.description}</p>
                            <p className="text-xl font-bold">${item.currentPrice.toFixed(2)}</p>
                        </CardContent>
                        <CardFooter className="mt-auto pt-4">
                            <Link to={`/item/${item._id}`} className="w-full">
                                <Button className="w-full">Bid Now</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {data && totalPages > 1 && (
                <Pagination className="mt-8">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                className={page === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            if (
                                pageNumber === 1 ||
                                pageNumber === totalPages ||
                                (pageNumber >= page - 1 && pageNumber <= page + 1)
                            ) {
                                return (
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink
                                            href="#"
                                            onClick={() => setPage(pageNumber)}
                                            isActive={page === pageNumber}
                                        >
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            } else if (
                                pageNumber === page - 2 ||
                                pageNumber === page + 2
                            ) {
                                return <PaginationEllipsis key={pageNumber} />;
                            }
                            return null;
                        })}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}

export default Home;