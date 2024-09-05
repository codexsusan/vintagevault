import { columns } from "@/components/table/Columns";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { useGetItems } from "@/hooks/itemHooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    useDocumentTitle("Dashboard");
    const [pageIndex, setPageIndex] = useState(1);
    const pageSize = 10;

    const { data, isLoading } = useGetItems({ page: pageIndex, limit: pageSize });

    const navigate = useNavigate();

    const handleNewNavigate = () => {
        navigate("/admin/item/new");
    };

    const pageCount = isLoading ? 0 : Math.ceil(data!.total / pageSize);
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-blue-800">Items</h3>
                <Button onClick={handleNewNavigate} className="flex gap-x-2">
                    <p>Create New</p>
                </Button>
            </div>
            <div className="h-10 w-full mt-10 mx-auto">
                {
                    isLoading ?
                        <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin" />
                        </div>
                        : <DataTable
                            columns={columns}
                            data={data!.items}
                            pageCount={pageCount}
                            pageIndex={pageIndex}
                            pageSize={pageSize}
                            onPageChange={setPageIndex}
                        />
                }
            </div>
        </div>
    );
}

export default Dashboard
