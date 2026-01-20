'use client';

import Image from 'next/image';
import { signOut } from 'next-auth/react';

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Header({ user }: HeaderProps) {
  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut({ callbackUrl: '/login' });
    }
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Welcome to Qawafel CRM</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your B2B marketplace efficiently</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium">Logout</span>
          </button>
          {user?.image ? (
            <Image 
              src={user.image} 
              alt={user.name || 'User'} 
              width={40}
              height={40}
              className="rounded-full border-2 border-primary"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
              {getInitials()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
