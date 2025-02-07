import React, { useState } from 'react';
import { Modal } from './Modal';

export const ServiceModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        url: ''
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onAdd(formData);
            onClose();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
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
                        Service URL
                    </label>
                    <input
                        type="url"
                        id="url"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.url ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="http://example.com"
                    />
                    {errors.url && (
                        <p className="mt-1 text-sm text-red-500">{errors.url}</p>
                    )}
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