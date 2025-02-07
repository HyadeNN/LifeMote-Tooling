import React, { useState, useEffect } from 'react';
import { Activity, Database, Server, CloudOff } from 'lucide-react';
import { serviceApi } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

const StatusCard = ({ title, status, details, icon: Icon, lastChecked }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'operational':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'degraded':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'down':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className={`border rounded-lg p-4 ${getStatusColor(status)}`}>
            <div className="flex items-center space-x-3 mb-2">
                <Icon size={24} />
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <div className="space-y-2">
                <div className="text-sm">
                    Status: <span className="font-semibold capitalize">{status}</span>
                </div>
                {details && (
                    <div className="text-sm">{details}</div>
                )}
                {lastChecked && (
                    <div className="text-xs opacity-75">
                        Last checked: {new Date(lastChecked).toLocaleString()}
                    </div>
                )}
            </div>
        </div>
    );
};

const MetricsCard = ({ title, value, unit, change, icon: Icon }) => {
    const getChangeColor = (change) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    return (
        <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
                <Icon size={20} className="text-gray-500" />
                <h3 className="text-sm text-gray-600">{title}</h3>
            </div>
            <div className="flex items-baseline space-x-2">
                <div className="text-2xl font-bold">{value}</div>
                {unit && <div className="text-gray-500">{unit}</div>}
                {change !== undefined && (
                    <div className={`text-sm ${getChangeColor(change)}`}>
                        {change > 0 ? '+' : ''}{change}%
                    </div>
                )}
            </div>
        </div>
    );
};

export const StatusPage = () => {
    const [services, setServices] = useState([]);
    const [systemStatus, setSystemStatus] = useState({
        database: { status: 'checking', lastChecked: null },
        redis: { status: 'checking', lastChecked: null },
        api: { status: 'checking', lastChecked: null }
    });
    const [metrics, setMetrics] = useState({
        totalServices: 0,
        activeDeployments: 0,
        successRate: 0,
        averageDeployTime: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isConnected, error: wsError, addMessageListener } = useWebSocket('ws://localhost:8000/ws');

    const loadStatus = async () => {
        try {
            setLoading(true);

            // Load services
            const servicesResponse = await serviceApi.getAllServices();
            setServices(servicesResponse.data);

            // Simulated system status checks
            // In real application, these would be actual health check endpoints
            setSystemStatus({
                database: { 
                    status: 'operational', 
                    lastChecked: new Date().toISOString(),
                    details: 'Response time: 45ms'
                },
                redis: { 
                    status: 'operational', 
                    lastChecked: new Date().toISOString(),
                    details: 'Memory usage: 42%'
                },
                api: { 
                    status: 'operational', 
                    lastChecked: new Date().toISOString(),
                    details: '99.9% uptime last 24h'
                }
            });

            // Calculate metrics
            // In real application, these would come from the backend
            setMetrics({
                totalServices: servicesResponse.data.length,
                activeDeployments: 3,
                successRate: 98.5,
                averageDeployTime: 245
            });

            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        addMessageListener((data) => {
            switch (data.type) {
                case 'service_status_update':
                    setSystemStatus(prev => ({
                        ...prev,
                        [data.service]: {
                            status: data.status,
                            lastChecked: new Date().toISOString(),
                            details: data.details
                        }
                    }));
                    break;
                case 'deployment_update':
                    loadStatus();
                    break;
                case 'metrics_update':
                    setMetrics(prev => ({
                        ...prev,
                        ...data.metrics
                    }));
                    break;
                default:
                    break;
            }
        });
    }, [addMessageListener]);

    useEffect(() => {

        loadStatus();
        const interval = setInterval(loadStatus, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (wsError) {
            setError('WebSocket connection error: ' + wsError);
        }
    }, [wsError]);

    const ConnectionStatus = () => (
        <div className="flex items-center space-x-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
                {isConnected ? 'Live Updates Connected' : 'Live Updates Disconnected'}
            </span>
        </div>
    );
    

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">System Status</h2>
                <ConnectionStatus />
            </div>

            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatusCard 
                    title="Database"
                    status={systemStatus.database.status}
                    details={systemStatus.database.details}
                    icon={Database}
                    lastChecked={systemStatus.database.lastChecked}
                />
                <StatusCard 
                    title="Redis"
                    status={systemStatus.redis.status}
                    details={systemStatus.redis.details}
                    icon={Server}
                    lastChecked={systemStatus.redis.lastChecked}
                />
                <StatusCard 
                    title="API"
                    status={systemStatus.api.status}
                    details={systemStatus.api.details}
                    icon={Activity}
                    lastChecked={systemStatus.api.lastChecked}
                />
            </div>

            {/* Metrics */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricsCard 
                        title="Total Services"
                        value={metrics.totalServices}
                        icon={Server}
                    />
                    <MetricsCard 
                        title="Active Deployments"
                        value={metrics.activeDeployments}
                        icon={Activity}
                    />
                    <MetricsCard 
                        title="Success Rate"
                        value={metrics.successRate}
                        unit="%"
                        change={0.5}
                        icon={Activity}
                    />
                    <MetricsCard 
                        title="Avg Deploy Time"
                        value={metrics.averageDeployTime}
                        unit="sec"
                        icon={Activity}
                    />
                </div>
            </div>

            {/* Service Status */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Service Status</h3>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left">Service</th>
                                <th className="py-3 px-4 text-left">Status</th>
                                <th className="py-3 px-4 text-left">Version</th>
                                <th className="py-3 px-4 text-left">Last Deployment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                <tr key={service.id} className="border-t">
                                    <td className="py-3 px-4">{service.name}</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                            Healthy
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">{service.current_version}</td>
                                    <td className="py-3 px-4">
                                        {service.last_deployment_at ? 
                                            new Date(service.last_deployment_at).toLocaleString() : 
                                            'Never'
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};