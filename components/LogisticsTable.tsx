'use client';

import { useState, useEffect } from 'react';
import { Edit2, X, Check, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface ContainerRecord {
  Inv_Number: string;
  Container_Id: string | null;
  Delivery_Notes: string | null;
  Shippining_Line: string | null;
}

interface EditingState {
  invNumber: string | null;
  value: string;
}

export default function LogisticsTable() {
  const [records, setRecords] = useState<ContainerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState>({
    invNumber: null,
    value: '',
  });
  const [saving, setSaving] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch records on component mount
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      const response = await fetch('/api/logistics');
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

  const startEditing = (invNumber: string, currentValue: string | null) => {
    setEditing({
      invNumber,
      value: currentValue || '',
    });
    setValidationError(null);
    setSuccessMessage(null);
  };

  const cancelEditing = () => {
    setEditing({ invNumber: null, value: '' });
    setValidationError(null);
  };

  const validateContainerId = (value: string): string | null => {
    if (!value.trim()) {
      return 'Container_Id cannot be empty';
    }
    return null;
  };

  const handleSave = async (invNumber: string, containerId: string) => {
    // Validate the field
    const validationErr = validateContainerId(containerId);
    if (validationErr) {
      setValidationError(validationErr);
      return;
    }

    setSaving(invNumber);
    setValidationError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/logistics', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Inv_Number: invNumber,
          Container_Id: containerId.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Remove the updated record from the list (since Container_Id is no longer NULL)
        setRecords((prevRecords) =>
          prevRecords.filter((record) => record.Inv_Number !== invNumber)
        );
        setSuccessMessage(`Container_Id "${containerId.trim()}" saved successfully for Invoice ${invNumber}`);
        cancelEditing();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setValidationError(result.error || 'Failed to update record');
      }
    } catch (err) {
      setValidationError('Network error: Failed to save changes');
      console.error(err);
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Container_Id
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery_Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inv_Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shippining_Line
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => {
                const isEditing = editing.invNumber === record.Inv_Number;
                const isSaving = saving === record.Inv_Number;

                return (
                  <tr
                    key={record.Inv_Number}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Container_Id - Editable */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={editing.value}
                            onChange={(e) =>
                              setEditing({ ...editing, value: e.target.value })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            placeholder="Enter Container_Id"
                          />
                          {validationError && (
                            <p className="text-xs text-red-600">{validationError}</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-red-600 font-medium">
                          <span className="italic text-gray-400">Missing</span>
                        </div>
                      )}
                    </td>

                    {/* Delivery_Notes - Read-only */}
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.Delivery_Notes || (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>

                    {/* Inv_Number - Read-only */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.Inv_Number}
                    </td>

                    {/* Shippining_Line - Read-only */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.Shippining_Line || (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleSave(record.Inv_Number, editing.value)
                            }
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
                        <button
                          onClick={() =>
                            startEditing(record.Inv_Number, record.Container_Id)
                          }
                          className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200"
                          title="Edit Container_Id"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-500 text-center">
        Showing {records.length} record{records.length !== 1 ? 's' : ''} with missing Container_Id
      </div>
    </div>
  );
}
