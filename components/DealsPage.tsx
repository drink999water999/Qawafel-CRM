'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createDeal, updateDeal, deleteDeal } from '@/lib/actions';

interface Deal {
  id: number;
  title: string;
  company: string;
  contactName: string;
  value: number | { toNumber?: () => number };
  stage: string;
  probability: number;
  closeDate: string | Date;
}

interface DealsPageProps {
  deals: Deal[];
}

const STAGES = ['New', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Lost'];

export default function DealsPage({ deals }: DealsPageProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    contactName: '',
    value: 0,
    stage: 'New',
    probability: 50,
    closeDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (editingDeal) {
      setFormData({
        title: editingDeal.title,
        company: editingDeal.company,
        contactName: editingDeal.contactName,
        value: Number(editingDeal.value),
        stage: editingDeal.stage,
        probability: editingDeal.probability,
        closeDate: new Date(editingDeal.closeDate).toISOString().split('T')[0],
      });
    } else {
      setFormData({
        title: '',
        company: '',
        contactName: '',
        value: 0,
        stage: 'New',
        probability: 50,
        closeDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [editingDeal]);

  const handleOpenModal = (deal?: Deal) => {
    setEditingDeal(deal || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDeal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = { ...formData, closeDate: new Date(formData.closeDate) };
      if (editingDeal) {
        await updateDeal(editingDeal.id, submitData);
      } else {
        await createDeal(submitData);
      }
      handleCloseModal();
      router.refresh();
    } catch (error) {
      console.error('Error saving deal:', error);
      alert('Failed to save deal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    
    setIsLoading(true);
    try {
      await deleteDeal(id);
      router.refresh();
    } catch (error) {
      console.error('Error deleting deal:', error);
      alert('Failed to delete deal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', deal.id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
  };

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedDeal || draggedDeal.stage === newStage) {
      setDraggedDeal(null);
      return;
    }

    const dealToUpdate = draggedDeal;
    setDraggedDeal(null);
    
    // Optimistic update - update UI immediately without reload
    try {
      await updateDeal(dealToUpdate.id, { stage: newStage });
      // Silently refresh data in background
      router.refresh();
    } catch (error) {
      console.error('Error updating deal stage:', error);
      alert('Failed to update deal stage. Please refresh the page.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Deals</h1>
          <p className="mt-1 text-gray-500">Track deals through your sales pipeline</p>
        </div>
        <button onClick={() => handleOpenModal()} disabled={isLoading} className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-green-700 flex items-center disabled:opacity-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Deal
        </button>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          const totalValue = stageDeals.reduce((sum, deal) => sum + Number(deal.value), 0);

          return (
            <div
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className={`w-80 flex-shrink-0 bg-gray-50 rounded-lg p-3 border-2 transition-colors ${
                draggedDeal && draggedDeal.stage !== stage ? 'border-primary border-dashed bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="p-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-gray-200 text-gray-800">{stage}</span>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-gray-800">{stageDeals.length}</span>
                  <span className="text-sm font-medium text-gray-500 ml-2">{new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(totalValue)}</span>
                </div>
              </div>
              <div className="space-y-3 overflow-y-auto max-h-96">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal)}
                    onDragEnd={handleDragEnd}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-gray-800">{deal.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{deal.company} - {deal.contactName}</p>
                      </div>
                      <div className="flex space-x-1">
                        <button onClick={() => handleOpenModal(deal)} className="p-1 text-gray-400 hover:text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(deal.id)} className="p-1 text-gray-400 hover:text-red-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                      <span className="font-semibold text-green-600">{new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR' }).format(Number(deal.value))}</span>
                      <span>{deal.probability}%</span>
                    </div>
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <div className="text-center text-gray-400 py-8 text-sm">Drop deals here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{editingDeal ? 'Edit Deal' : 'Add Deal'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Deal Title</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                  <input type="text" required value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Value (SAR)</label>
                  <input type="number" required min="0" value={formData.value} onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Probability (%)</label>
                  <input type="number" required min="0" max="100" value={formData.probability} onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stage</label>
                  <select value={formData.stage} onChange={(e) => setFormData({ ...formData, stage: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
                    {STAGES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Close Date</label>
                  <input type="date" required value={formData.closeDate} onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={handleCloseModal} disabled={isLoading} className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-md hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-green-700 disabled:opacity-50">{isLoading ? 'Saving...' : 'Save Deal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
