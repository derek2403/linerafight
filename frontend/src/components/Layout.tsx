import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="p-4 border-b border-gray-800">
                <h1 className="text-xl font-bold">Linera Fight</h1>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
