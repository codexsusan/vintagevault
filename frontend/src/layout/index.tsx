import { Outlet } from "react-router-dom";

const DefaultLayout = () => {

    return (
        <>
            <main>
                <div className="font-inter">
                    <Outlet />
                </div>
            </main>
        </>
    );
};

export default DefaultLayout;