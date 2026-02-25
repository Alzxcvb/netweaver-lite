import React, { useState } from 'react';
import { submitFeedback } from '../lib/api';

const CATEGORIES = ['Bug', 'Feature Request', 'Other'];

export default function Feedback() {
  const [form, setForm] = useState({ category: 'Feature Request', message: '' });
  const [status, setStatus] = useState(null); // null | 'submitting' | 'done' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await submitFeedback(form);
      setStatus('done');
      setForm({ category: 'Feature Request', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
      <p className="text-sm text-gray-500">
        Found a bug? Have a feature idea? Let us know — it's stored locally.
      </p>

      {status === 'done' ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-2">
          <p className="text-3xl">🙏</p>
          <h2 className="font-semibold text-green-800">Thank you!</h2>
          <p className="text-sm text-green-600">Your feedback has been saved.</p>
          <button
            onClick={() => setStatus(null)}
            className="mt-2 border border-green-300 text-green-700 px-4 py-2 rounded-lg text-sm hover:bg-green-100"
          >
            Submit Another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.category === cat
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              placeholder="Describe the bug or feature request..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {status === 'error' && (
            <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      )}
    </div>
  );
}
