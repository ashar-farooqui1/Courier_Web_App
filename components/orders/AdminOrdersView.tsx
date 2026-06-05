"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Import,
  Trash2,
  UserPlus,
  FileBox,
  Scale,
  FileText,
  Printer,
  Plus,
  Archive,
  Truck,
  X,
  AlertCircle,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-4xl" }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className={cn("bg-white rounded-xl shadow-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200", maxWidth)}>
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-white">
          <h3 className="font-bold uppercase tracking-widest text-sm">{title}</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, colorClass = "bg-primary", onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-3 py-2 rounded text-white text-[10px] font-bold uppercase tracking-tight transition-all active:scale-95 shadow-sm hover:opacity-90",
      colorClass
    )}
  >
    <Icon size={14} />
    {label}
  </button>
);

const ModalInput = ({ label, placeholder, type = "text", required = false }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {type === "select" ? (
        <div className="relative">
          <select className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
            <option value="">{placeholder}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        </div>
      ) : type === "textarea" ? (
        <textarea
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300 resize-none"
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300"
        />
      )}
    </div>
  </div>
);

const OrderFilter = ({ label, placeholder, type = "text" }: any) => (
  <div className="space-y-1">
    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {type === "select" ? (
        <select className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700 appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20">
          <option value="">{placeholder}</option>
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-300"
        />
      )}
    </div>
  </div>
);

