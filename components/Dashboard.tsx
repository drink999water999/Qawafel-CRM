'use client';

interface Deal {
  id: number;
  stage: {
    id: number;
    name: string;
    color: string;
    order: number;
    isWon: boolean;
    isLost: boolean;
  };
  value: number | { toNumber?: () => number };
}

interface Merchant {
  id: number;
  name: string;
  businessName: string;
  accountStatus: boolean;
  lastPaymentDueDate?: Date | null;
  retentionStatus?: string | null;
  saasEndDate?: Date | null;
  joinDate?: Date;
}

interface DashboardData {
  leads?: unknown[];
  deals?: Deal[];
  merchants?: Merchant[];
  customers?: unknown[];
}

interface DashboardProps {
  data: DashboardData;
  setCurrentPage?: (page: string) => void;
}

export default function Dashboard({ data, setCurrentPage }: DashboardProps) {
  // Calculate merchant metrics
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const activeMerchants = data.merchants?.filter(m => m.accountStatus === true).length || 0;
  const deactivatedMerchants = data.merchants?.filter(m => m.accountStatus === false).length || 0;
  
  const endingSoon = data.merchants?.filter(m => {
    if (!m.lastPaymentDueDate || m.accountStatus === false) return false;
    const dueDate = new Date(m.lastPaymentDueDate);
    return dueDate >= today && dueDate <= thirtyDaysFromNow;
  }).length || 0;

  // Churned: Merchants with retentionStatus = 'churned'
  const churned = data.merchants?.filter(m => {
    return m.retentionStatus?.toLowerCase() === 'churned';
  }).length || 0;

  // Dormant: Merchants with retentionStatus = 'dormant'
  const dormant = data.merchants?.filter(m => {
    return m.retentionStatus?.toLowerCase() === 'dormant';
  }).length || 0;

  const stats = [
    {
      label: 'Total Leads',
      value: data.leads?.length || 0,
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'bg-blue-500',
    },
    {
      label: 'Active Deals',
      value: data.deals?.filter((d) => !d.stage.isLost && !d.stage.isWon).length || 0,
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-green-500',
    },
    {
      label: 'Active Merchants',
      value: activeMerchants,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-emerald-500',
    },
    {
      label: 'Total Customers',
      value: data.customers?.length || 0,
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'bg-orange-500',
    },
  ];

  const totalDealsValue = data.deals?.reduce((sum: number, deal) => {
    const value = typeof deal.value === 'object' && deal.value.toNumber ? deal.value.toNumber() : Number(deal.value);
    return sum + value;
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Overview of your CRM</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Value Card */}
      <div className="bg-gradient-to-r from-primary to-green-700 border border-gray-200 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Total Pipeline Value</h3>
        <p className="text-4xl font-bold">SAR {new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(totalDealsValue)}</p>
        <p className="text-sm mt-2 opacity-90">Across all active deals</p>
      </div>

      {/* Merchant Health Metrics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Merchant Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Churned - Rose/Pink theme */}
          <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-rose-600 uppercase tracking-wide">Churned</p>
                <p className="text-3xl font-bold text-rose-700 mt-2">{churned}</p>
                <p className="text-xs text-rose-500 mt-1">Inactive for +90 days</p>
              </div>
              <div className="bg-rose-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Dormant - Amber theme */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-600 uppercase tracking-wide">Dormant</p>
                <p className="text-3xl font-bold text-amber-700 mt-2">{dormant}</p>
                <p className="text-xs text-amber-500 mt-1">Inactive for +30 days</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Ending Soon - Orange theme */}
          <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Ending Soon</p>
                <p className="text-3xl font-bold text-orange-700 mt-2">{endingSoon}</p>
                <p className="text-xs text-orange-500 mt-1">Due within 30 days</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Deactivated - Slate theme */}
          <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Deactivated</p>
                <p className="text-3xl font-bold text-slate-700 mt-2">{deactivatedMerchants}</p>
                <p className="text-xs text-slate-500 mt-1">Inactive accounts</p>
              </div>
              <div className="bg-slate-200 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setCurrentPage?.('leads')}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h4 className="font-bold text-gray-900">Add Lead</h4>
          <p className="text-sm text-gray-500 mt-1">Create a new sales lead</p>
        </div>
        <div 
          onClick={() => setCurrentPage?.('proposals')}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h4 className="font-bold text-gray-900">Create Proposal</h4>
          <p className="text-sm text-gray-500 mt-1">Draft a new proposal</p>
        </div>
        <div 
          onClick={() => setCurrentPage?.('deals')}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h4 className="font-bold text-gray-900">View Deals</h4>
          <p className="text-sm text-gray-500 mt-1">Manage your pipeline</p>
        </div>
      </div>
    </div>
  );
}
