'use client';

import { useEffect, useState } from 'react';
import LayoutClient from '@/components/LayoutClient';

export default function ContainerHistoryPage() {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/container-history')
      .then(res => res.json())
      .then(r => setData(r.data || []));
  }, []);

  const filteredData = data.filter(row =>
  row.container_id?.toString().toLowerCase().includes(search.toLowerCase())
);

return (

  <div className="space-y-4">
          {/* SEARCH */}
      <div className="ml-20 w-60 bg-white p-3 rounded-lg border">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="mt-0 ml-20 w-90  bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">

          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                {data[0] && Object.keys(data[0]).map(col => (
                  <th key={col} className="px-3 py-2 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  {Object.values(row).map((v, j) => (
                    <td key={j} className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      {String(v ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
</div>
);
}