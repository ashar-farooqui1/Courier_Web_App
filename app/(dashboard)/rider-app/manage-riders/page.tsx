"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, CheckCircle2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- API Readiness: Interfaces for Data ---
interface Client {
  id: string;
  name: string;
}

interface Rider {
  id: string;
  name: string;
  city: string;
  isVerified: boolean;
  qrData: string;
  clients: Client[];
}

// --- Component: RiderCard ---
const RiderCard = ({ rider }: { rider: Rider }) => (
  <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row mb-6 hover:shadow-md transition-shadow">
    {/* QR Code Section - Precisely matched to screenshot */}
    <div className="w-full md:w-48 bg-white flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-2">QR Code</p>
      <div className="bg-white p-1 border border-slate-200 rounded-sm">
        <QrCode size={110} className="text-slate-900" strokeWidth={1.5} />
      </div>
    </div>

    {/* Info Section - Stallionex Blue Theme */}
    <div className="flex-1 p-6 flex flex-col justify-center space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest min-w-[60px]">Name :</span>
           <span className="text-[11px] font-black text-primary uppercase tracking-tight">{rider.name}</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest min-w-[60px]">City :</span>
           <span className="text-[11px] font-black text-primary uppercase tracking-tight">{rider.city}</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest min-w-[60px]">Verified :</span>
           <span className={cn(
             "text-[11px] font-black uppercase tracking-tight",
             rider.isVerified ? "text-green-600" : "text-primary"
           )}>
             {rider.isVerified ? "Yes" : "No"}
           </span>
        </div>
      </div>
      
      {/* Verification Toggle - Blue */}
      <div className="flex items-center gap-2 pt-1">
        <div className={cn(
          "w-10 h-5 rounded-full relative transition-colors cursor-pointer",
          rider.isVerified ? "bg-green-500" : "bg-slate-200"
        )}>
           <div className={cn(
             "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
             rider.isVerified ? "right-0.5" : "left-0.5"
           )}></div>
        </div>
      </div>
    </div>

    {/* Manage Clients Section - Stallionex Blue Theme */}
    <div className="w-full md:w-[40%] p-6 border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/30">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Manage Clients</h4>
      <div className="space-y-2">
        {rider.clients.map((client) => (
          <div key={client.id} className="flex items-center justify-between bg-white p-3 rounded-md border border-slate-100 group hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-tight">{client.name}</span>
            </div>
            <Button className="h-7 px-3 text-[10px] font-bold bg-primary hover:bg-primary/90 text-white rounded-md shadow-sm">
              Manage Requests
            </Button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function ManageRidersPage() {
  // --- API Readiness: State for Data ---
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating API Fetch
    const fetchData = async () => {
      // Fake Data matching your screenshot
      const fakeRiders: Rider[] = [
        {
          id: "1",
          name: "Danish Garden KHI",
          city: "Liyari, KARACHI",
          isVerified: true,
          qrData: "RIDER-001",
          clients: [
            { id: "c1", name: "INSTA WORLD WIDE" },
            { id: "c2", name: "ButtonedOn.Pk" },
            { id: "c3", name: "Daak" }
          ]
        },
        {
          id: "2",
          name: "Muhammad Arif - KHI",
          city: "KARACHI, KARACHI",
          isVerified: true,
          qrData: "RIDER-002",
          clients: [
            { id: "c4", name: "\"The Ultimate Aroma\"" }
          ]
        }
      ];
      
      setRiders(fakeRiders);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Header Controls - Blue Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200">
          <span className="text-xs font-medium text-slate-500 pl-2 uppercase tracking-tighter">Show</span>
          <select className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold text-primary focus:outline-none cursor-pointer">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-tighter">entries</span>
        </div>

        <div className="flex items-center gap-0 group">
          <input 
            type="text" 
            placeholder="Search Riders..." 
            className="h-10 px-4 bg-white border border-slate-200 rounded-l-md text-sm focus:outline-none w-64 focus:border-primary/50 transition-all"
          />
          <button className="h-10 w-10 bg-primary text-white flex items-center justify-center rounded-r-md hover:bg-primary/90 transition-all shadow-md active:scale-95">
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Riders List */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading Riders Data...</div>
        ) : (
          riders.map((rider) => (
            <RiderCard key={rider.id} rider={rider} />
          ))
        )}
      </div>
    </div>
  );
}
