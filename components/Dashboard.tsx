'use client';

interface Activity {
  id: number;
  text: string;
  timestamp: number;
  icon: string;
}

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

interface DashboardData {
  leads?: unknown[];
  deals?: Deal[];
  merchants?: unknown[];
  customers?: unknown[];
  activities?: Activity[];
}

interface DashboardProps {
  data: DashboardData;
  setCurrentPage?: (page: string) => void;
}

export default function Dashboard({ data, setCurrentPage }: DashboardProps) {
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
      label: 'Total Merchants',
      value: data.merchants?.length || 0,
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      color: 'bg-purple-500',
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
        <p className="text-4xl font-bold">${new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(totalDealsValue)}</p>
        <p className="text-sm mt-2 opacity-90">Across all active deals</p>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Recent Activity</h3>
        <div className="space-y-4">
          {data.activities?.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{activity.text}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
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
