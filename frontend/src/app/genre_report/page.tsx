'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  flexRender,
  createColumnHelper,
  SortingState 
} from '@tanstack/react-table';

type GenreDistribution = {
  genre_name: string;
  movie_count: number;
  avg_rating: number;
  viewer_count: number;
};

type GenrePolarization = {
  genre_name: string;
  avg_rating: number;
  rating_std_dev: number;
  min_rating: number;
  max_rating: number;
};

type AnalysisData = {
  genre_distribution: GenreDistribution[];
  genre_polarization: GenrePolarization[];
};

export default function GenreReportPage() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // TanStack Table sorting states
  const [distSorting, setDistSorting] = useState<SortingState>([
    { id: 'avg_rating', desc: true }
  ]);
  const [polSorting, setPolSorting] = useState<SortingState>([
    { id: 'rating_std_dev', desc: true }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/genre_analysis');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching genre analysis data:', err);
        setError('Failed to load genre analysis data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Column helpers
  const distributionColumnHelper = createColumnHelper<GenreDistribution>();
  const polarizationColumnHelper = createColumnHelper<GenrePolarization>();

  // Distribution table columns
  const distributionColumns = useMemo(() => [
    distributionColumnHelper.accessor('genre_name', {
      header: 'Genre',
      cell: info => (
        <span className="font-bold text-gray-900">{info.getValue()}</span>
      ),
    }),
    distributionColumnHelper.accessor('avg_rating', {
      header: 'Average Rating',
      cell: info => (
        <span>{info.getValue().toFixed(2)}</span>
      ),
    }),
    distributionColumnHelper.accessor('viewer_count', {
      header: 'Viewer Count',
      cell: info => info.getValue(),
    }),
  ], [distributionColumnHelper]);

  // Polarization table columns
  const polarizationColumns = useMemo(() => [
    polarizationColumnHelper.accessor('genre_name', {
      header: 'Genre',
      cell: info => (
        <span className="font-bold text-gray-900">{info.getValue()}</span>
      ),
    }),
    polarizationColumnHelper.accessor('rating_std_dev', {
      header: 'Standard Deviation',
      cell: info => {
        const value = info.getValue();
        return (
          <span>
            {value.toFixed(2)}
          </span>
        );
      },
    }),
    polarizationColumnHelper.accessor('avg_rating', {
      header: 'Average Rating',
      cell: info => info.getValue().toFixed(2),
    }),
    polarizationColumnHelper.accessor('min_rating', {
      header: 'Min Rating',
      cell: info => info.getValue().toFixed(1),
    }),
    polarizationColumnHelper.accessor('max_rating', {
      header: 'Max Rating',
      cell: info => info.getValue().toFixed(1),
    }),
  ], [polarizationColumnHelper]);

  // Distribution table instance
  const distributionTable = useReactTable({
    data: data?.genre_distribution || [],
    columns: distributionColumns,
    state: {
      sorting: distSorting,
    },
    onSortingChange: setDistSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Polarization table instance
  const polarizationTable = useReactTable({
    data: data?.genre_polarization || [],
    columns: polarizationColumns,
    state: {
      sorting: polSorting,
    },
    onSortingChange: setPolSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) return <div>Loading genre analysis data...</div>;
  if (error) return <div>{error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-[#e4c9a3]">Movie Festival Genre Analysis</h1>

      {/* Genre Distribution Section */}
      <section className="mb-10 bg-white rounded-lg shadow-md overflow-hidden">
      <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b border-gray-200 text-gray-800 text-center">
        Genre Distribution
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-800">
            {distributionTable.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="divide-x divide-gray-600">
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    scope="col" 
                    className={`px-6 py-3 text-xs font-medium text-white uppercase tracking-wider cursor-pointer ${
                      header.id !== 'genre_name' ? 'text-right' : 'text-left'
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: ' ↑',
                      desc: ' ↓',
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {distributionTable.getRowModel().rows.map((row, i) => (
              <tr 
                key={row.id} 
                className={`divide-x divide-gray-200 hover:bg-gray-200 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}
              >
                {row.getVisibleCells().map((cell, cellIndex) => (
                  <td 
                    key={cell.id}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      cellIndex !== 0 ? 'text-gray-500 text-right' : ''
                    }`}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
      
      {/* Genre Polarization Section */}
      <section className="mb-10 bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b border-gray-200 text-gray-800 text-center">
          Genre Polarization Analysis
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800">
              {polarizationTable.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="divide-x divide-gray-600">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id}
                      scope="col" 
                      className={`px-6 py-3 text-xs font-medium text-white uppercase tracking-wider cursor-pointer ${
                        header.id !== 'genre_name' ? 'text-right' : 'text-left'
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' ↑',
                        desc: ' ↓',
                      }[header.column.getIsSorted() as string] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {polarizationTable.getRowModel().rows.map((row, i) => (
                <tr 
                  key={row.id} 
                  className={`divide-x divide-gray-200 hover:bg-gray-200 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <td 
                      key={cell.id}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        cellIndex !== 0 ? 'text-gray-500 text-right' : ''
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}