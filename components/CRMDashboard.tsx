'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import LeadsPage from './LeadsPage';
import DealsPage from './DealsPage';
import VendorsPage from './VendorsPage';
import RetailersPage from './RetailersPage';
import ProposalsPage from './ProposalsPage';
import SettingsPage from './SettingsPage';

interface CRMDashboardProps {
  initialData: any;
}

export default function CRMDashboard({ initialData }: CRMDashboardProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard data={initialData} />;
      case 'leads':
        return <LeadsPage leads={initialData.leads} />;
      case 'deals':
        return <DealsPage deals={initialData.deals} />;
      case 'vendors':
        return <VendorsPage vendors={initialData.vendors} />;
      case 'retailers':
        return <RetailersPage retailers={initialData.retailers} />;
      case 'proposals':
        return <ProposalsPage proposals={initialData.proposals} />;
      case 'settings':
        return <SettingsPage profile={initialData.userProfile} />;
      default:
        return <Dashboard data={initialData} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>
      </div>
    </div>
  );
}
