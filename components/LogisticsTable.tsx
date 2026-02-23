'use client';

import { useState, useEffect } from 'react';
import { Edit2, X, Check, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface ContainerRecord {
  ID: number;             
  Inv_Number: string;
  Container_Id: string | null;
  Delivery_Notes: string | null;
  Shippining_Line: string | null;
}

interface EditingState {
  id: number | null;
  value: string;
}

export default function LogisticsTable({ type = 'missing' }: { type?: 'missing' | 'all' }) 
 {
  const [records, setRecords] = useState<ContainerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  {/*const [editing, setEditing] = useState<EditingState>({invNumber: null,value: '',});*/}
  {/*const [saving, setSaving] = useState<string | null>(null);*/}
  const [saving, setSaving] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  {/*const [editingNotes, setEditingNotes] = useState({invNumber: null,value: ''});*/}
  const [editingNotes, setEditingNotes] = useState<{invNumber: string | null, value: string}>({invNumber: null,value: ''});
  const startEditingNotes = (invNumber: string, value: string | null) => {setEditingNotes({invNumber, value: value || '',});}; 
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  {/*const filteredRecords =
  type === 'all'

    ? records.filter((record) =>
        record.Inv_Number?.toString().toLowerCase().includes(search.toLowerCase())
      )     
    : records; */}
  const filteredRecords =
  type === 'all'
    ? search.trim() === ''
      ? records
      : records.filter(
          (record) => record.Inv_Number?.toString() === search.trim()
        )
    : records;

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = (a as any)[sortColumn];
    const bValue = (b as any)[sortColumn];

    // ✅ number sorting
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }

    // ✅ string sorting (fallback)
    const aStr = String(aValue ?? '').toLowerCase();
    const bStr = String(bValue ?? '').toLowerCase();

    if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
    if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

const [editing, setEditing] = useState<{
  id: number | null;
  Inv_Number: string;
  Container_Id: string;
  Delivery_Notes: string;
  Shipping_Line: string;
}>({
  id: null,
  Inv_Number: '',
  Container_Id: '',
  Delivery_Notes: '',
  Shipping_Line: ''
});

const handleSort = (column: string) => {
  if (sortColumn === column) {
    // toggle direction
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortColumn(column);
    setSortDirection('asc');
  }
};

const handleDelete = async (id: number) => {
const confirmDelete = confirm("Are you sure you want to permanently delete this record?");
  if (!confirmDelete) return;
  try {
    const response = await fetch('/api/logistics', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ID: id }),
    });
    const result = await response.json();
    if (result.success) {
      setSuccessMessage("Record deleted successfully");
      fetchRecords();
    }

  } catch (e) {
    console.error(e);
  }
};
  // Fetch records on component mount
  useEffect(() => {
    console.log("Current Type:", type);
    fetchRecords();
  }, [type]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      const response = await fetch(`/api/logistics?type=${type}`);
      const result = await response.json();

      if (result.success) {
        setRecords(result.data);
      } else {
        setError(result.error || 'Failed to fetch records');
      }
    } catch (err) {
      setError('Network error: Failed to fetch records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


 
  const startEditing = (record: ContainerRecord) => {
    if (editing.id && editing.id !== record.ID) {
      alert("Finish editing current row first");
      return;
    }

    setEditing({
      id: record.ID,
      Inv_Number: record.Inv_Number,
      Container_Id: record.Container_Id || '',
      Delivery_Notes: record.Delivery_Notes || '',
      Shipping_Line: record.Shippining_Line || ''
    });
  };

  {/*const cancelEditing = () => {
    setEditing({ invNumber: null, value: '' });
    setValidationError(null);
  };*/}

  const cancelEditing = () => {
    setEditing({
      id : null,
      Container_Id: '',
      Delivery_Notes: '',
      Shipping_Line: '',
      Inv_Number: ''
    });
    setValidationError(null);
  };


  const validateContainerId = (value: string): string | null => {
    if (!value.trim()) {
      return 'Container_Id cannot be empty';
    }
    return null;
  };

    const handleSave = async () => {

    if (!editing.id) return;

    const validationErr = validateContainerId(editing.Container_Id);
    if (validationErr) {
      setValidationError(validationErr);
      return;
    }

    setSaving(editing.id);

    try {
      const response = await fetch('/api/logistics', {
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify({
            ID: editing.id,
            Inv_Number: editing.Inv_Number,
            Container_Id: editing.Container_Id,
            Delivery_Notes: editing.Delivery_Notes,
            Shipping_Line: editing.Shipping_Line
          }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Row updated successfully");

        // refresh table
        fetchRecords();

        cancelEditing();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600">Loading records...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchRecords}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <p className="text-lg font-medium">No records with missing Container_Id found.</p>
        <p className="text-sm mt-2">All records are complete!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-800 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}
      {/* Search Input - Only for ALL records */}
      {type === 'all' && (
        <div className="ml-20 w-40 bg-white p-3 rounded-lg border">
          <input
            type="text"
            placeholder="Search Bar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      )}
      <div className="ml-20 w-90 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                <th className="px-3 py-2 whitespace-nowrap text-sm text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                {/*<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Container_Id
                </th>*/}
                <th
                  onClick={() => handleSort('Container_Id')}
                  className="cursor-pointer px-3 py-2 whitespace-nowrap text-sm text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Container_Id
                </th>

                <th className="px-3 py-2 whitespace-nowrap text-sm text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery_Notes
                </th>
                <th className="px-3 py-2 whitespace-nowrap text-sm text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inv_Number
                </th>
                <th className="px-3 py-2 whitespace-nowrap text-sm  text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shippining_Line
                </th>
                {type === 'missing' && (
                <th className="px-3 py-2 whitespace-nowrap text-sm text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
               {/*filteredRecords.map((record) => {*/}
               {sortedRecords.map((record) => {
                const isEditing = editing.id === record.ID;
                const isSaving = saving === record.ID;
                {/*const isEditingNotes = editingNotes.invNumber === record.Inv_Number;*/}
                return (
                  <tr
                    key={record.Inv_Number}
                    className="hover:bg-gray-50 transition-colors">
                      {/* ID - Read-only */}
                      <td className="px-2 py-1 text-sm text-gray-900">
                          {type === 'all' ? (
                            record.ID || <span className="text-gray-400 italic">-</span>
                          ) : (
                            isEditing ? (
                              <input
                                type="text"
                                value={record.ID}
                                className="w-full px-2 py-1 border rounded"
                              />
                            ) : (
                              record.ID || <span className="text-gray-400 italic">-</span>
                            )
                          )}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm">
                        {/* SHOW ALL PAGE → Always show actual value */}
                        {type === 'all' ? (
                          record.Container_Id ? (
                            <span className="font-medium text-gray-900">
                              {record.Container_Id}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )
                        ) : (
                          /* MISSING PAGE (Editable Mode) */
                            isEditing ? (
                                <input
                                  type="text"
                                  value={editing.Container_Id}
                                  onChange={(e) =>
                                    setEditing(prev => ({ ...prev, Container_Id: e.target.value }))
                                  }
                                  className="w-full px-2 py-1 border rounded"
                                />
                            ) : (
                              <span className="italic text-gray-400">Missing</span>
                            )
                        )}
                      </td>
                    {/* Delivery_Notes - Read-only */}
                      <td className="px-2 py-1 text-sm text-gray-900">
                          {type === 'all' ? (
                            record.Delivery_Notes || <span className="text-gray-400 italic">-</span>
                          ) : (
                            isEditing ? (
                              <input
                                type="text"
                                value={editing.Delivery_Notes}
                                onChange={(e) =>
                                  setEditing(prev => ({ ...prev, Delivery_Notes: e.target.value }))
                                }
                                className="w-full px-2 py-1 border rounded"
                              />
                            ) : (
                              record.Delivery_Notes || <span className="text-gray-400 italic">-</span>
                            )
                          )}
                      </td>
                    {/* Inv_Number - Read-only */}
                    <td className="px-2 py-1 whitespace-nowrap text-sm">
                        {type === 'all' ? (
                          record.Inv_Number
                        ) : (
                          isEditing ? (
                              <input
                                type="text"
                                value={editing.Inv_Number}
                                onChange={(e) =>
                                  setEditing(prev => ({ ...prev, Inv_Number: e.target.value }))
                                }
                                className="w-full px-2 py-1 border rounded"
                              />
                          ) : (
                            record.Inv_Number
                          )
                        )}
                    </td>

                    {/* Shippining_Line - Read-only */}
                    <td className="px-2 py-1 whitespace-nowrap text-sm">
                        {type === 'all' ? (
                          record.Shippining_Line || '-'
                        ) : (
                          isEditing ? (
                            <input
                              type="text"
                              value={editing.Shipping_Line}
                              onChange={(e)=>
                                setEditing(prev => ({...prev, Shipping_Line:e.target.value}))
                              }
                              className="w-full px-2 py-1 border rounded"
                            />
                          ) : (
                            record.Shippining_Line || '-'
                          )
                        )}
                    </td>
                    
                    {/* Actions */}
                    {type === 'missing' && (
                    <td className="px-2 py-1 whitespace-nowrap text-sm">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                            title="Save"
                          >
                            {isSaving ? (
                              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={isSaving}
                            className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                          <div className="flex items-center gap-2">
                            {/* EDIT BUTTON */}
                            <button
                              onClick={() =>
                                startEditing(record)
                              }
                              className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200"
                              title="Edit Container_Id"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button> 
                            {/* DELETE BUTTON */}
                            <button
                              onClick={() => handleDelete(record.ID)}
                              className="flex items-center gap-1 px-3 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded border border-red-200"
                              title="Delete"
                            >
                              Delete
                            </button>  
                        </div>                     
                      )}
                    </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-500 text-center">
        Showing {filteredRecords.length} record{records.length !== 1 ? 's' : ''} with missing Container_Id
      </div>
    </div>
  );
}
