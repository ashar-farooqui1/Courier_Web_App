"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, Plus, Eye, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Claim {
  id: string;
  shipperName: string;
  shipperEmail: string;
  aboutClaim: string;
  cnNumber: string;
  pickUpDate: string;
  deliveryDate: string;
  typeOfLoss: string;
  damageStatus: string;
  claimedAmount: number;
  claimedAt: string;
  status: 'Rejected' | 'Accepted';
}

const DetailRow = ({ label, value, subLabel }: any) => (
  <div className="flex flex-col items-center text-center py-4">
    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">{label}</span>
    <span className="text-[11px] font-medium text-slate-600 max-w-2xl whitespace-pre-wrap">{value || 'nil'}</span>
    {subLabel && <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-4">{subLabel}</span>}
  </div>
);

const ClaimDetailModal = ({ isOpen, onClose, claim }: any) => {
  if (!isOpen || !claim) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded shadow-2xl w-full max-w-2xl my-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-50">
          <h3 className="font-bold text-slate-700 text-sm uppercase">Claim Details</h3>
          <button onClick={onClose} className="hover:bg-slate-50 p-1 rounded-full transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        
        <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          <h2 className="text-center text-lg font-bold text-slate-700 uppercase mb-8">Vendor Claim Details</h2>
          
          <DetailRow label="About Claim" value={claim.aboutClaim} subLabel="Attach the Evidence:" />
          
          <div className="flex flex-col items-center py-4 border-t border-slate-50">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-4">Attachments</span>
            <div className="grid grid-cols-4 w-full text-center">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-red-400 uppercase">Shipper Name</span>
                <span className="text-[10px] font-medium text-slate-600 uppercase">{claim.shipperName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-red-400 uppercase">Shipper Email</span>
                <span className="text-[10px] font-medium text-slate-600">{claim.shipperEmail}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-red-400 uppercase">Claimed Amount</span>
                <span className="text-[10px] font-medium text-slate-600">{claim.claimedAmount}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-red-400 uppercase">Claimed CN Number</span>
                <span className="text-[10px] font-medium text-slate-600">{claim.cnNumber}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center py-4 border-t border-slate-50">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Required Information Details</span>
            <div className="grid grid-cols-4 w-full text-center">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-red-400 uppercase">Pick-up Date</span>
                <span className="text-[10px] font-medium text-slate-600">{claim.pickUpDate}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-red-400 uppercase">Delivery/RTV Date</span>
                <span className="text-[10px] font-medium text-slate-600">{claim.deliveryDate}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-red-400 uppercase">Type of Loss</span>
                <span className="text-[10px] font-medium text-slate-600">{claim.typeOfLoss}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-red-400 uppercase">Damage Status</span>
                <span className="text-[10px] font-medium text-slate-600">{claim.damageStatus}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center py-4 border-t border-slate-50">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Lost/Damaged Item Quantity & Description</span>
            <DetailRow label="Damage Description" value="Universal 1080 Rotation Splash Filter QTY (1)" />
            <DetailRow label="Outer Damage Details" value="nil" />
            <DetailRow label="Inner Damage Details" value="nil" />
            <DetailRow label="Incurred Damage Details" value="nil" />
          </div>

          <div className="flex flex-col items-center py-4 border-t border-slate-50">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Any Remarks</span>
            <DetailRow label="Remarks Details" value={claim.aboutClaim} />
            <DetailRow label="Claim Status" value={claim.status} />
          </div>

          <div className="flex justify-center pt-4">
            <button className="h-10 px-8 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all">
              Reject Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OrdersClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Simulating API Fetch with fake data from screenshot
    const fakeClaims: Claim[] = [
      {
        id: '1',
        shipperName: 'INSTA WORLD WIDE',
        shipperEmail: 'mazhar.iqbal@instaworld.pk',
        aboutClaim: 'Damaged',
        cnNumber: '10137605',
        pickUpDate: '2024-01-12',
        deliveryDate: '2024-01-13',
        typeOfLoss: 'Delivered in Damaged condition',
        damageStatus: 'Damaged - Total',
        claimedAmount: 3000,
        claimedAt: '2024-01-16 06:59',
        status: 'Rejected'
      },
      {
        id: '2',
        shipperName: 'Liberty Books',
        shipperEmail: 'query@libertybooks.com',
        aboutClaim: 'this order has been deliveered in this condition to customer, torn and burnt covered with tape.',
        cnNumber: '10141774',
        pickUpDate: '2024-01-24',
        deliveryDate: '2024-02-24',
        typeOfLoss: 'damaged book',
        damageStatus: 'Damaged - Total',
        claimedAmount: 4505,
        claimedAt: '2024-02-03 07:38',
        status: 'Accepted'
      }
    ];
    setClaims(fakeClaims);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Claims List</h1>
        <Button className="bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-tight gap-2 shadow-md">
          <Plus size={14} /> Add Claim
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
            <select className="h-9 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
              <option>10</option>
              <option>25</option>
            </select>
            <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
          </div>

          <div className="flex flex-1 max-w-4xl items-center gap-4 justify-end">
            <input 
              type="text" 
              placeholder="Tracking ID #" 
              className="h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none w-48"
            />
            <input type="date" className="h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
            <input type="date" className="h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
            <button className="h-10 px-6 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md active:scale-95 transition-all flex items-center gap-2">
              <Search size={14} /> Filter
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipper Name</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipper Email</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-[200px]">About Claim</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">CN Number</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pick Up Date</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Date</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type of Loss</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Damage Status</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={11} className="p-10 text-center text-slate-400 font-bold animate-pulse">Loading Claims...</td></tr>
              ) : claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-[10px] font-bold text-slate-600 uppercase">{claim.shipperName}</td>
                  <td className="p-4 text-[10px] font-medium text-slate-400">{claim.shipperEmail}</td>
                  <td className="p-4 text-[10px] font-medium text-slate-500 max-w-[200px] leading-relaxed">{claim.aboutClaim}</td>
                  <td className="p-4 text-[10px] font-bold text-primary">{claim.cnNumber}</td>
                  <td className="p-4 text-[10px] font-medium text-slate-400 whitespace-nowrap">{claim.pickUpDate}</td>
                  <td className="p-4 text-[10px] font-medium text-slate-400 whitespace-nowrap">{claim.deliveryDate}</td>
                  <td className="p-4 text-[10px] font-medium text-slate-500">{claim.typeOfLoss}</td>
                  <td className="p-4 text-[10px] font-medium text-slate-500">{claim.damageStatus}</td>
                  <td className="p-4 text-[10px] font-bold text-primary">{claim.claimedAmount}</td>
                  <td className="p-4 text-[10px] font-bold text-slate-600">{claim.status}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedClaim(claim);
                          setIsModalOpen(true);
                        }}
                        className="bg-primary text-white p-1.5 rounded-md hover:opacity-90 transition-opacity"
                      >
                        <Eye size={12} />
                      </button>
                      <button className="bg-green-500 text-white p-1.5 rounded-md hover:opacity-90 transition-opacity">
                        <Download size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ClaimDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        claim={selectedClaim} 
      />
    </div>
  );
}
