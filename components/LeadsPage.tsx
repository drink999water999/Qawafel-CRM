'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createLead, updateLead, deleteLead } from '@/lib/actions';
import { uploadLeadsCSV } from '@/lib/csvUpload';

interface Lead {
  id: number;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  value: number | { toNumber?: () => number };
}

interface LeadsPageProps {
  leads: Lead[];
}

export default function LeadsPage({ leads }: LeadsPageProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    contactName: '',
    email: '',
    phone: '',
    status: 'New',
    source: '',
    value: 0,
  });

  useEffect(() => {
    if (editingLead) {
      setFormData({
        company: editingLead.company,
        contactName: editingLead.contactName,
        email: editingLead.email,
        phone: editingLead.phone,
        status: editingLead.status,
        source: editingLead.source,
        value: Number(editingLead.value),
      });
    } else {
      setFormData({
        company: '',
        contactName: '',
        email: '',
        phone: '',
        status: 'New',
        source: '',
        value: 0,
      });
    }
  }, [editingLead]);

  const handleOpenModal = (lead?: Lead) => {
    setEditingLead(lead || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingLead) {
        await updateLead(editingLead.id, formData);
      } else {
        await createLead(formData);
      }
      handleCloseModal();
      router.refresh();
    } catch (error) {
      console.error('Error saving lead:', error);
      alert('Failed to save lead');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await deleteLead(id);
      router.refresh();
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Failed to delete lead');
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const result = await uploadLeadsCSV(text);
      
      if (result.success) {
        alert(`CSV imported successfully!\n\nNew records: ${result.imported}\nUpdated records: ${result.updated}\nErrors: ${result.errors}`);
        router.refresh();
      } else {
        alert('Failed to import CSV: ' + result.error);
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      alert('Failed to upload CSV');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const statusColors: Record<string, string> = {
    New: 'bg-blue-100 text-blue-800',
    Contacted: 'bg-yellow-100 text-yellow-800',
    Proposal: 'bg-purple-100 text-purple-800',
    Qualified: 'bg-green-100 text-green-800',
    Lost: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Leads</h1>
          <p className="mt-1 text-gray-500">Manage your sales prospects</p>
        </div>
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Upload CSV
          </button>
          <button
            onClick={() => handleOpenModal()}
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-green-700 flex items-center disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Lead
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.company}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.contactName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[lead.status] || 'bg-gray-100 text-gray-800'}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.source}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Intl.NumberFormat('en-US').format(Number(lead.value))}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button onClick={() => handleOpenModal(lead)} disabled={isLoading} className="text-primary hover:text-green-700 disabled:opacity-50">Edit</button>
                  <button onClick={() => handleDelete(lead.id)} disabled={isLoading} className="text-red-600 hover:text-red-900 disabled:opacity-50">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{editingLead ? 'Edit Lead' : 'Add Lead'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                <input type="text" required value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Source</label>
                  <input type="text" required value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} placeholder="e.g., Website" className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Value ($)</label>
                <input type="number" required min="0" step="0.01" value={formData.value} onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={handleCloseModal} disabled={isLoading} className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-md hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-green-700 disabled:opacity-50">{isLoading ? 'Saving...' : 'Save Lead'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
