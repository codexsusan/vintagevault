import { Loader2 } from 'lucide-react';

const CustomLoading = ({ isLoading }: { isLoading: boolean }) => {
    return isLoading && (
        <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin w-6 h-6" />
        </div>
    );
}

export default CustomLoading;
