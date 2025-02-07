import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast/Toast';
import { ServicesList } from './components/ServicesList';
import { DeploymentList } from './components/DeploymentList';
import { StatusPage } from './components/StatusPage';
import { PageLoader } from './components/Loading';
import { Layers, Server, GitBranch } from 'lucide-react';
import ErrorService from './services/errorService';

const Sidebar = ({ activeTab, setActiveTab }) => (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Lifemote Tooling
            </h1>
            <ThemeToggle />
        </div>
        <nav className="p-4">
            <button 
                onClick={() => setActiveTab('services')} 
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded mb-2 ${
                    activeTab === 'services' 
                        ? 'bg-primary-500 text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
                <Server size={20} />
                <span>Services</span>
            </button>
            <button 
                onClick={() => setActiveTab('deployments')} 
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded mb-2 ${
                    activeTab === 'deployments' 
                        ? 'bg-primary-500 text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
                <GitBranch size={20} />
                <span>Deployments</span>
            </button>
            <button 
                onClick={() => setActiveTab('status')} 
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded ${
                    activeTab === 'status' 
                        ? 'bg-primary-500 text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
                <Layers size={20} />
                <span>Status</span>
            </button>
        </nav>
    </div>
);

function App() {
    useEffect(() => {
        ErrorService.init();
    }, []);

    const [activeTab, setActiveTab] = useState('services');
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        // Loading simülasyonu (1sn)
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <ErrorBoundary>
            <ThemeProvider>
                <ToastProvider>
                    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                        
                        {/* Main Content */}
                        <main className="flex-1 overflow-auto">
                            <div className="container mx-auto px-4 py-8">
                                {activeTab === 'services' && <ServicesList />}
                                {activeTab === 'deployments' && <DeploymentList />}
                                {activeTab === 'status' && <StatusPage />}
                            </div>
                        </main>
                    </div>
                </ToastProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;