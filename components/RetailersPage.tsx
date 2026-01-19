'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createRetailer, updateRetailer } from '@/lib/actions';

interface Retailer {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  accountStatus: string;
  marketplaceStatus: string;
}

interface RetailersPageProps {
  retailers: Retailer[];
}

export default function RetailersPage({ retailers }: RetailersPageProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRetailer, setEditingRetailer] = useState<Retailer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    accountStatus: 'Active',
    marketplaceStatus: 'Activated',
  });

  useEffect(() => {
    if (editingRetailer) {
      setFormData({
        name: editingRetailer.name,
        company: editingRetailer.company,
        email: editingRetailer.email,
        phone: editingRetailer.phone || '',
        accountStatus: editingRetailer.accountStatus || 'Active',
        marketplaceStatus: editingRetailer.marketplaceStatus || 'Activated',
      });
    } else {
      setFormData({ name: '', company: '', email: '', phone: '', accountStatus: 'Active', marketplaceStatus: 'Activated' });
    }
  }, [editingRetailer]);

  const handleOpenModal = (retailer?: Retailer) => {
    setEditingRetailer(retailer || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRetailer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingRetailer) {
        await updateRetailer(editingRetailer.id, formData);
      } else {
        await createRetailer(formData);
      }
      handleCloseModal();
      router.refresh();
    } catch (error) {
      console.error('Error saving retailer:', error);
      alert('Failed to save retailer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Retailers</h1>
        <button onClick={() => handleOpenModal()} disabled={isLoading} className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-green-700 disabled:opacity-50">Add Retailer</button>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {retailers.map((retailer) => (
              <tr key={retailer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{retailer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{retailer.company}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{retailer.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{retailer.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{retailer.accountStatus}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><button onClick={() => handleOpenModal(retailer)} className="text-primary hover:text-green-700">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{editingRetailer ? 'Edit Retailer' : 'Add Retailer'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700">Name</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Company</label><input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Phone</label><input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={handleCloseModal} disabled={isLoading} className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-md hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-green-700 disabled:opacity-50">{isLoading ? 'Saving...' : 'Save Retailer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
