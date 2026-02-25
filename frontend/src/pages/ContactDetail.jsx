import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getContact, updateContact, deleteContact, createInteraction } from '../lib/api';
import SocialLinks from '../components/SocialLinks';
import InteractionHistory from '../components/InteractionHistory';

const FIELD = (label, key, type = 'text', props = {}) => ({ label, key, type, props });
const CORE_FIELDS = [
  FIELD('Full Name', 'name', 'text', { required: true }),
  FIELD('Email', 'email', 'email'),
  FIELD('Phone', 'phone', 'tel'),
  FIELD('Birthday (MM-DD)', 'birthday', 'text', { placeholder: 'MM-DD' }),
  FIELD('Religion', 'religion'),
  FIELD('Follow-up every (days)', 'followUpInterval', 'number', { min: 1 }),
];

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [form, setForm] = useState({});
  const [socialLinks, setSocialLinks] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ type: 'digital', platform: '', notes: '', link: '' });
  const [loggingInteraction, setLoggingInteraction] = useState(false);

  const load = () => {
    getContact(id).then((r) => {
      const c = r.data;
      setContact(c);
      setForm({
        name: c.name || '',
        email: c.email || '',
        phone: c.phone || '',
        birthday: c.birthday || '',
        religion: c.religion || '',
        followUpInterval: c.followUpInterval || '',
        notes: c.notes || '',
      });
      setSocialLinks(c.socialLinks || []);
      setCustomFields(c.customFields || []);
      setTagsInput((c.tags || []).join(', '));
    });
  };

  useEffect(() => { load(); }, [id]);

  if (!contact) return <p className="text-gray-400">Loading...</p>;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateContact(id, {
        ...form,
        followUpInterval: form.followUpInterval ? parseInt(form.followUpInterval) : null,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        socialLinks: socialLinks.map(({ id: _, contactId: __, ...s }) => s),
        customFields: customFields.map(({ id: _, contactId: __, ...cf }) => cf),
      });
      await load();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${contact.name}? This cannot be undone.`)) return;
    await deleteContact(id);
    navigate('/contacts');
  };

  const handleLogInteraction = async (e) => {
    e.preventDefault();
    setLoggingInteraction(true);
    try {
      await createInteraction(id, { ...logForm, date: new Date().toISOString() });
      setLogForm({ type: 'digital', platform: '', notes: '', link: '' });
      setShowLogForm(false);
      await load();
    } finally {
      setLoggingInteraction(false);
    }
  };

  const addCustomField = () => setCustomFields([...customFields, { key: '', value: '' }]);
  const updateCF = (i, field, val) =>
    setCustomFields(customFields.map((cf, idx) => (idx === i ? { ...cf, [field]: val } : cf)));
  const removeCF = (i) => setCustomFields(customFields.filter((_, idx) => idx !== i));

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/contacts')} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Contacts
          </button>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
            {contact.name[0].toUpperCase()}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{contact.name}</h1>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-50"
              >
                Delete
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(false)}
              className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CORE_FIELDS.map(({ label, key, type, props }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key] || ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  {...props}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tags (comma-separated)</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="friend, work, family"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Social Links</label>
            <SocialLinks links={socialLinks} onChange={setSocialLinks} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Custom Fields</label>
            <div className="space-y-2">
              {customFields.map((cf, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    placeholder="Field name"
                    value={cf.key}
                    onChange={(e) => updateCF(i, 'key', e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm flex-1"
                  />
                  <input
                    placeholder="Value"
                    value={cf.value}
                    onChange={(e) => updateCF(i, 'value', e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm flex-1"
                  />
                  <button type="button" onClick={() => removeCF(i)} className="text-red-500 text-sm px-1">✕</button>
                </div>
              ))}
              <button type="button" onClick={addCustomField} className="text-blue-600 text-sm font-medium">
                + Add custom field
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      ) : (
        /* View mode */
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {contact.email && <div><span className="text-gray-500">Email</span><p className="font-medium">{contact.email}</p></div>}
            {contact.phone && <div><span className="text-gray-500">Phone</span><p className="font-medium">{contact.phone}</p></div>}
            {contact.birthday && <div><span className="text-gray-500">Birthday</span><p className="font-medium">{contact.birthday}</p></div>}
            {contact.religion && <div><span className="text-gray-500">Religion</span><p className="font-medium">{contact.religion}</p></div>}
            {contact.followUpInterval && (
              <div><span className="text-gray-500">Follow-up every</span><p className="font-medium">{contact.followUpInterval} days</p></div>
            )}
            {contact.lastInteraction && (
              <div><span className="text-gray-500">Last contact</span><p className="font-medium">{new Date(contact.lastInteraction).toLocaleDateString()}</p></div>
            )}
          </div>

          {contact.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {contact.tags.map((t) => (
                <span key={t} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{t}</span>
              ))}
            </div>
          )}

          {contact.notes && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}

          {contact.socialLinks?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Social Links</p>
              <div className="flex flex-wrap gap-2">
                {contact.socialLinks.map((l) => (
                  <a
                    key={l.id}
                    href={l.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200"
                  >
                    {l.platform} {l.handle || ''}
                  </a>
                ))}
              </div>
            </div>
          )}

          {contact.customFields?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Custom Fields</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {contact.customFields.map((cf) => (
                  <div key={cf.id}>
                    <span className="text-gray-500">{cf.key}</span>
                    <p className="font-medium">{cf.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interaction History */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Interaction History</h2>
          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Log Interaction
          </button>
        </div>

        {showLogForm && (
          <form onSubmit={handleLogInteraction} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Type</label>
                <select
                  value={logForm.type}
                  onChange={(e) => setLogForm({ ...logForm, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm mt-1 bg-white"
                >
                  <option value="digital">Digital</option>
                  <option value="in_person">In Person</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Platform</label>
                <input
                  value={logForm.platform}
                  onChange={(e) => setLogForm({ ...logForm, platform: e.target.value })}
                  placeholder="e.g. Instagram DM"
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Notes</label>
              <textarea
                value={logForm.notes}
                onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Link (optional)</label>
              <input
                value={logForm.link}
                onChange={(e) => setLogForm({ ...logForm, link: e.target.value })}
                type="url"
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm mt-1"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loggingInteraction}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {loggingInteraction ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setShowLogForm(false)} className="text-sm text-gray-500">
                Cancel
              </button>
            </div>
          </form>
        )}

        <InteractionHistory interactions={contact.interactions} />
      </div>
    </div>
  );
}
