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

interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
}

interface CRMData {
  leads: Lead[];
  deals: Deal[];
  vendors: Vendor[];
  retailers: Retailer[];
  proposals: Proposal[];
  tickets: unknown[];
  activities: Activity[];
  userProfile: UserProfile | null;
}

interface Lead {
  id: number;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  value: number | { toNumber: () => number };
  businessSize?: string | null;
  numberOfBranches?: number | null;
  formToken?: string | null;
}

interface Deal {
  id: number;
  title: string;
  company: string;
  contactName: string;
  value: number | { toNumber: () => number };
  stage: string;
  probability: number;
  closeDate: string | Date;
}

interface Vendor {
  id: number;
  name: string;
  businessName: string;
  category: string;
  email: string;
  phone: string | null;
  accountStatus: string;
  marketplaceStatus: string;
  joinDate?: Date;
}

interface Retailer {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  accountStatus: string;
  marketplaceStatus: string;
  joinDate?: Date;
}

interface Proposal {
  id: number;
  title: string;
  clientName: string;
  clientCompany: string;
  value: number | { toNumber: () => number };
  currency: string;
  status: string;
  validUntil: string | Date;
  sentDate?: string | Date | null;
}

interface Activity {
  id: number;
  text: string;
  timestamp: number;
  icon: string;
}

interface CRMDashboardProps {
  initialData: CRMData;
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
