import React, { useState } from 'react';
import { previewImport, confirmImport } from '../lib/api';

export default function BulkImport() {
  const [step, setStep] = useState('upload'); // upload | preview | done
  const [preview, setPreview] = useState(null);
  const [rows, setRows] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await previewImport(fd);
      setPreview(data);
      setRows(
        data.results.map((r) => ({
          action: r.matchedContact ? 'merge' : 'create',
          matchedContactId: r.matchedContact?.id || null,
          data: r.row,
        }))
      );
      setStep('preview');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAction = (i, action) => {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, action } : r)));
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await confirmImport(rows);
      setResult(data);
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Bulk Import</h1>

      {step === 'upload' && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-10 text-center space-y-4">
          <p className="text-4xl">📥</p>
          <p className="font-medium text-gray-700">Upload a CSV file to import contacts</p>
          <p className="text-sm text-gray-400">
            Supports columns: name, email, phone, tags, notes. Duplicates detected by name or email.
          </p>
          <label className="inline-block cursor-pointer bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
            Choose CSV File
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
          {loading && <p className="text-sm text-gray-500">Parsing...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="text-left mt-4 bg-gray-50 rounded-lg p-4 text-xs text-gray-500">
            <p className="font-medium mb-1">CSV format example:</p>
            <code>name,email,phone,tags,notes</code>
            <br />
            <code>Jane Smith,jane@example.com,555-1234,"friend,work",Met at conference</code>
          </div>
        </div>
      )}

      {step === 'preview' && preview && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Found <strong>{preview.count}</strong> rows. Review and confirm:
          </p>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Email</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Match</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.results.map((item, i) => (
                  <tr key={i} className={item.matchedContact ? 'bg-amber-50' : ''}>
                    <td className="px-4 py-2">{item.parsedName}</td>
                    <td className="px-4 py-2 text-gray-500">{item.parsedEmail || '—'}</td>
                    <td className="px-4 py-2">
                      {item.matchedContact ? (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Matches: {item.matchedContact.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">New</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={rows[i]?.action || 'create'}
                        onChange={(e) => updateAction(i, e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white"
                      >
                        <option value="create">Create new</option>
                        {item.matchedContact && <option value="merge">Merge into existing</option>}
                        <option value="skip">Skip</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Importing...' : 'Confirm Import'}
            </button>
            <button
              onClick={() => { setStep('upload'); setPreview(null); }}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Start Over
            </button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}

      {step === 'done' && result && (
        <div className="bg-white rounded-xl border border-green-200 p-8 text-center space-y-3">
          <p className="text-4xl">✅</p>
          <h2 className="font-bold text-gray-800">Import Complete</h2>
          <div className="flex justify-center gap-6 text-sm">
            <div><p className="text-2xl font-bold text-green-600">{result.created}</p><p className="text-gray-500">Created</p></div>
            <div><p className="text-2xl font-bold text-amber-600">{result.merged}</p><p className="text-gray-500">Merged</p></div>
            <div><p className="text-2xl font-bold text-gray-400">{result.skipped}</p><p className="text-gray-500">Skipped</p></div>
          </div>
          <button
            onClick={() => { setStep('upload'); setPreview(null); setResult(null); }}
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 mt-2"
          >
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
}
