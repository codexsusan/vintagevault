import { columns } from "@/components/table/Columns";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { useGetItems } from "@/hooks/itemHooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useNavigate } from "react-router-dom";


function Dashboard() {
    useDocumentTitle("Dashboard");

    const { data, isLoading } = useGetItems({ page: 1, limit: 10 });

    // const data = getData();

    const navigate = useNavigate();

    const handleNewNavigate = () => {
        navigate("/admin/item/new");
    };
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-blue-800">Items</h3>
                <Button onClick={handleNewNavigate} className="flex gap-x-2">
                    <p>Create New</p>
                </Button>
            </div>
            <div className="h-10 w-full mt-10 mx-auto">
                {isLoading ? <p>Loading...</p> : <DataTable columns={columns} data={data!.items} />}
            </div>
        </div>
    );
}

export default Dashboard
