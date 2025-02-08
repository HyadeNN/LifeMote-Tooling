import React, { useState, useEffect } from 'react';
import { serviceApi } from '../services/api';
import { Alert } from './Alert';
import { DeploymentModal } from './Modal/DeploymentModal';
import { ServiceModal } from './Modal/ServiceModal';
import { Plus } from 'lucide-react';

export const ServicesList = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const response = await serviceApi.getAllServices();
            setServices(response.data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeploy = async (version) => {
        try {
            await serviceApi.createDeployment(selectedService.id, { version });
            await loadServices(); // Servisleri yenile
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddService = async (serviceData) => {
        try {
            await serviceApi.createService(serviceData);
            await loadServices(); // Servisleri yenile
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const openDeployModal = (service) => {
        setSelectedService(service);
        setIsDeployModalOpen(true);
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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Services</h2>
                <button 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                    onClick={() => setIsServiceModalOpen(true)}
                >
                    <Plus size={20} className="mr-2" />
                    Add Service
                </button>
            </div>

            {error && (
                <Alert 
                    type="error" 
                    message={error}
                    onClose={() => setError(null)}
                />
            )}

<div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left">Name</th>
                            <th className="py-3 px-4 text-left">URL</th>
                            <th className="py-3 px-4 text-left">Version</th>
                            <th className="py-3 px-4 text-left">DB Schema</th>
                            <th className="py-3 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500">
                                    No services found. Add a service to get started.
                                </td>
                            </tr>
                        ) : (
                            services.map((service) => (
                                <tr key={service.id} className="border-t hover:bg-gray-50">
                                    <td className="py-3 px-4">{service.name}</td>
                                    <td className="py-3 px-4">{service.url}</td>
                                    <td className="py-3 px-4">{service.current_version || 'N/A'}</td>
                                    <td className="py-3 px-4">{service.schema || service.database_schema || 'N/A'}</td>
                                    <td className="py-3 px-4">
                                        <button 
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                            onClick={() => openDeployModal(service)}
                                        >
                                            Deploy
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Deployment Modal */}
            <DeploymentModal 
                isOpen={isDeployModalOpen}
                onClose={() => setIsDeployModalOpen(false)}
                onDeploy={handleDeploy}
                currentVersion={selectedService?.current_version}
            />

            {/* Service Modal */}
            <ServiceModal 
                isOpen={isServiceModalOpen}
                onClose={() => setIsServiceModalOpen(false)}
                onAdd={handleAddService}
            />
        </div>
    );
};