export default function AdminOrdersView() {
  const [modalStates, setModalStates] = useState({
    import: false,
    delete: false,
    addNew: false,
    trashed: false,
    pickup: false,
  });

  const toggleModal = (key: string, val: boolean) => {
    setModalStates((prev) => ({ ...prev, [key]: val }));
  };

  const tableHeaders = [
    "AWB ID",
    "Client Name",
    "Customer Name",
    "Customer Number",
    "Amount",
    "Product Code",
    "Reference ID",
    "Service",
    "Weight",
    "Order Time & Date",
    "Status",
    "Rider",
    "Destination City",
    "Origin City",
    "Warehouse",
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Order Details</h1>

        <div className="flex flex-wrap gap-2 justify-end">
          <ActionButton icon={Import} label="Import" onClick={() => toggleModal("import", true)} />
          <ActionButton icon={Trash2} label="Delete" onClick={() => toggleModal("delete", true)} />
          <ActionButton icon={UserPlus} label="Assign Rider" />
          <ActionButton icon={FileBox} label="Rollcart" />
          <ActionButton icon={Scale} label="Re-Weight" />
          <ActionButton icon={FileText} label="Loadsheet" />
          <ActionButton icon={Printer} label="AWB Print" />
          <ActionButton icon={Plus} label="Add New" onClick={() => toggleModal("addNew", true)} />
          <ActionButton icon={Archive} label="Trashed" onClick={() => toggleModal("trashed", true)} />
          <ActionButton icon={Truck} label="Pickup Request" onClick={() => toggleModal("pickup", true)} />
        </div>
      </div>

      <Modal isOpen={modalStates.import} onClose={() => toggleModal("import", false)} title="Order Import" maxWidth="max-w-6xl">
        <div className="flex items-end gap-6 bg-white p-4 rounded-lg">
          <div className="flex-1">
            <ModalInput label="Client" placeholder="Please Select client" type="select" />
          </div>
          <button className="h-11 px-10 bg-primary text-white text-[11px] font-bold rounded-lg uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all">
            Choose Client
          </button>
        </div>
      </Modal>

      <Modal isOpen={modalStates.addNew} onClose={() => toggleModal("addNew", false)} title="Add Order" maxWidth="max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModalInput label="Select Name" placeholder="Select Name" type="select" />
          <ModalInput label="Customer Name" placeholder="Customer Name" />
          <ModalInput label="Customer Phone" placeholder="Customer Phone" />
          <ModalInput label="Customer Reference" placeholder="Customer Reference" />
          <ModalInput label="Delivery Address" placeholder="Delivery Address" />
          <ModalInput label="--Select City--" placeholder="--Select City--" type="select" />
          <ModalInput label="Area" placeholder="Area" />
          <ModalInput label="Product Name" placeholder="Product Name" />
          <ModalInput label="Select Delivery Type" placeholder="Select Delivery Type" type="select" />
          <ModalInput label="Amount" placeholder="Amount" />
          <ModalInput label="Quantity" placeholder="1" />
          <ModalInput label="Weight" placeholder="1" />
          <div className="md:col-span-1">
            <ModalInput label="Select Pickup Location" placeholder="Select Pickup Location" type="select" />
          </div>
          <div className="md:col-span-1">
            <ModalInput label="Origin Address" placeholder="Origin Address" />
          </div>
          <ModalInput label="Origin Area" placeholder="Origin Area" />
          <ModalInput label="Origin City" placeholder="Origin City" />
          <div className="md:col-span-2">
            <ModalInput label="Customer Remarks" placeholder="Customer Remarks" type="textarea" />
          </div>
          <div className="md:col-span-2 flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="replacement" className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer" />
              <label htmlFor="replacement" className="text-xs font-bold text-slate-500 uppercase cursor-pointer select-none">
                Replacement ID
              </label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => toggleModal("addNew", false)} className="h-10 px-8 border border-primary text-primary text-[11px] font-bold rounded uppercase hover:bg-slate-50 transition-all">
                Reset
              </button>
              <button className="h-10 px-8 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all">
                Submit
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalStates.delete} onClose={() => toggleModal("delete", false)} title="Confirm Delete" maxWidth="max-w-md">
        <div className="text-center space-y-6 py-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-slate-700">Are you sure?</h4>
            <p className="text-sm text-slate-400">Do you really want to delete these orders? This process cannot be undone.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => toggleModal("delete", false)} className="flex-1 h-11 border border-slate-200 text-slate-400 text-xs font-bold rounded-lg uppercase hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button className="flex-1 h-11 bg-red-500 text-white text-xs font-bold rounded-lg uppercase shadow-lg shadow-red-500/20 active:scale-95 transition-all">
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalStates.trashed} onClose={() => toggleModal("trashed", false)} title="Trashed Orders List" maxWidth="max-w-[1400px]">
        <div className="space-y-6">
          <div className="flex items-end gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div className="w-64">
              <ModalInput label="Tracking ID #" placeholder="Tracking ID #" />
            </div>
            <div className="w-64">
              <ModalInput label="Rider" placeholder="Please Select a rider" type="select" />
            </div>
            <button className="h-11 px-10 bg-primary text-white text-[11px] font-bold rounded-lg uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2">
              <RotateCcw size={14} />
              Restore
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
                <select className="h-8 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
                  <option>10</option>
                </select>
                <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="p-4 w-10">
                      <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                    </th>
                    {["AWB ID", "Client Name", "Customer Name", "Customer Number", "Amount", "Reference ID", "Service", "Weight", "Order Time & Date", "Exp. Delivery Date", "Rider"].map((h) => (
                      <th key={h} className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[10px] font-medium text-slate-600">
                  {[
                    { id: "KHI10936275", client: "Sindhi.Bazar", name: "Ayan ali", number: "03353721798", amount: "2000", ref: "Clothing", service: "Main Cities Service", weight: "0.50 Kg", date: "2025-10-04 18:55", exp: "2025-10-07" },
                    { id: "RWP10935360", client: "Oriza food & Beverages", name: "Squadron Leader Tanveer Hayat", number: "03204156872", amount: "3500", ref: "Oriza Stevia Drops 10 Pack Clear", service: "Main Cities Service", weight: "1.00 Kg", date: "2025-10-04 10:03", exp: "2025-10-07" },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/30">
                      <td className="p-4">
                        <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-primary font-bold">{row.id}</span>
                          <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[8px] font-black uppercase w-fit mt-1">Draft</span>
                        </div>
                      </td>
                      <td className="p-4">{row.client}</td>
                      <td className="p-4">{row.name}</td>
                      <td className="p-4">{row.number}</td>
                      <td className="p-4">{row.amount}</td>
                      <td className="p-4">{row.ref}</td>
                      <td className="p-4">{row.service}</td>
                      <td className="p-4">{row.weight}</td>
                      <td className="p-4">{row.date}</td>
                      <td className="p-4">{row.exp}</td>
                      <td className="p-4"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalStates.pickup} onClose={() => toggleModal("pickup", false)} title="Send Pickup Request" maxWidth="max-w-4xl">
        <div className="space-y-4">
          <ModalInput label="Client" placeholder="Please Select a client" type="select" />
          <ModalInput label="Pickup Location" placeholder="Pickup Location" type="select" />
          <ModalInput label="Request Title" placeholder="Orders Pickup Request" />
          <ModalInput label="Description" placeholder="Please Pickup Orders From Our warehouse" type="textarea" />
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button onClick={() => toggleModal("pickup", false)} className="h-11 px-10 border border-primary text-primary text-[11px] font-bold rounded-lg uppercase hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button className="h-11 px-10 bg-primary text-white text-[11px] font-bold rounded-lg uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all">
              Send
            </button>
          </div>
        </div>
      </Modal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <OrderFilter label="AWB ID" placeholder="Enter AWB ID" />
          <OrderFilter label="Reference ID" placeholder="Enter Reference ID" />
          <OrderFilter label="Client Name" placeholder="Select Name" type="select" />
          <OrderFilter label="Date (To)" placeholder="" type="date" />
          <OrderFilter label="City" placeholder="Select City" type="select" />
          <OrderFilter label="Assign Date (From)" placeholder="" type="date" />
          <OrderFilter label="Assign Date (To)" placeholder="" type="date" />
          <OrderFilter label="Rider" placeholder="Select Rider" type="select" />
          <OrderFilter label="Status" placeholder="Select Status" type="select" />
          <div className="md:col-span-3 pt-2">
            <Button className="w-full h-10 font-bold bg-primary text-white shadow-md">Search</Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <OrderFilter label="Tracking Numbers" placeholder="Enter Tracking Numbers" />
          <OrderFilter label="Rollcart Number" placeholder="Enter Rollcart Number" />
          <OrderFilter label="Status" placeholder="Select Status" type="select" />
          <Button className="w-full h-10 font-bold bg-primary text-white shadow-md">Search</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
              <select className="h-8 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
                <option>50</option>
              </select>
              <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="h-8 px-4 text-[10px] font-bold bg-primary text-white">
                Select All
              </Button>
              <Button variant="outline" className="h-8 px-4 text-[10px] font-bold bg-primary text-white">
                Deselect All
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button className="h-8 px-4 bg-green-500 text-white text-[10px] font-bold rounded uppercase">Finalize</button>
              <button className="h-8 px-4 bg-primary text-white text-[10px] font-bold rounded uppercase">Cancel</button>
            </div>
            <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Search:</span>
              <input type="text" className="h-8 border border-slate-200 rounded px-3 text-xs focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                {tableHeaders.map((header) => (
                  <th key={header} className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={15} className="py-20 text-center text-slate-300 italic text-sm font-medium">
                  Showing 0 to 0 of 0 entries
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
