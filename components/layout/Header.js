'use client';

import { useState } from 'react';

export default function Header({ title, count, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
    // Toggle overlay
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
      overlay.classList.toggle('hidden');
    }
  };

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-cream-dark transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Page title — Akaru style with count superscript */}
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
              {title}
              {count !== undefined && (
                <sup className="text-base font-normal text-text-muted ml-1">
                  {count}
                </sup>
              )}
            </h1>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {children}
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        id="sidebar-overlay"
        className="hidden fixed inset-0 bg-black/30 z-30 lg:hidden"
        onClick={toggleSidebar}
      />
    </header>
  );
}
