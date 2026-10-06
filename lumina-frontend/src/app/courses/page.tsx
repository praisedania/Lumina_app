'use client';

import React, { useState } from 'react';
import { usePublicCourses } from '@/hooks/useCourses';
import CourseGrid from '@/components/courses/CourseGrid';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Footer from '@/components/layout/Footer';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Technology',
  'Software Engineering',
  'Design',
  'Business',
  'Data Science',
  'Productivity',
];

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'title'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(1);

  // Compute min/max price bounds based on selected filter
  const priceParams =
    priceFilter === 'free'
      ? { minPrice: 0, maxPrice: 0 }
      : priceFilter === 'paid'
      ? { minPrice: 0.01 }
      : {};

  const queryParams = {
    search: activeSearch || undefined,
    category: selectedCategory !== 'All' ? selectedCategory : undefined,
    sortBy,
    sortOrder,
    page,
    limit: 9,
    ...priceParams,
  };

  const { data, isLoading } = usePublicCourses(queryParams);

  const courses = data?.courses || [];
  const enrolledCourseIds = data?.enrolledCourseIds || [];
  const pagination = data?.pagination;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
    setPage(1);
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setActiveSearch('');
    setSelectedCategory('All');
    setPriceFilter('all');
    setSortBy('createdAt');
    setSortOrder('DESC');
    setPage(1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200/80 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Badge variant="default" className="mb-2">
              Explore Lumina Catalog
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Discover Courses & Communities
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Browse instructor-led courses with unrestricted lesson orders. Enroll in one click and participate in live course rooms.
            </p>
          </div>

          {/* Search Bar Form */}
          <form onSubmit={handleSearchSubmit} className="mt-8 flex gap-3 max-w-xl">
            <Input
              placeholder="Search courses by title or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              rightIcon={
                searchTerm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setActiveSearch('');
                    }}
                    className="hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : undefined
              }
              className="h-11 rounded-xl shadow-2xs"
            />
            <Button type="submit" variant="primary" size="md" className="h-11 px-5 shrink-0">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Filter & Sort Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200/60 mb-8">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Price & Sort Selects */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Price Filter */}
            <select
              value={priceFilter}
              onChange={(e) => {
                setPriceFilter(e.target.value as any);
                setPage(1);
              }}
              className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 shadow-2xs"
            >
              <option value="all">All Prices</option>
              <option value="free">Free Courses</option>
              <option value="paid">Paid Courses</option>
            </select>

            {/* Sort Select */}
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('_');
                setSortBy(sb as any);
                setSortOrder(so as any);
                setPage(1);
              }}
              className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 shadow-2xs"
            >
              <option value="createdAt_DESC">Newest First</option>
              <option value="createdAt_ASC">Oldest First</option>
              <option value="price_ASC">Price: Low to High</option>
              <option value="price_DESC">Price: High to Low</option>
              <option value="title_ASC">Title: A-Z</option>
            </select>
          </div>
        </div>

        {/* Results summary */}
        {activeSearch && (
          <div className="flex items-center gap-2 mb-6 text-sm text-slate-600">
            <span>Showing results for &ldquo;<strong>{activeSearch}</strong>&rdquo;</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveSearch('');
              }}
              className="text-xs text-indigo-600 hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Course Grid */}
        <CourseGrid
          courses={courses}
          enrolledCourseIds={enrolledCourseIds}
          isLoading={isLoading}
          onResetFilters={resetAllFilters}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-10 border-t border-slate-200/60 mt-10">
            <p className="text-xs text-slate-500">
              Showing page <span className="font-semibold text-slate-700">{pagination.currentPage}</span> of{' '}
              <span className="font-semibold text-slate-700">{pagination.totalPages}</span> ({pagination.totalCourses} total courses)
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
