import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ContactCard({ contact }) {
  const navigate = useNavigate();

  const daysSince = contact.lastInteraction
    ? Math.floor((Date.now() - new Date(contact.lastInteraction)) / (1000 * 60 * 60 * 24))
    : null;

  const isOverdue =
    contact.followUpInterval && daysSince !== null && daysSince > contact.followUpInterval;
  const neverContacted = contact.followUpInterval && daysSince === null;

  return (
    <div
      onClick={() => navigate(`/contacts/${contact.id}`)}
      className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
          {contact.name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
          {contact.email && <p className="text-xs text-gray-500 truncate">{contact.email}</p>}
          <div className="flex flex-wrap gap-1 mt-1">
            {contact.tags?.map((t) => (
              <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          {(isOverdue || neverContacted) && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium block">
              Overdue
            </span>
          )}
          {daysSince !== null && !isOverdue && (
            <span className="text-xs text-gray-400">{daysSince}d ago</span>
          )}
        </div>
      </div>
    </div>
  );
}
