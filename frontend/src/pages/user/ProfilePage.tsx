import ItemBidList from "@/components/profile-page/ItemBidList";
import PersonalDetails from "@/components/profile-page/PersonalDetails";
import { useGetMe } from "@/hooks/userHooks";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
    const { data: userData, isLoading, isError } = useGetMe();

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">
            <Loader2 className="animate-spin w-6 h-6" />
        </div>;
    }

    if (isError || !userData) {
        return <div className="flex justify-center items-center h-screen">Error fetching user data</div>;
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-blue-600 text-amber-50 p-6 flex items-center space-x-4">
                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-amber-800 text-4xl font-bold">
                        {userData.data.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{userData.data.name}</h1>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <PersonalDetails user={userData} />
                    <ItemBidList />
                </div>
            </div>
        </div>
    )
}