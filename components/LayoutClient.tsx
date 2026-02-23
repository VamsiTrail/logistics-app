'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import LogisticsTable from './LogisticsTable';
import LogoutButton from './LogoutButton';
import Link from 'next/link';
import ContainerHistoryPage from '@/app/container-history/page';


export default function LayoutClient({ user }: { user: string }) {
  const [open, setOpen] = useState(false);
  const logoUrl = "https://www.vermeiren.com/web/web.nsf/VERMEIREN%20LOGO%202022%20RGB.png";
  {/*const [view, setView] = useState<'home' | 'missing' | 'all'>('home');*/}
  const [view, setView] = useState<'home' | 'missing' | 'all' | 'history'>('home');
return (
  <div className="relative min-h-screen bg-gray-50 flex">
    {/* Sidebar */}
    <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-xl transform transition-transform duration-300 z-50 flex flex-col
        ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >

        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-bold text-lg">Menu</h2>
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        <div className="flex flex-col flex-1 p-4">

          <div className="space-y-3">
            <button onClick={() => { setView('home'); setOpen(false); }} className="block w-full text-left hover:bg-gray-100 p-2 rounded">
              Home
            </button>

            <button onClick={() => { setView('missing'); setOpen(false); }} className="block w-full text-left hover:bg-gray-100 p-2 rounded">
              Edit
            </button>

            <button onClick={() => { setView('all'); setOpen(false); }} className="block w-full text-left hover:bg-gray-100 p-2 rounded">
              Record
            </button>   

            <button
              onClick={() => {
                setView('history');
                setOpen(false);
              }}
              className="block w-full text-left hover:bg-gray-100 p-2 rounded"
            >
              History
            </button>

          </div>

          <div className="ml-2 mt-auto border-t p-4">
            <LogoutButton />
          </div>

        </div>
      </div>


    {/* Overlay */}
    {open && (
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={() => setOpen(false)}
      />
    )}

    {/* Main Area */}
    <div className="flex-1">

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6">

        {/* Left Side */}
        <div className="flex items-center gap-4">

          {/* Menu Button */}
          <button onClick={() => setOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>

          {/* Company Logo */}
          <img src={logoUrl}alt="Vermeiren Logo"className="h-16 w-auto object-contain"/>
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold">
              Container Data Entry
            </h1>
            <p className="text-sm text-gray-600 ml-8">
              Welcome, {user}
            </p>
          </div>
        </div>

        {/*<LogoutButton />*/}
      </div>

      {/* Content */}
      <div className="px-8 py-6">

        {view === 'home' && (
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome to Vermeiren
            </h2>
            <p className="text-gray-600 mt-4">
              Please select an option from the menu.
            </p>
          </div>
        )}

        {view === 'missing' && (
          <LogisticsTable type="missing" />
        )}

        {view === 'all' && (
          <LogisticsTable type="all" />
        )}

        {view === 'history' && (
          <ContainerHistoryPage />
        )}
      </div>

    </div>
  </div>
);
}
