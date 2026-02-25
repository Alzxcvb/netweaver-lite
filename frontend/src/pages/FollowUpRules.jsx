import React, { useEffect, useState } from 'react';
import { getFollowUpRules, createFollowUpRule, updateFollowUpRule, deleteFollowUpRule } from '../lib/api';

const BLANK_RULE = {
  name: '',
  triggerType: 'birthday',
  tagFilter: '',
  triggerDate: '',
  intervalDays: '',
  messageTemplate: '',
  autoSendEmail: false,
  holidayName: '',
  holidayDate: '',
};

const triggerTypeLabels = {
  birthday: '🎂 Birthday',
  holiday: '🗓️ Holiday / Annual',
  interval: '⏱️ Interval',
  tag_event: '🏷️ Tag Event',
};

export default function FollowUpRules() {
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_RULE);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    getFollowUpRules().then((r) => setRules(r.data));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm(BLANK_RULE);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (rule) => {
    setForm({
      name: rule.name || '',
      triggerType: rule.triggerType || 'birthday',
      tagFilter: rule.tagFilter || '',
      triggerDate: rule.triggerDate || '',
      intervalDays: rule.intervalDays || '',
      messageTemplate: rule.messageTemplate || '',
      autoSendEmail: rule.autoSendEmail || false,
      holidayName: rule.holidayName || '',
      holidayDate: rule.holidayDate || '',
    });
    setEditingId(rule.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        intervalDays: form.intervalDays ? parseInt(form.intervalDays) : null,
      };
      if (editingId) {
        await updateFollowUpRule(editingId, data);
      } else {
        await createFollowUpRule(data);
      }
      setShowForm(false);
      setEditingId(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this rule?')) return;
    await deleteFollowUpRule(id);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Follow-Up Rules</h1>
        <button
          onClick={openNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + New Rule
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 overflow-y-auto max-h-[90vh]">
            <h2 className="font-bold text-gray-800 text-lg">{editingId ? 'Edit Rule' : 'New Follow-Up Rule'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Rule Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                  placeholder="e.g. Hanukkah, Veterans Day..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Trigger Type</label>
                <select
                  value={form.triggerType}
                  onChange={(e) => setForm({ ...form, triggerType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 bg-white"
                >
                  <option value="birthday">Birthday — triggers on each contact's birthday</option>
                  <option value="holiday">Holiday / Annual — fixed or per-year date</option>
                  <option value="interval">Interval — every N days since last contact</option>
                  <option value="tag_event">Tag Event — contacts with specific tag on a date</option>
                </select>
              </div>

              {(form.triggerType === 'holiday' || form.triggerType === 'tag_event') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Date (MM-DD)</label>
                    <input
                      value={form.triggerDate}
                      onChange={(e) => setForm({ ...form, triggerDate: e.target.value })}
                      placeholder="MM-DD"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                    />
                  </div>
                  {form.triggerType === 'holiday' && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Per-year override (MM-DD)</label>
                      <input
                        value={form.holidayDate}
                        onChange={(e) => setForm({ ...form, holidayDate: e.target.value })}
                        placeholder="MM-DD (for variable dates)"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                      />
                    </div>
                  )}
                </div>
              )}

              {form.triggerType === 'tag_event' && (
                <div>
                  <label className="text-xs font-medium text-gray-600">Tag Filter (contacts must have this tag)</label>
                  <input
                    value={form.tagFilter}
                    onChange={(e) => setForm({ ...form, tagFilter: e.target.value })}
                    placeholder="e.g. veteran"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                  />
                </div>
              )}

              {form.triggerType === 'interval' && (
                <div>
                  <label className="text-xs font-medium text-gray-600">Interval (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.intervalDays}
                    onChange={(e) => setForm({ ...form, intervalDays: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-600">Message Template (optional)</label>
                <textarea
                  value={form.messageTemplate}
                  onChange={(e) => setForm({ ...form, messageTemplate: e.target.value })}
                  rows={2}
                  placeholder="Happy {holiday}! Thinking of you 🎉"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Rule' : 'Create Rule'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rules list */}
      {rules.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">🔔</p>
          <p>No rules yet. Create one to start getting follow-up reminders.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">{rule.name}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {triggerTypeLabels[rule.triggerType] || rule.triggerType}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                  {rule.triggerDate && <p>Date: {rule.triggerDate}{rule.holidayDate ? ` (override: ${rule.holidayDate})` : ''}</p>}
                  {rule.intervalDays && <p>Every {rule.intervalDays} days</p>}
                  {rule.tagFilter && <p>Tag: {rule.tagFilter}</p>}
                  {rule.messageTemplate && <p className="italic">"{rule.messageTemplate}"</p>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(rule)}
                  className="text-xs border border-gray-300 text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="text-xs border border-red-200 text-red-500 px-2 py-1 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
