'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomer, updateCustomer } from '@/lib/actions';
import { uploadCustomersCSV } from '@/lib/csvUpload';

interface Customer {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  accountStatus: string;
  marketplaceStatus: string;
}

interface CustomersPageProps {
  customers: Customer[];
}

export default function CustomersPage({ customers }: CustomersPageProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
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
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name,
        company: editingCustomer.company,
        email: editingCustomer.email,
        phone: editingCustomer.phone || '',
        accountStatus: editingCustomer.accountStatus || 'Active',
        marketplaceStatus: editingCustomer.marketplaceStatus || 'Activated',
      });
    } else {
      setFormData({ name: '', company: '', email: '', phone: '', accountStatus: 'Active', marketplaceStatus: 'Activated' });
    }
  }, [editingCustomer]);

  const handleOpenModal = (customer?: Customer) => {
    setEditingCustomer(customer || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
      } else {
        await createCustomer(formData);
      }
      handleCloseModal();
      router.refresh();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer');
    } finally {
      setIsLoading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const result = await uploadCustomersCSV(text);
      
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
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
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Upload CSV
          </button>
          <button onClick={() => handleOpenModal()} disabled={isLoading} className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-green-700 disabled:opacity-50">Add Customer</button>
        </div>
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
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.company}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{customer.accountStatus}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><button onClick={() => handleOpenModal(customer)} className="text-primary hover:text-green-700">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700">Name</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Company</label><input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Phone</label><input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" /></div>
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={handleCloseModal} disabled={isLoading} className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-md hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-green-700 disabled:opacity-50">{isLoading ? 'Saving...' : 'Save Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
