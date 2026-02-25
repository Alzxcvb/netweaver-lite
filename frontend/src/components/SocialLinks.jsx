import React from 'react';

const PLATFORMS = [
  'instagram', 'facebook', 'tiktok', 'youtube', 'whatsapp',
  'telegram', 'signal', 'pinterest', 'linkedin', 'twitter',
];

const platformEmoji = {
  instagram: '📸',
  facebook: '📘',
  tiktok: '🎵',
  youtube: '▶️',
  whatsapp: '💬',
  telegram: '✈️',
  signal: '🔒',
  pinterest: '📌',
  linkedin: '💼',
  twitter: '🐦',
};

export default function SocialLinks({ links, onChange }) {
  const update = (index, field, value) => {
    const updated = links.map((l, i) => (i === index ? { ...l, [field]: value } : l));
    onChange(updated);
  };

  const add = () => {
    onChange([...links, { platform: 'instagram', handle: '', url: '' }]);
  };

  const remove = (index) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {links.map((link, i) => (
        <div key={i} className="flex items-center gap-2">
          <select
            value={link.platform}
            onChange={(e) => update(i, 'platform', e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {platformEmoji[p]} {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="@handle"
            value={link.handle || ''}
            onChange={(e) => update(i, 'handle', e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm flex-1"
          />
          <input
            type="url"
            placeholder="URL (optional)"
            value={link.url || ''}
            onChange={(e) => update(i, 'url', e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm flex-1"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-red-500 hover:text-red-700 text-sm px-1"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        + Add social link
      </button>
    </div>
  );
}
