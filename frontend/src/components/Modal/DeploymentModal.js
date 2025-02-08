import React, { useState } from 'react';
import { Modal } from './Modal';

export const DeploymentModal = ({ isOpen, onClose, onDeploy, currentVersion = '1.0.0' }) => {
    const [versionType, setVersionType] = useState('patch');
    const [customVersion, setCustomVersion] = useState('');
    const [isCustom, setIsCustom] = useState(false);

    const parseVersion = (version) => {
        // Check if it's a pre-release version
        const preReleaseMatch = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/);
        if (!preReleaseMatch) return null;

        const [, major, minor, patch, preRelease] = preReleaseMatch;
        return {
            major: parseInt(major),
            minor: parseInt(minor),
            patch: parseInt(patch),
            preRelease
        };
    };

    const calculateNewVersion = () => {
        if (isCustom) return customVersion;

        const parsed = parseVersion(currentVersion);
        if (!parsed) return currentVersion;

        const { major, minor, patch, preRelease } = parsed;

        // If it's a pre-release version and not using custom version,
        // remove pre-release tag and use the base version
        let newVersion;
        switch (versionType) {
            case 'major':
                newVersion = `${major + 1}.0.0`;
                break;
            case 'minor':
                newVersion = `${major}.${minor + 1}.0`;
                break;
            case 'patch':
                newVersion = `${major}.${minor}.${patch + 1}`;
                break;
            default:
                newVersion = currentVersion;
        }

        return newVersion;
    };

    const handleDeploy = () => {
        const newVersion = calculateNewVersion();
        if (newVersion === currentVersion) {
            window.showToast?.({
                type: 'error',
                message: 'New version must be different from current version'
            });
            return;
        }
        onDeploy(newVersion);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Deploy New Version">
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-gray-600 mb-2">Current Version: {currentVersion}</p>
                    <p className="text-sm text-gray-600 mb-4">New Version: {calculateNewVersion()}</p>
                </div>

                {!isCustom && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Version Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                className={`p-2 text-sm rounded ${versionType === 'major' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                onClick={() => setVersionType('major')}
                            >
                                Major
                            </button>
                            <button
                                className={`p-2 text-sm rounded ${versionType === 'minor' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                onClick={() => setVersionType('minor')}
                            >
                                Minor
                            </button>
                            <button
                                className={`p-2 text-sm rounded ${versionType === 'patch' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                onClick={() => setVersionType('patch')}
                            >
                                Patch
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="customVersion"
                        checked={isCustom}
                        onChange={(e) => setIsCustom(e.target.checked)}
                        className="mr-2"
                    />
                    <label htmlFor="customVersion" className="text-sm text-gray-700">Custom Version</label>
                </div>

                {isCustom && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Version Number</label>
                        <input
                            type="text"
                            value={customVersion}
                            onChange={(e) => setCustomVersion(e.target.value)}
                            placeholder="x.y.z"
                            className="w-full p-2 border rounded"
                        />
                    </div>
                )}

                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeploy}
                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Deploy
                    </button>
                </div>
            </div>
        </Modal>
    );
};