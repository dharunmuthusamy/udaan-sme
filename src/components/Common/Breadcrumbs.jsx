import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Map of URL segments to readable labels
  const breadcrumbMap = {
    dashboard: 'Dashboard',
    sales: 'Sales',
    invoices: 'Invoices',
    quotations: 'Quotations',
    orders: 'Orders',
    inventory: 'Inventory',
    crm: 'Customers',
    staff: 'Staff',
    tasks: 'Tasks',
    attendance: 'Attendance',
    analytics: 'Analytics',
    profile: 'Business Profile',
    create: 'New',
    add: 'Add New',
    edit: 'Edit',
    detail: 'Details',
  };

  const getLabel = (segment) => {
    // Check if it's a known segment
    if (breadcrumbMap[segment.toLowerCase()]) {
      return breadcrumbMap[segment.toLowerCase()];
    }
    // If it's a UUID or unknown ID, show 'Details' or capitalised segment
    if (/^[0-9a-fA-F-]{24,}$/.test(segment) || /^[0-9]+$/.test(segment)) {
      return 'Details';
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-xs font-bold text-surface-500 hover:text-primary-600 transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Dashboard
          </Link>
        </li>
        {pathnames.map((value, index) => {
          if (value.toLowerCase() === 'dashboard') return null;
          
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return (
            <li key={to}>
              <div className="flex items-center">
                <svg className="h-4 w-4 text-surface-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {last ? (
                  <span className="ml-1 text-xs font-black text-surface-900 md:ml-2">
                    {getLabel(value)}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="ml-1 text-xs font-bold text-surface-500 hover:text-primary-600 transition-colors md:ml-2"
                  >
                    {getLabel(value)}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
