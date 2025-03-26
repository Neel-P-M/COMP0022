// Updated page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';

type PatternAnalysis = {
  genre: string;
  avg_rating: number | null;
};

export default function AudienceRatingPatternsPage() {
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [comparison, setComparison] = useState<'over' | 'under'>('over');
  const [threshold, setThreshold] = useState<number>(3.0);
  const [patternData, setPatternData] = useState<PatternAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    setGenres(['Action', 'Adventure', 'Animation', 'Children', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Fantasy', 'Film-Noir', 'Horror', 'IMAX', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western']);
  }, []);

  const fetchPatternData = async () => {
    if (!selectedGenre) {
      setError('Please select a genre');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/audience_analysis?genre=${selectedGenre}&comparison=${comparison}&threshold=${threshold}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const json = await res.json();
      const parsedData: PatternAnalysis[] = Object.keys(json.audiencePatterns).map((key) => ({
        genre: key,
        avg_rating: json.audiencePatterns[key],
      }));
      setPatternData(parsedData);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(`Failed to load pattern analysis: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const columnHelper = createColumnHelper<PatternAnalysis>();
  const columns = useMemo(() => [
    columnHelper.accessor('genre', {
      header: 'Genre',
      cell: info => <span className="font-bold text-gray-900">{info.getValue()}</span>,
    }),
    columnHelper.accessor('avg_rating', {
      header: 'Average Rating',
      cell: info => info.getValue() !== null ? info.getValue()?.toFixed(2) : 'N/A',
    }),
  ], [columnHelper]);

  const table = useReactTable({
    data: patternData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#e4c9a3]">Audience Rating Patterns</h1>

      <div className="flex flex-wrap gap-4 justify-center mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Select Genre</label>
          <select
            className="border rounded-lg p-2 w-40 text-black"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">-- Genre --</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Comparison</label>
          <select
            className="border rounded-lg p-2 w-24 text-black"
            value={comparison}
            onChange={(e) => setComparison(e.target.value as 'over' | 'under')}
          >
            <option value="over">Over</option>
            <option value="under">Under</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Threshold (1.5 - 4.5)</label>
          <input
            type="number"
            min="1.5"
            max="4.5"
            step="0.1"
            className="border rounded-lg p-2 w-24 text-black"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
          />
        </div>

        <div className="flex items-end">
          <button
            className="bg-[#e4c9a3] text-black px-4 py-2 rounded-lg hover:bg-[#d4b28b]"
            onClick={fetchPatternData}
          >
            Analyze
          </button>
        </div>
      </div>

      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}

      {!loading && patternData.length > 0 && (
        <section className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b border-gray-200 text-gray-800 text-center">
            Genre Rating Tendencies
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-800">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="divide-x divide-gray-600">
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider cursor-pointer text-left"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row, i) => (
                  <tr key={row.id} className={`divide-x divide-gray-200 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
