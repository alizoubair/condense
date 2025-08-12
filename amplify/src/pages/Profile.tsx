import { useState, useEffect } from 'react';
import {
    UserCircleIcon,
    PencilIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';
import { profileApi } from '../services/api';
import { UserProfile } from '../types';

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            const profile = await profileApi.getProfile();
            setProfileData(profile);
            setError(null);
        } catch (err) {
            console.error('Failed to load profile data:', err);
            setError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };



    const handleSave = async () => {
        if (!profileData) return;

        try {
            setSaving(true);
            const updatedProfile = await profileApi.updateProfile(profileData);
            setProfileData(updatedProfile);
            setIsEditing(false);
            setError(null);
        } catch (err) {
            console.error('Failed to save profile:', err);
            setError('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reload profile data to reset changes
        loadProfileData();
    };

    const handleInputChange = (field: string, value: string) => {
        if (!profileData) return;
        setProfileData(prev => prev ? { ...prev, [field]: value } : null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-600">Loading profile...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={loadProfileData} className="btn-primary">
                    Try Again
                </button>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No profile data found</p>
                <button onClick={loadProfileData} className="btn-primary">
                    Reload
                </button>
            </div>
        );
    }

    return (
        <div className="h-full">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage your profile information
                </p>
            </div>

            <div className="max-w-4xl">
                {/* Profile Information */}
                <div>
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                                >
                                    <PencilIcon className="h-4 w-4 mr-1" />
                                    Edit
                                </button>
                            ) : (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleCancel}
                                        className="btn-secondary text-sm"
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="btn-primary text-sm"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Profile Picture */}
                        <div className="flex items-center space-x-6 mb-6">
                            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserCircleIcon className="h-16 w-16 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {profileData.first_name} {profileData.last_name}
                                </h3>
                                <p className="text-gray-600">{profileData.role} {profileData.company && `at ${profileData.company}`}</p>
                                <p className="text-sm text-gray-500">{profileData.location}</p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.first_name}
                                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                                            className="input-field"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profileData.first_name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.last_name}
                                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                                            className="input-field"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profileData.last_name}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="input-field"
                                    />
                                ) : (
                                    <p className="text-gray-900">{profileData.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bio
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={profileData.bio}
                                        onChange={(e) => handleInputChange('bio', e.target.value)}
                                        rows={3}
                                        className="input-field"
                                    />
                                ) : (
                                    <p className="text-gray-900">{profileData.bio}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Company
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.company}
                                            onChange={(e) => handleInputChange('company', e.target.value)}
                                            className="input-field"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profileData.company}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.role}
                                            onChange={(e) => handleInputChange('role', e.target.value)}
                                            className="input-field"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{profileData.role}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profileData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        className="input-field"
                                    />
                                ) : (
                                    <p className="text-gray-900">{profileData.location}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Member Since
                                </label>
                                <div className="flex items-center text-gray-900">
                                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                    {new Date(profileData.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}