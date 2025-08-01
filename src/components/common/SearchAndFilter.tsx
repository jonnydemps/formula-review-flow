import React from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  resultCount?: number;
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  resultCount,
  showAdvanced = false,
  onToggleAdvanced,
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'quote_requested', label: 'Quote Requested' },
    { value: 'quote_provided', label: 'Quote Provided' },
    { value: 'paid', label: 'Paid' },
    { value: 'completed', label: 'Completed' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'updated_at', label: 'Last Updated' },
    { value: 'original_filename', label: 'File Name' },
    { value: 'status', label: 'Status' },
    { value: 'quote_amount', label: 'Quote Amount' },
  ];

  const clearAllFilters = () => {
    onSearchChange('');
    onStatusFilterChange('all');
    onSortChange('created_at');
    onSortOrderChange('desc');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || sortBy !== 'created_at' || sortOrder !== 'desc';

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by filename, customer name, or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3"
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {resultCount !== undefined && (
            <Badge variant="secondary" className="text-xs">
              {resultCount} result{resultCount !== 1 ? 's' : ''}
            </Badge>
          )}
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="outline" className="text-xs">
              Search: "{searchQuery}"
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="outline" className="text-xs">
              Status: {statusOptions.find(opt => opt.value === statusFilter)?.label}
              <button
                onClick={() => onStatusFilterChange('all')}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;