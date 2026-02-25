import React from 'react';
import { useNavigate } from 'react-router-dom';

const platformLinks = {
  instagram: (link) => link.url || `https://instagram.com/${link.handle?.replace('@', '')}`,
  facebook: (link) => link.url,
  tiktok: (link) => link.url,
  youtube: (link) => link.url,
  whatsapp: (link) => link.url || `https://wa.me/${link.handle}`,
  telegram: (link) => link.url || `https://t.me/${link.handle?.replace('@', '')}`,
  signal: (link) => link.url,
  pinterest: (link) => link.url,
  linkedin: (link) => link.url,
  twitter: (link) => link.url,
};

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

export default function FollowUpCard({ contact, reason, overdue = false }) {
  const navigate = useNavigate();
  const primaryLink = contact.socialLinks?.[0];

  return (
    <div
      className={`bg-white rounded-xl border p-4 flex items-start gap-3 shadow-sm ${
        overdue ? 'border-red-200' : 'border-blue-100'
      }`}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">
        {contact.name[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/contacts/${contact.id}`)}
            className="font-semibold text-gray-900 hover:text-blue-700 transition-colors text-sm"
          >
            {contact.name}
          </button>
          {overdue && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
              Overdue
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{reason}</p>
        {contact.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {contact.tags.map((t) => (
              <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      {primaryLink && (
        <a
          href={platformLinks[primaryLink.platform]?.(primaryLink) || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-xl hover:scale-110 transition-transform"
          title={`Open ${primaryLink.platform}`}
        >
          {platformEmoji[primaryLink.platform] || '🔗'}
        </a>
      )}
    </div>
  );
}
