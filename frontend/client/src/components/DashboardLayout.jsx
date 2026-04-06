import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
    return (
        <div className="flex bg-gray-50/50 min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto max-h-screen p-16">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
