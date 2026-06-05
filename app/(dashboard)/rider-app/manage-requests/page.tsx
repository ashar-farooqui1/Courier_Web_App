"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronDown, Calendar } from 'lucide-react';

// --- API Readiness: Interfaces for Data ---
interface RiderRequest {
  id: string;
  createDate: string;
  city: string;
  clientName: string;
  brandName: string;
  area: string;
  address: string;
  contactName: string;
  contactNumber: string;
  riderName: string;
  status: string;
}

const Tab = ({ label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all relative",
      active ? "text-primary" : "text-slate-400 hover:text-slate-600"
    )}
  >
    {label}
    {active && (
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,43,91,0.3)]" />
    )}
  </button>
);

const FilterInput = ({ label, placeholder, type = "text" }: any) => (
  <div className="flex-1 min-w-[150px] space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      {type === "select" ? (
        <div className="relative">
          <select className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-xs font-bold text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer">
            <option value="">{placeholder}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        </div>
      ) : (
        <div className="relative">
          <input 
            type={type} 
            placeholder={placeholder}
            className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300"
          />
          {type === "date" && (
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          )}
        </div>
      )}
    </div>
  </div>
);

export default function ManageRequestsPage() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [requests, setRequests] = useState<RiderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const tabs = ['Approved', 'Pending', 'Rejected', 'Fulfilled'];
  const tableHeaders = [
    'Request #', 'Create Date', 'Location City', 'Client Name', 
    'Brand Name', 'Area', 'Address', 'Contact Person Name', 
    'Contact Person Number', 'Rider Name', 'Request Status'
  ];

  useEffect(() => {
    // Simulating API Fetch
    const fetchData = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setRequests([]); // Currently empty as per screenshot
      setLoading(false);
    };
    fetchData();
  }, [activeTab]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px] animate-in fade-in duration-500">
      {/* Tabs Section - Stallionex Blue Theme */}
      <div className="flex border-b border-slate-100 px-6 pt-2">
        {tabs.map(tab => (
          <Tab 
            key={tab} 
            label={tab} 
            active={activeTab === tab} 
            onClick={() => setActiveTab(tab)} 
          />
        ))}
      </div>

      {/* Filters Section - Stallionex Blue Theme */}
      <div className="p-8 flex flex-wrap items-end gap-6 justify-end">
        <FilterInput label="AWB ID" placeholder="Enter ID" />
        <FilterInput label="Clients" placeholder="--Select Client--" type="select" />
        <FilterInput label="Date (From)" placeholder="" type="date" />
        <FilterInput label="Date (To)" placeholder="" type="date" />
        
        <button className="h-10 w-10 bg-primary text-white flex items-center justify-center rounded-md hover:bg-primary/90 transition-all shadow-md active:scale-95">
          <Search size={18} />
        </button>
      </div>

      {/* Table Section */}
      <div className="px-8 pb-8 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-50">
              {tableHeaders.map((header, idx) => (
                <th key={idx} className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                  Loading requests...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-20 text-center text-slate-300 italic text-sm">
                  No requests found for {activeTab} status.
                </td>
              </tr>
            ) : (
              // Map through requests here when data is available
              null
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
