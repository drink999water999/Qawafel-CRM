'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createProposal, updateProposal, deleteProposal } from '@/lib/actions';

interface Proposal {
  id: number;
  title: string;
  clientName: string;
  clientCompany: string;
  clientEmail?: string | null;
  clientPhone?: bigint | null;
  category?: string | null;
  value: number | { toNumber?: () => number };
  currency: string;
  status: string;
  validUntil: string | Date;
  sentDate?: string | Date | null;
}

interface ProposalsPageProps {
  proposals: Proposal[];
}

export default function ProposalsPage({ proposals }: ProposalsPageProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    category: '',
    value: 0,
    currency: 'SAR',
    status: 'Draft',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (editingProposal) {
      setFormData({
        title: editingProposal.title,
        clientName: editingProposal.clientName,
        clientCompany: editingProposal.clientCompany,
        clientEmail: editingProposal.clientEmail || '',
        clientPhone: editingProposal.clientPhone ? editingProposal.clientPhone.toString() : '',
        category: editingProposal.category || '',
        value: Number(editingProposal.value),
        currency: editingProposal.currency,
        status: editingProposal.status,
        validUntil: new Date(editingProposal.validUntil).toISOString().split('T')[0],
      });
    } else {
      setFormData({
        title: '',
        clientName: '',
        clientCompany: '',
        clientEmail: '',
        clientPhone: '',
        category: '',
        value: 0,
        currency: 'SAR',
        status: 'Draft',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    }
  }, [editingProposal]);

  const handleOpenModal = (proposal?: Proposal) => {
    setEditingProposal(proposal || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProposal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const submitData = { ...formData, validUntil: new Date(formData.validUntil) };
      if (editingProposal) {
        await updateProposal(editingProposal.id, submitData);
      } else {
        await createProposal(submitData);
      }
      handleCloseModal();
      router.refresh();
    } catch (error) {
      console.error('Error saving proposal:', error);
      alert('Failed to save proposal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;
    setIsLoading(true);
    try {
      await deleteProposal(id);
      router.refresh();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      alert('Failed to delete proposal');
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800',
    Sent: 'bg-blue-100 text-blue-800',
    Accepted: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Proposals</h1>
          <p className="mt-1 text-gray-500">Create and manage your business proposals</p>
        </div>
        <button onClick={() => handleOpenModal()} disabled={isLoading} className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-green-700 flex items-center disabled:opacity-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Proposal
        </button>
      </div>

      <div className="space-y-5">
        {proposals.map((proposal) => (
          <div key={proposal.id} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex justify-between items-start mb-3">
              <div><h3 className="font-bold text-lg text-gray-800">{proposal.title}</h3></div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-md ${statusColors[proposal.status]}`}>{proposal.status}</span>
                <button onClick={() => handleOpenModal(proposal)} className="p-2 text-gray-400 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(proposal.id)} className="p-2 text-gray-400 hover:text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500 border-t border-gray-100 pt-4 mt-4">
              <span className="flex items-center">{proposal.clientCompany} - {proposal.clientName}</span>
              <span className="flex items-center font-semibold text-green-600">{new Intl.NumberFormat('en-US').format(Number(proposal.value))} {proposal.currency}</span>
              <span className="flex items-center">Valid until {new Date(proposal.validUntil).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{editingProposal ? 'Edit Proposal' : 'Create Proposal'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700">Proposal Title</label><input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">Client Name</label><input type="text" required value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Client Company</label><input type="text" required value={formData.clientCompany} onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">Client Email</label><input type="email" value={formData.clientEmail} onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Client Phone</label><input type="tel" value={formData.clientPhone} onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700">Category</label><input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Marketing, Development, Consulting" className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Value</label><input type="number" required min="0" value={formData.value} onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Currency</label><input type="text" required value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
                    <option value="Draft">Draft</option><option value="Sent">Sent</option><option value="Accepted">Accepted</option><option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700">Valid Until</label><input type="date" required value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={handleCloseModal} disabled={isLoading} className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-md hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-green-700 disabled:opacity-50">{isLoading ? 'Saving...' : 'Save Proposal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
