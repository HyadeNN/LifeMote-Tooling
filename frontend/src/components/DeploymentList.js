import React, { useState, useEffect, useCallback } from 'react';
import { serviceApi } from '../services/api';
import { Alert } from './Alert';
import { Filter, RefreshCw } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

const AUTO_REFRESH_INTERVAL = 120000; // 2 minutes
const POLLING_INTERVAL = 2000; // 2 seconds
const POLLING_TIMEOUT = 60000; // 1 minute

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800'
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || styles.pending}`}>
            {status?.replace('_', ' ').toUpperCase()}
        </span>
    );
};

export const DeploymentList = () => {
    const [deployments, setDeployments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [services, setServices] = useState([]);
    const [filters, setFilters] = useState({
        service: 'all',
        status: 'all'
    });
    const [pollingDeployments, setPollingDeployments] = useState(new Set());
    const { isConnected, addMessageListener } = useWebSocket('ws://localhost:8000/ws');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const servicesResponse = await serviceApi.getAllServices();
            setServices(servicesResponse.data);

            const deploymentsPromises = servicesResponse.data.map(service =>
                serviceApi.getServiceDeployments(service.id)
            );

            const deploymentsResponses = await Promise.all(deploymentsPromises);
            const allDeployments = deploymentsResponses.flatMap((response, index) =>
                response.data.map(deployment => ({
                    ...deployment,
                    service_name: servicesResponse.data[index].name
                }))
            );

            allDeployments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setDeployments(allDeployments);
            setError(null);
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const pollDeployment = useCallback(async (deploymentId) => {
        if (!pollingDeployments.has(deploymentId)) return null;

        try {
            const response = await serviceApi.getDeploymentStatus(deploymentId);
            console.log(`Polling deployment ${deploymentId}:`, response.data);

            if (response.data.status !== 'in_progress') {
                setPollingDeployments(prev => {
                    const next = new Set(prev);
                    next.delete(deploymentId);
                    return next;
                });
                await loadData();
                return response.data.status;
            }
            return 'in_progress';
        } catch (error) {
            console.error(`Error polling deployment ${deploymentId}:`, error);
            setPollingDeployments(prev => {
                const next = new Set(prev);
                next.delete(deploymentId);
                return next;
            });
            return 'error';
        }
    }, [pollingDeployments, loadData]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Auto refresh
    useEffect(() => {
        const intervalId = setInterval(() => {
            loadData();
        }, AUTO_REFRESH_INTERVAL);

        return () => clearInterval(intervalId);
    }, [loadData]);

    // WebSocket handler
    useEffect(() => {
        const handleDeploymentUpdate = async (data) => {
            console.log('WebSocket message received:', data);

            if (data.type === 'deployment_started') {
                setPollingDeployments(prev => new Set([...prev, data.deployment_id]));
                
                const startTime = Date.now();
                const pollInterval = setInterval(async () => {
                    if (Date.now() - startTime >= POLLING_TIMEOUT) {
                        clearInterval(pollInterval);
                        setPollingDeployments(prev => {
                            const next = new Set(prev);
                            next.delete(data.deployment_id);
                            return next;
                        });
                        await loadData();
                        return;
                    }

                    const status = await pollDeployment(data.deployment_id);
                    if (status && status !== 'in_progress') {
                        clearInterval(pollInterval);
                    }
                }, POLLING_INTERVAL);

            } else if (data.type === 'deployment_completed' || data.type === 'deployment_update') {
                await loadData();
            }
        };

        addMessageListener(handleDeploymentUpdate);
    }, [addMessageListener, loadData, pollDeployment]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const filterDeployments = () => {
        return deployments.filter(deployment => {
            if (filters.service !== 'all' && deployment.service_id !== parseInt(filters.service)) {
                return false;
            }
            if (filters.status !== 'all' && deployment.status !== filters.status) {
                return false;
            }
            return true;
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    const LiveUpdatesBadge = () => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
            <span className={`w-1 h-1 rounded-full mr-1 ${
                isConnected ? 'bg-green-500' : 'bg-gray-500'
            }`} />
            {isConnected ? 'Live' : 'Disconnected'}
        </span>
    );

    const filteredDeployments = filterDeployments();

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold">Deployments</h2>
                    <LiveUpdatesBadge />
                </div>
                <button 
                    onClick={loadData}
                    className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"
                    title="Refresh"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {error && (
                <Alert 
                    type="error" 
                    message={error}
                    onClose={() => setError(null)}
                />
            )}

            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-4 border-b">
                    <div className="flex items-center space-x-4">
                        <Filter size={20} className="text-gray-400" />
                        <select
                            className="border p-2 rounded"
                            value={filters.service}
                            onChange={(e) => handleFilterChange('service', e.target.value)}
                        >
                            <option value="all">All Services</option>
                            {services.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </select>

                        <select
                            className="border p-2 rounded"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left">Service</th>
                                <th className="py-3 px-4 text-left">Version</th>
                                <th className="py-3 px-4 text-left">Status</th>
                                <th className="py-3 px-4 text-left">Started</th>
                                <th className="py-3 px-4 text-left">Completed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDeployments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-gray-500">
                                        No deployments found.
                                    </td>
                                </tr>
                            ) : (
                                filteredDeployments.map((deployment) => (
                                    <tr key={deployment.id} className="border-t hover:bg-gray-50">
                                        <td className="py-3 px-4">{deployment.service_name}</td>
                                        <td className="py-3 px-4">{deployment.version}</td>
                                        <td className="py-3 px-4">
                                            <StatusBadge status={deployment.status} />
                                        </td>
                                        <td className="py-3 px-4">{formatDate(deployment.created_at)}</td>
                                        <td className="py-3 px-4">
                                            {deployment.completed_at ? formatDate(deployment.completed_at) : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};