"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Search, FileOutput } from 'lucide-react';

const HistoryTab = ({ label, active }: any) => (
  <button
    className={cn(
      "px-6 py-2 text-[11px] font-bold uppercase tracking-widest transition-all rounded-md border",
      active 
        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
    )}
  >
    {label}
  </button>
);

export default function AdvicesHistoryPage() {
  const tableHeaders = [
    'Sr No', 'CN', 'Amount', 'Vendor Order ID', 'Approval', 'Approval Date', 
    'Current Status', 'Current Status Date', 'Requested Status', 'Requested Status Date', 
    'Customer Phone No', 'Rider Remarks', 'Shipper Name'
  ];

  const data = [
    { sr: 1, cn: 'KHI10955169', amount: '1300', vendorId: '#2415671_1', approved: true, approveDate: '2026-04-23 18:52:48', currentStatus: 'Parcel Returned', currentStatusDate: '2025-10-18 01:00:33', requestedStatus: 'Return Confirm', requestedStatusDate: '2026-04-23 18:48:34', phone: '+923362468827', remarks: 'RFD|REFUSED TO RECEIVED', shipper: 'Saeed Ghani' },
    { sr: 2, cn: 'MUX10953465', amount: '2050', vendorId: '#1106', approved: false, currentStatus: 'Halt - Advice sent', currentStatusDate: '2025-10-16 13:56:56', requestedStatus: 'Return Confirm', requestedStatusDate: '2025-10-17 10:06:57', phone: '+923112029987', remarks: 'ULA|UNTRACABLE ADDRESS + CONTACT NOT ESTABLISH', shipper: 'The M..' },
    { sr: 3, cn: 'MUX10953301', amount: '2050', vendorId: '#1371', approved: false, currentStatus: 'Halt - Advice sent', currentStatusDate: '2025-10-16 13:49:32', requestedStatus: 'Return Confirm', requestedStatusDate: '2025-10-17 12:43:56', phone: '+923075998979', remarks: 'RFD|REFUSED TO RECEIVED', shipper: 'The M..' },
    { sr: 4, cn: 'LHE10952933', amount: '2694', vendorId: 'AF-683681-1_823074770202444', approved: false, currentStatus: 'Halt - Advice sent', currentStatusDate: '2025-10-16 10:57:29', requestedStatus: 'Return Confirm', requestedStatusDate: '2025-10-17 07:06:03', phone: '03018096666', remarks: 'OSA|OUT OF SERVICE AREA', shipper: 'Smartl..' },
    { sr: 5, cn: 'LHE10952397', amount: '10194', vendorId: '#3615', approved: false, currentStatus: 'Halt - Advice sent', currentStatusDate: '2025-10-16 10:00:36', requestedStatus: 'Return Confirm', requestedStatusDate: '2025-10-17 13:42:32', phone: '03304236679', remarks: 'RFD|REFUSED TO RECEIVED', shipper: '101 Ch..' },
    { sr: 6, cn: 'LHE10952098', amount: '1098', vendorId: '42149715735', approved: false, currentStatus: 'Halt - Advice sent', currentStatusDate: '2025-10-16 07:45:48', requestedStatus: 'Return Confirm', requestedStatusDate: '2025-10-17 14:09:40', phone: '+923164120918', remarks: 'RFD|REFUSED TO RECEIVED', shipper: 'Brand..' },
    { sr: 7, cn: 'LHE10952096', amount: '2899', vendorId: '42149715738', approved: false, remarkBtn: true, currentStatus: 'Halt - Advice sent', currentStatusDate: '2025-10-16 07:45:45', requestedStatus: 'Request for Reattempt', requestedStatusDate: '2025-10-17 11:43:52', phone: '+923019493072', remarks: 'RFD|REFUSED TO RECEIVED', shipper: 'Brand..' },
    { sr: 8, cn: 'LHE10951962', amount: '2529', vendorId: '#65378', approved: false, currentStatus: 'Halt - Advice sent', currentStatusDate: '2025-10-16 07:14:16', requestedStatus: 'Return Confirm', requestedStatusDate: '2025-10-17 12:54:52', phone: '+923024503610', remarks: 'OSA|OUT OF SERVICE AREA', shipper: 'Scent..' },
    { sr: 9, cn: 'LHE10951578', amount: '1760', vendorId: 'Ak', approved: false, currentStatus: 'Halt - Advice sent', currentStatusDate: '2025-10-15 16:56:51', requestedStatus: 'Return Confirm', requestedStatusDate: '2025-10-17 14:23:31', phone: '03417910254', remarks: 'RFD|REFUSED TO RECEIVED', shipper: 'Talha Collect..' },
    { sr: 10, cn: 'LHE10951511', amount: '1944', vendorId: 'AF-681494-1_277252302736684', approved: false, currentStatus: 'Halt - Advice sent', currentStatusDate: '2025-10-15 14:05:36', requestedStatus: 'Return Confirm', requestedStatusDate: '2025-10-17 14:23:28', phone: '03353525654', remarks: 'RFD|REFUSED TO RECEIVED', shipper: 'Smartl..' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 bg-white p-6 min-h-screen rounded-xl shadow-sm border border-slate-100">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <HistoryTab label="Published Advices" />
          <HistoryTab label="Pending Advices" active />
          <HistoryTab label="Scane Advices" />
          <HistoryTab label="Export Log" />
        </div>
        
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Advices History</h2>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden mt-6">
        {/* Table Filters Header */}
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
            <select className="h-9 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
              <option>10</option>
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
            <button className="h-10 px-8 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md active:scale-95 transition-all">
              Filter
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[10px] font-medium text-slate-600">
              {data.map((row, idx) => (
                <tr key={idx} className={cn(
                  "border-b border-slate-50 hover:bg-slate-50/50 transition-colors relative group",
                  idx > 0 && "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-full before:h-24 before:bg-gradient-to-r before:from-yellow-400 before:to-transparent before:opacity-0 hover:before:opacity-10"
                )}>
                  <td className="p-4">{row.sr}</td>
                  <td className="p-4 font-bold text-primary">{row.cn}</td>
                  <td className="p-4">{row.amount}</td>
                  <td className="p-4 text-slate-400">{row.vendorId}</td>
                  <td className="p-4">
                    {row.approved ? (
                      <span className="px-2 py-1 bg-emerald-500 text-white rounded text-[9px] font-bold uppercase">Approved</span>
                    ) : row.remarkBtn ? (
                      <button className="px-2 py-1 bg-primary text-white rounded text-[9px] font-bold uppercase shadow-sm">Approve Remark</button>
                    ) : null}
                  </td>
                  <td className="p-4 text-slate-400">{row.approveDate}</td>
                  <td className="p-4">{row.currentStatus}</td>
                  <td className="p-4 text-slate-400">{row.currentStatusDate}</td>
                  <td className="p-4">{row.requestedStatus}</td>
                  <td className="p-4 text-slate-400">{row.requestedStatusDate}</td>
                  <td className="p-4">{row.phone}</td>
                  <td className="p-4 text-[9px] max-w-[150px] leading-tight text-slate-400">{row.remarks}</td>
                  <td className="p-4 font-bold">{row.shipper}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/30 flex items-center justify-between border-t border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Showing 1 to 10 of 147486 entries</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, '...', 14748, 14749].map((page, i) => (
              <button key={i} className={cn(
                "w-8 h-8 rounded text-[11px] font-bold transition-all",
                page === 1 ? "bg-primary text-white shadow-md" : "text-slate-400 hover:bg-slate-100"
              )}>
                {page}
              </button>
            ))}
          </div>
        </div>
        
        {/* Bottom Red Bar */}
        <div className="h-2 w-full bg-primary/80" />
      </div>
    </div>
  );
}
