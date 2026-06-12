import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  icon?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <header className="border-b border-card-border pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon || <img src="/logo.png" alt="ResoLogix Logo" className="w-8 h-8 rounded-lg shadow shadow-cyan-500/10 object-contain animate-pulse" />}
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-text-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10px] text-text-secondary mt-0.5 font-bold uppercase tracking-wider">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      <Link 
        href="/" 
        className="flex items-center gap-2 p-2 hover:bg-card-border/50 rounded-lg transition-colors cursor-pointer group shrink-0 self-start md:self-auto"
        title="Go Back"
      >
        <ArrowLeft className="w-6 h-6 text-text-muted group-hover:text-cyan-400" />
        <span className="text-sm font-bold text-text-muted group-hover:text-cyan-400">Back</span>
      </Link>
    </header>
  );
}
