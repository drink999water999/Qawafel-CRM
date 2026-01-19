'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createMerchant, updateMerchant } from '@/lib/actions';

interface Merchant {
  id: number;
  name: string;
  businessName: string;
  category: string;
  email: string;
  phone: string | null;
  accountStatus: string;
  marketplaceStatus: string;
}

interface MerchantsPageProps {
  merchants: Merchant[];
}

export default function MerchantsPage({ merchants }: MerchantsPageProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    category: '',
    email: '',
    phone: '',
    accountStatus: 'Active',
    marketplaceStatus: 'Activated',
  });

  useEffect(() => {
    if (editingMerchant) {
      setFormData({
        name: editingMerchant.name,
        businessName: editingMerchant.businessName,
        category: editingMerchant.category,
        email: editingMerchant.email,
        phone: editingMerchant.phone || '',
        accountStatus: editingMerchant.accountStatus || 'Active',
        marketplaceStatus: editingMerchant.marketplaceStatus || 'Activated',
      });
    } else {
      setFormData({ name: '', businessName: '', category: '', email: '', phone: '', accountStatus: 'Active', marketplaceStatus: 'Activated' });
    }
  }, [editingMerchant]);

  const handleOpenModal = (merchant?: Merchant) => {
    setEditingMerchant(merchant || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMerchant(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingMerchant) {
        await updateMerchant(editingMerchant.id, formData);
      } else {
        await createMerchant(formData);
      }
      handleCloseModal();
      router.refresh();
    } catch (error) {
      console.error('Error saving merchant:', error);
      alert('Failed to save merchant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Merchants</h1>
        <button onClick={() => handleOpenModal()} disabled={isLoading} className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-green-700 disabled:opacity-50">Add Merchant</button>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {merchants.map((merchant) => (
              <tr key={merchant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{merchant.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.businessName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.phone || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{merchant.accountStatus}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><button onClick={() => handleOpenModal(merchant)} className="text-primary hover:text-green-700">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{editingMerchant ? 'Edit Merchant' : 'Add Merchant'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700">Contact Name</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Business Name</label><input type="text" required value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Category</label><input type="text" required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Phone</label><input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={handleCloseModal} disabled={isLoading} className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-md hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-green-700 disabled:opacity-50">{isLoading ? 'Saving...' : 'Save Merchant'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
