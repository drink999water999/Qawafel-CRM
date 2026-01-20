'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import LeadsPage from './LeadsPage';
import DealsPage from './DealsPage';
import MerchantsPage from './MerchantsPage';
import CustomersPage from './CustomersPage';
import ProposalsPage from './ProposalsPage';
import ApprovalsPage from './ApprovalsPage';
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
  merchants: Merchant[];
  customers: Customer[];
  proposals: Proposal[];
  activities: Activity[];
  userProfile: UserProfile | null;
  signupRequests?: SignupRequest[];
  users?: User[];
  userRole?: string;
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

interface Merchant {
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

interface Customer {
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
  id: number;
  email: string;
  name: string | null;
  username: string | null;
  role: string;
  approved: boolean;
  provider: string;
  createdAt: Date;
}

interface CRMDashboardProps {
  initialData: CRMData;
}

export default function CRMDashboard({ initialData }: CRMDashboardProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard data={initialData} setCurrentPage={setCurrentPage} />;
      case 'leads':
        return <LeadsPage leads={initialData.leads} />;
      case 'deals':
        return <DealsPage deals={initialData.deals} />;
      case 'merchants':
        return <MerchantsPage merchants={initialData.merchants} />;
      case 'customers':
        return <CustomersPage customers={initialData.customers} />;
      case 'proposals':
        return <ProposalsPage proposals={initialData.proposals} />;
      case 'approvals':
        return <ApprovalsPage 
          signupRequests={initialData.signupRequests || []} 
          users={initialData.users || []} 
        />;
      case 'settings':
        return <SettingsPage profile={initialData.userProfile} />;
      default:
        return <Dashboard data={initialData} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        userRole={initialData.userRole}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>
      </div>
    </div>
  );
}
