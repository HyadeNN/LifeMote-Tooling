import React, { useState } from 'react';
import { Modal } from './Modal';

const RESPONSE_FORMATS = [
    { id: 'auto', name: 'Auto Detect' },
    { id: 'standard', name: 'Standard Format' },
    { id: 'lifemote', name: 'Lifemote Format' },
    { id: 'simple', name: 'Simple Version Format' },
    { id: 'detailed', name: 'Detailed Format' },
    { id: 'legacy', name: 'Legacy Format' }
];

export const ServiceModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        healthEndpoint: '/api/health/info',
        responseFormat: 'auto'
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Service name is required';
        }
        
        if (!formData.url.trim()) {
            newErrors.url = 'URL is required';
        } else {
            try {
                new URL(formData.url);
            } catch {
                newErrors.url = 'Invalid URL format';
            }
        }

        if (!formData.healthEndpoint.trim()) {
            newErrors.healthEndpoint = 'Health endpoint is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            // Clean up URL and endpoint
            const baseUrl = formData.url.endsWith('/') 
                ? formData.url.slice(0, -1) 
                : formData.url;
            const endpoint = formData.healthEndpoint.startsWith('/') 
                ? formData.healthEndpoint 
                : `/${formData.healthEndpoint}`;
            
            onAdd({
                name: formData.name,
                url: baseUrl,
                healthEndpoint: endpoint,
                response_format: formData.responseFormat
            });
            onClose();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Service">
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Service Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="My Service"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                        Service Base URL
                    </label>
                    <input
                        type="url"
                        id="url"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.url ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="http://localhost:5000"
                    />
                    {errors.url && (
                        <p className="mt-1 text-sm text-red-500">{errors.url}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="healthEndpoint" className="block text-sm font-medium text-gray-700 mb-1">
                        Health Check Endpoint
                    </label>
                    <input
                        type="text"
                        id="healthEndpoint"
                        name="healthEndpoint"
                        value={formData.healthEndpoint}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.healthEndpoint ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="/api/health/info"
                    />
                    {errors.healthEndpoint && (
                        <p className="mt-1 text-sm text-red-500">{errors.healthEndpoint}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="responseFormat" className="block text-sm font-medium text-gray-700 mb-1">
                        Response Format
                    </label>
                    <select
                        id="responseFormat"
                        name="responseFormat"
                        value={formData.responseFormat}
                        onChange={handleChange}
                        className="w-full p-2 border rounded border-gray-300"
                    >
                        {RESPONSE_FORMATS.map(format => (
                            <option key={format.id} value={format.id}>
                                {format.name}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                        Select the response format that matches your service's health endpoint
                    </p>
                </div>

                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add Service
                    </button>
                </div>
            </div>
        </Modal>
    );
};