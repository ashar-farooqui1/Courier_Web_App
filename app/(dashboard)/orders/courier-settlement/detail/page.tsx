"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export default function CourierSettlementDetailPage() {
  const tableHeaders = ['Pick up date', 'Shipmentdate', 'COD', 'Type', 'Price', 'Number', 'Client', 'Recipient'];
  
  const settlements = [
    { pickup: '2025-10-13', shipment: '2025-10-17', cod: '6862.47', type: 'Main Cities Service', number: 'KHI10947552', client: 'Smartlane', recipient: 'Aenaa Rafat, Bahria complex 3 datacheck MT khan road Mezzanine floor, KARACHI' },
    { pickup: '2025-10-13', shipment: '2025-10-17', cod: '1194', type: 'Main Cities Service', number: 'KHI10948236', client: 'Toyzone.pk', recipient: 'raheel jawed, Techno city officer tower 215 altaf Hussain ii chundriger road, KARACHI' },
    { pickup: '2025-10-13', shipment: '2025-10-17', cod: '2030', type: 'Main Cities Service', number: 'KHI10948244', client: 'Toyzone.pk', recipient: 'Jahanzaib Zebi, Office # 109 1st Floor Progressive plaza, Beaumont Road civil lines karachi, KARACHI' },
    { pickup: '2025-10-14', shipment: '2025-10-17', cod: '3898', type: 'Main Cities Service', number: 'KHI10948710', client: 'Smartlane', recipient: 'UROOJ KIRAN, HABIBMETROPOLITAN BANK, HBZ PLAZA, 8TH FLOOR, OPPOSITE SHAHEEN COMPLEX, KARACHI,HABIBMETROPOLITAN BANK, HBZ PLAZA, 8TH FLOOR, OPPOSITE SHAHEEN COMPLEX, KARACHI-I.I CHUNDRIGAR ROAD, KARACHI' },
    { pickup: '2025-10-14', shipment: '2025-10-17', cod: '6916.5', type: 'Main Cities Service', number: 'KHI10949229', client: 'Smartlane', recipient: 'M S Siraj, Office No 106, Jilani Tower, Main M.A Jinnah Road, Tower, Karachi, 107, KARACHI' },
    { pickup: '2025-10-14', shipment: '2025-10-17', cod: '7350', type: 'Main Cities Service', number: 'KHI10949246', client: 'Smartlane', recipient: 'Quratulain Shaikh, Raqami Bank, 4th Floor, Bahria Complex 1, MT Khan Road Lalazar, KARACHI' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 bg-[#f8fafc] p-6 min-h-screen">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">M.Nabeel KHI Settlement</h1>
        <div className="text-[10px] font-bold text-primary uppercase border-b-2 border-primary pb-1">Settlements</div>
      </div>

      {/* Repeatable Sections from Screenshot */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-4 mb-12">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Tracking Numbers" 
                className="w-64 h-9 px-4 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              <button className="h-9 px-6 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-sm flex items-center gap-2">
                <Search size={14} /> Search
              </button>
            </div>
            <div className="flex gap-2">
              <button className="h-9 px-6 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-sm">Deselect All</button>
              <button className="h-9 px-6 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-sm">Select All</button>
            </div>
          </div>

          <div className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="p-4 w-10 border-r border-slate-100"></th>
                    {tableHeaders.map((header, idx) => (
                      <th key={idx} className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap border-r border-slate-100">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[10px] font-medium text-slate-600">
                  {settlements.map((s, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 border-r border-slate-100">
                        <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary" />
                      </td>
                      <td className="p-4 border-r border-slate-100">{s.pickup}</td>
                      <td className="p-4 border-r border-slate-100">{s.shipment}</td>
                      <td className="p-4 border-r border-slate-100 font-bold text-slate-700">{s.cod}</td>
                      <td className="p-4 border-r border-slate-100 text-slate-400">{s.type}</td>
                      <td className="p-4 border-r border-slate-100"></td>
                      <td className="p-4 border-r border-slate-100 font-bold text-primary underline cursor-pointer">{s.number}</td>
                      <td className="p-4 border-r border-slate-100 font-bold text-slate-500">{s.client}</td>
                      <td className="p-4 text-[9px] text-slate-400 uppercase leading-tight max-w-[400px]">{s.recipient}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-white border-t border-slate-100 text-center">
              <span className="text-[10px] font-bold text-primary uppercase cursor-pointer">Settlements</span>
            </div>
          </div>
          {section < 3 && (
            <div className="flex justify-center gap-12 mt-8">
              <div className="h-0.5 w-32 bg-primary/20 rounded-full" />
              <div className="h-0.5 w-32 bg-primary/20 rounded-full" />
            </div>
          )}
        </div>
      ))}
      
      <div className="flex flex-col items-center mt-12 pb-12">
        <div className="text-[10px] font-bold text-primary uppercase border-t-2 border-primary pt-1">Settlements</div>
      </div>
    </div>
  );
}
