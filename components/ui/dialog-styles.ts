export const dialogLabelClass =
  "text-[10px] font-black text-slate-400 uppercase tracking-widest";

export const dialogInputClass =
  "w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-300";

export const dialogErrorClass =
  "p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium";

export const dialogFileInputClass =
  "w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-white file:font-bold file:uppercase file:text-[10px]";

export const dialogMaxWidthClass = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
} as const;

export type DialogMaxWidth = keyof typeof dialogMaxWidthClass;
