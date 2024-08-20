import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    useDocumentTitle("Dashboard");

    const navigate = useNavigate();

    const handleNewNavigate = () => {
        navigate("/admin/new");
    };
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-blue-800">Items</h3>
                <Button onClick={handleNewNavigate} className="flex gap-x-2">
                    <p>Create New</p>
                </Button>
            </div>
        </div>
    );
}

export default Dashboard
