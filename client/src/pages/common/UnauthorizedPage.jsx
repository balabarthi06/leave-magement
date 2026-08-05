import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-100 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h1>
        <p className="text-xs text-slate-500">
          You do not have administrative permissions to view this section.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Authorized Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
