'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { approveSignupRequest, rejectSignupRequest, updateUserApproval, updateUserRole } from '@/lib/adminActions';

interface SignupRequest {
  id: number;
  email: string;
  name: string;
  image: string | null;
  provider: string;
  status: string;
  createdAt: Date;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  role: string;
  approved: boolean;
  provider: string;
  createdAt: Date;
}

interface ApprovalsPageProps {
  signupRequests: SignupRequest[];
  users: User[];
}

export default function ApprovalsPage({ signupRequests, users }: ApprovalsPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async (id: number) => {
    if (!confirm('Approve this signup request?')) return;
    
    setIsLoading(true);
    try {
      const result = await approveSignupRequest(id);
      if (result.success) {
        alert('User approved successfully!');
        router.refresh();
      } else {
        alert('Failed to approve: ' + result.error);
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Reject this signup request?')) return;
    
    setIsLoading(true);
    try {
      const result = await rejectSignupRequest(id);
      if (result.success) {
        alert('Request rejected');
        router.refresh();
      } else {
        alert('Failed to reject: ' + result.error);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    setIsLoading(true);
    try {
      const result = await updateUserApproval(id, !currentStatus);
      if (result.success) {
        router.refresh();
      } else {
        alert('Failed to update: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating approval:', error);
      alert('Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    setIsLoading(true);
    try {
      const result = await updateUserRole(id, newRole);
      if (result.success) {
        router.refresh();
      } else {
        alert('Failed to update role: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update user role');
    } finally {
      setIsLoading(false);
    }
  };

  const pendingRequests = signupRequests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="mt-1 text-gray-500">Approve or reject signup requests and manage user access</p>
      </div>

      {/* Roles Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          User Roles & Permissions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-white p-3 rounded border border-gray-200">
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">User</span>
            <p className="mt-2 text-gray-600">Can view data, add notes, and change statuses</p>
          </div>
          <div className="bg-white p-3 rounded border border-blue-300">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">Editor</span>
            <p className="mt-2 text-gray-600">Can create, edit, and delete records + all User permissions</p>
          </div>
          <div className="bg-white p-3 rounded border border-purple-300">
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">Admin</span>
            <p className="mt-2 text-gray-600">Full system access + user management</p>
          </div>
        </div>
      </div>

      {/* Pending Signup Requests */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Pending Signup Requests ({pendingRequests.length})
        </h2>
        
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No pending requests</p>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  {request.image && (
                    <Image src={request.image} alt={request.name} width={40} height={40} className="rounded-full" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{request.name}</p>
                    <p className="text-sm text-gray-500">{request.email}</p>
                    <p className="text-xs text-gray-400">
                      Requested: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Users */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">All Users ({users.length})</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name || user.username || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={isLoading}
                    className={`px-3 py-1 text-xs font-semibold rounded-md border-2 disabled:opacity-50 cursor-pointer ${
                      user.role === 'admin' 
                        ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100' 
                        : user.role === 'editor'
                        ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                        : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <option value="user">User</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.provider}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.approved ? 'Approved' : 'Blocked'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleToggleApproval(user.id, user.approved)}
                    disabled={isLoading}
                    className={`${
                      user.approved ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                    } disabled:opacity-50 font-semibold`}
                  >
                    {user.approved ? 'Block User' : 'Approve User'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
