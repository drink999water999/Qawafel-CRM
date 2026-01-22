'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createMerchant, updateMerchant, deleteMerchant } from '@/lib/actions';
import { uploadMerchantsCSV } from '@/lib/csvUpload';
import Notes from './Notes';

interface Merchant {
  id: number;
  name: string;
  businessName: string;
  category: string;
  email: string;
  phone: bigint | null;
  accountStatus: boolean;
  // New subscription fields
  plan?: string | null;
  signUpDate?: Date | null;
  trialFlag?: boolean;
  saasStartDate?: Date | null;
  saasEndDate?: Date | null;
  // CR fields
  crId?: string | null;
  crCertificate?: string | null;
  // VAT fields
  vatId?: string | null;
  vatCertificate?: string | null;
  // ZATCA fields
  zatcaIdentificationType?: string | null;
  zatcaId?: string | null;
  verificationStatus?: string | null;
  // Payment fields
  lastPaymentDueDate?: Date | null;
  retentionStatus?: string | null;
}

interface MerchantsPageProps {
  merchants: Merchant[];
}

export default function MerchantsPage({ merchants }: MerchantsPageProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    category: '',
    email: '',
    phone: '',
    accountStatus: true, // Boolean: true = Active, false = Deactivated
    // Subscription fields
    plan: '',
    signUpDate: '',
    trialFlag: false,
    saasStartDate: '',
    saasEndDate: '',
    // CR fields
    crId: '',
    crCertificate: '',
    // VAT fields
    vatId: '',
    vatCertificate: '',
    // ZATCA fields
    zatcaIdentificationType: '',
    zatcaId: '',
    verificationStatus: '',
    // Payment fields
    lastPaymentDueDate: '',
    retentionStatus: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingMerchant) {
      // Helper to format date for input[type="date"]
      const formatDate = (date: Date | null | undefined) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      };

      setFormData({
        name: editingMerchant.name,
        businessName: editingMerchant.businessName,
        category: editingMerchant.category,
        email: editingMerchant.email,
        phone: editingMerchant.phone ? editingMerchant.phone.toString() : '',
        accountStatus: editingMerchant.accountStatus ?? true,
        // Subscription fields
        plan: editingMerchant.plan || '',
        signUpDate: formatDate(editingMerchant.signUpDate),
        trialFlag: editingMerchant.trialFlag || false,
        saasStartDate: formatDate(editingMerchant.saasStartDate),
        saasEndDate: formatDate(editingMerchant.saasEndDate),
        // CR fields
        crId: editingMerchant.crId || '',
        crCertificate: editingMerchant.crCertificate || '',
        // VAT fields
        vatId: editingMerchant.vatId || '',
        vatCertificate: editingMerchant.vatCertificate || '',
        // ZATCA fields
        zatcaIdentificationType: editingMerchant.zatcaIdentificationType || '',
        zatcaId: editingMerchant.zatcaId || '',
        verificationStatus: editingMerchant.verificationStatus || '',
        // Payment fields
        lastPaymentDueDate: formatDate(editingMerchant.lastPaymentDueDate),
        retentionStatus: editingMerchant.retentionStatus || '',
      });
    } else {
      setFormData({
        name: '',
        businessName: '',
        category: '',
        email: '',
        phone: '',
        accountStatus: true, // Default to Active (true)
        plan: '',
        signUpDate: '',
        trialFlag: false,
        saasStartDate: '',
        saasEndDate: '',
        crId: '',
        crCertificate: '',
        vatId: '',
        vatCertificate: '',
        zatcaIdentificationType: '',
        zatcaId: '',
        verificationStatus: '',
        lastPaymentDueDate: '',
        retentionStatus: '',
      });
    }
  }, [editingMerchant]);

  // Filter merchants by search term
  const filteredMerchants = merchants.filter(merchant => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      merchant.email.toLowerCase().includes(term) ||
      (merchant.phone && merchant.phone.toString().includes(term)) ||
      merchant.name.toLowerCase().includes(term) ||
      merchant.businessName.toLowerCase().includes(term)
    );
  });

  const handleOpenModal = (merchant?: Merchant) => {
    setEditingMerchant(merchant || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMerchant(null);
  };

  const handleOpenNotes = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setIsNotesModalOpen(true);
  };

  const handleCloseNotes = () => {
    setIsNotesModalOpen(false);
    setSelectedMerchant(null);
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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this merchant?')) return;
    
    try {
      await deleteMerchant(id);
      router.refresh();
    } catch (error) {
      console.error('Error deleting merchant:', error);
      alert('Failed to delete merchant');
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // Read file content
      const csvText = await file.text();
      const result = await uploadMerchantsCSV(csvText);
      if (result.success) {
        alert(`Successfully uploaded ${result.imported} merchants`);
        router.refresh();
      } else {
        alert(`Upload failed: ${result.error}`);
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

  // Download merchants as CSV
  const handleDownload = () => {
    const csvHeaders = 'Name,Business Name,Category,Email,Phone,Account Status\n';
    const csvRows = filteredMerchants.map(merchant => 
      `"${merchant.name}","${merchant.businessName}","${merchant.category}","${merchant.email}","${merchant.phone ? merchant.phone.toString() : ''}","${merchant.accountStatus ? 'Active' : 'Deactivated'}"`
    ).join('\n');
    
    const csvContent = csvHeaders + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `merchants_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Merchants</h1>
          <p className="text-gray-600 mt-1">{filteredMerchants.length} total merchants</p>
        </div>
        <div className="flex space-x-3">
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
            onClick={handleDownload}
            disabled={filteredMerchants.length === 0}
            className="px-4 py-2 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-700 flex items-center disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download CSV
          </button>
          <button
            onClick={() => handleOpenModal()}
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-green-700 flex items-center disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Merchant
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by email, phone, name, or business name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Business Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Account Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Sign Up Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Trial</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">SaaS Start</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">SaaS End</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">CR ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">CR Cert</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">VAT ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">VAT Cert</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ZATCA Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ZATCA ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Verification</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Payment Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Retention</th>
              <th className="sticky right-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMerchants.map((merchant) => (
              <tr key={merchant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{merchant.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.businessName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.phone ? merchant.phone.toString() : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${merchant.accountStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {merchant.accountStatus ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.plan || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.signUpDate ? new Date(merchant.signUpDate).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.trialFlag ? '✓' : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.saasStartDate ? new Date(merchant.saasStartDate).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.saasEndDate ? new Date(merchant.saasEndDate).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.crId || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.crCertificate ? <a href={merchant.crCertificate} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a> : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.vatId || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.vatCertificate ? <a href={merchant.vatCertificate} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a> : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.zatcaIdentificationType || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.zatcaId || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.verificationStatus || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.lastPaymentDueDate ? new Date(merchant.lastPaymentDueDate).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.retentionStatus || '-'}</td>
                <td className="sticky right-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
                  <button onClick={() => handleOpenModal(merchant)} disabled={isLoading} className="text-primary hover:text-green-700 disabled:opacity-50">Edit</button>
                  <button onClick={() => handleDelete(merchant.id)} disabled={isLoading} className="text-red-600 hover:text-red-900 disabled:opacity-50">Delete</button>
                  <button onClick={() => handleOpenNotes(merchant)} disabled={isLoading} className="text-yellow-500 hover:text-yellow-600 disabled:opacity-50" title="View Notes">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{editingMerchant ? 'Edit Merchant' : 'Add Merchant'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Information */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Name *</label>
                    <input type="text" required value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                    <input type="text" required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3" placeholder="Numbers only" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                    <div className="flex items-center space-x-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.accountStatus}
                          onChange={(e) => setFormData({ ...formData, accountStatus: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {formData.accountStatus ? 'Active' : 'Deactivated'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Information */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Subscription Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plan</label>
                    <select value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3">
                      <option value="">Select Plan</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                      <option value="Trail">Trail</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center">
                      <input type="checkbox" checked={formData.trialFlag} onChange={(e) => setFormData({ ...formData, trialFlag: e.target.checked })} className="h-4 w-4 text-primary border-gray-300 rounded" />
                      <span className="ml-2 text-sm font-medium text-gray-700">Trial Account</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sign Up Date</label>
                    <input type="date" value={formData.signUpDate} onChange={(e) => setFormData({ ...formData, signUpDate: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SaaS Start Date</label>
                    <input type="date" value={formData.saasStartDate} onChange={(e) => setFormData({ ...formData, saasStartDate: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SaaS End Date</label>
                    <input type="date" value={formData.saasEndDate} onChange={(e) => setFormData({ ...formData, saasEndDate: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                  </div>
                </div>
              </div>

              {/* Commercial Registration (CR) */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Commercial Registration (CR)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CR ID</label>
                    <input type="text" value={formData.crId} onChange={(e) => setFormData({ ...formData, crId: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CR Certificate (URL)</label>
                    <input type="url" value={formData.crCertificate} onChange={(e) => setFormData({ ...formData, crCertificate: e.target.value })} placeholder="https://..." className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                  </div>
                </div>
              </div>

              {/* VAT Information */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">VAT Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">VAT ID</label>
                    <input type="text" value={formData.vatId} onChange={(e) => setFormData({ ...formData, vatId: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">VAT Certificate (URL)</label>
                    <input type="url" value={formData.vatCertificate} onChange={(e) => setFormData({ ...formData, vatCertificate: e.target.value })} placeholder="https://..." className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                  </div>
                </div>
              </div>

              {/* ZATCA Information */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">ZATCA Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ZATCA Identification Type</label>
                    <select value={formData.zatcaIdentificationType} onChange={(e) => setFormData({ ...formData, zatcaIdentificationType: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3">
                      <option value="">Select Type</option>
                      <option value="TIN">TIN (Tax Identification Number)</option>
                      <option value="CRN">CRN (Commercial Registration Number)</option>
                      <option value="MOM">MOM (MOMRA License)</option>
                      <option value="MLS">MLS (MLSD License)</option>
                      <option value="700">700 Number</option>
                      <option value="SAG">SAG (Sagia License)</option>
                      <option value="NAT">NAT (National ID)</option>
                      <option value="GCC">GCC ID</option>
                      <option value="IQA">IQA (Iqama Number)</option>
                      <option value="PAS">PAS (Passport ID)</option>
                      <option value="OTH">OTH (Other ID)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ZATCA ID</label>
                    <input type="text" value={formData.zatcaId} onChange={(e) => setFormData({ ...formData, zatcaId: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                    <select value={formData.verificationStatus} onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3">
                      <option value="">Select Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Verified">Verified</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment & Retention */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Payment & Retention</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Payment Due Date</label>
                    <input type="date" value={formData.lastPaymentDueDate} onChange={(e) => setFormData({ ...formData, lastPaymentDueDate: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Retention Status</label>
                    <select value={formData.retentionStatus} onChange={(e) => setFormData({ ...formData, retentionStatus: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3">
                      <option value="">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Retained">Retained</option>
                      <option value="Ressurected">Ressurected</option>
                      <option value="Dormant">Dormant</option>
                      <option value="Churned">Churned</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={handleCloseModal} disabled={isLoading} className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-md hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-green-700 disabled:opacity-50">{isLoading ? 'Saving...' : 'Save Merchant'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {isNotesModalOpen && selectedMerchant && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4" onClick={handleCloseNotes}>
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
              <button onClick={handleCloseNotes} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Notes 
              entityType="merchant" 
              entityId={selectedMerchant.id} 
              entityName={selectedMerchant.businessName} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
