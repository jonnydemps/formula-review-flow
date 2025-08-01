import React, { useState, useMemo } from 'react';
import { Formula } from '@/types/formula';

// Utility functions for filtering and searching
export const useFormulaFilters = (formulas: Formula[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedFormulas = useMemo(() => {
    let filtered = [...formulas];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((formula) => {
        const filename = formula.original_filename?.toLowerCase() || '';
        const customerName = formula.profiles?.name?.toLowerCase() || '';
        const customerEmail = formula.profiles?.email?.toLowerCase() || '';
        
        return (
          filename.includes(query) ||
          customerName.includes(query) ||
          customerEmail.includes(query)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((formula) => formula.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        case 'original_filename':
          aValue = a.original_filename?.toLowerCase() || '';
          bValue = b.original_filename?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'quote_amount':
          aValue = a.quote_amount || 0;
          bValue = b.quote_amount || 0;
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [formulas, searchQuery, statusFilter, sortBy, sortOrder]);

  return {
    filteredFormulas: filteredAndSortedFormulas,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resultCount: filteredAndSortedFormulas.length,
    totalCount: formulas.length,
  };
};

// Status-based filtering utilities
export const getStatusCounts = (formulas: Formula[]) => {
  const counts = {
    all: formulas.length,
    pending_review: 0,
    quote_requested: 0,
    quote_provided: 0,
    paid: 0,
    completed: 0,
  };

  formulas.forEach((formula) => {
    if (counts.hasOwnProperty(formula.status)) {
      counts[formula.status as keyof typeof counts]++;
    }
  });

  return counts;
};

// Date range filtering
export const useDateRangeFilter = (formulas: Formula[], dateField: keyof Formula = 'created_at') => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const filteredFormulas = useMemo(() => {
    if (!startDate && !endDate) return formulas;

    return formulas.filter((formula) => {
      const date = new Date(formula[dateField] as string);
      
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      
      return true;
    });
  }, [formulas, startDate, endDate, dateField]);

  return {
    filteredFormulas,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  };
};

// Advanced search utilities
export const useAdvancedSearch = (formulas: Formula[]) => {
  const [filters, setFilters] = useState({
    filename: '',
    customerName: '',
    customerEmail: '',
    status: 'all',
    hasQuote: 'all', // all, yes, no
    dateRange: { start: null as Date | null, end: null as Date | null },
  });

  const filteredFormulas = useMemo(() => {
    return formulas.filter((formula) => {
      // Filename filter
      if (filters.filename && !formula.original_filename?.toLowerCase().includes(filters.filename.toLowerCase())) {
        return false;
      }

      // Customer name filter
      if (filters.customerName && !formula.profiles?.name?.toLowerCase().includes(filters.customerName.toLowerCase())) {
        return false;
      }

      // Customer email filter
      if (filters.customerEmail && !formula.profiles?.email?.toLowerCase().includes(filters.customerEmail.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && formula.status !== filters.status) {
        return false;
      }

      // Quote filter
      if (filters.hasQuote === 'yes' && !formula.quote_amount) {
        return false;
      }
      if (filters.hasQuote === 'no' && formula.quote_amount) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const date = new Date(formula.created_at);
        if (filters.dateRange.start && date < filters.dateRange.start) return false;
        if (filters.dateRange.end && date > filters.dateRange.end) return false;
      }

      return true;
    });
  }, [formulas, filters]);

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      filename: '',
      customerName: '',
      customerEmail: '',
      status: 'all',
      hasQuote: 'all',
      dateRange: { start: null, end: null },
    });
  };

  return {
    filteredFormulas,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters: Object.values(filters).some(value => 
      value !== 'all' && value !== '' && value !== null && 
      !(typeof value === 'object' && value.start === null && value.end === null)
    ),
  };
};