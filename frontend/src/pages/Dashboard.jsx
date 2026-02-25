import React, { useEffect, useState } from 'react';
import { getDashboard } from '../lib/api';
import StatsCard from '../components/StatsCard';
import FollowUpCard from '../components/FollowUpCard';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboard()
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading dashboard...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const { totalContacts, followUpsTodayCount, overdueCount, followUpsToday, overdue } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard label="Total Contacts" value={totalContacts} icon="👥" color="blue" />
        <StatsCard label="Follow-ups Today" value={followUpsTodayCount} icon="📅" color="green" />
        <StatsCard label="Overdue" value={overdueCount} icon="⚠️" color="red" />
      </div>

      {followUpsToday.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Follow-ups Today</h2>
          <div className="space-y-2">
            {followUpsToday.map(({ contact, reason }) => (
              <FollowUpCard key={contact.id} contact={contact} reason={reason} />
            ))}
          </div>
        </section>
      )}

      {overdue.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Overdue</h2>
          <div className="space-y-2">
            {overdue.map(({ contact, reason }) => (
              <FollowUpCard key={contact.id} contact={contact} reason={reason} overdue />
            ))}
          </div>
        </section>
      )}

      {followUpsToday.length === 0 && overdue.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">✅</p>
          <p className="font-medium">You're all caught up!</p>
          <p className="text-sm">No follow-ups due today.</p>
        </div>
      )}
    </div>
  );
}
