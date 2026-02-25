import React from 'react';

const typeLabel = { in_person: 'In Person', digital: 'Digital' };

export default function InteractionHistory({ interactions }) {
  if (!interactions?.length) {
    return <p className="text-sm text-gray-400 italic">No interactions logged yet.</p>;
  }

  return (
    <div className="space-y-3">
      {interactions.map((ix) => (
        <div key={ix.id} className="flex gap-3">
          <div className="flex-shrink-0 w-1 bg-blue-200 rounded-full" />
          <div className="flex-1 pb-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-800">
                {new Date(ix.date).toLocaleDateString()}
              </span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {typeLabel[ix.type] || ix.type}
              </span>
              {ix.platform && (
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                  {ix.platform}
                </span>
              )}
            </div>
            {ix.notes && <p className="text-sm text-gray-600 mt-0.5">{ix.notes}</p>}
            {ix.link && (
              <a
                href={ix.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline"
              >
                {ix.link}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
