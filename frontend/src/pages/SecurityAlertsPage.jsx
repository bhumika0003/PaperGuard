import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { SecurityAlertBadge } from '../components/ui/SecurityAlertBadge';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, Eye, AlertOctagon, Filter } from 'lucide-react';
import api from '../services/api';

export const SecurityAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('All');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data.alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleUpdateStatus = async (alertId, newStatus) => {
    try {
      await api.patch(`/alerts/${alertId}/status`, { status: newStatus });
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update alert status');
    }
  };

  const filteredAlerts = alerts.filter(a => severityFilter === 'All' || a.severity === severityFilter);

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-8 overflow-y-auto">
          
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/60 to-slate-900 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">Automated Threat Detection Engine</span>
              <h1 className="text-2xl font-extrabold text-white mt-1">Security Monitoring & Anomaly Alerts</h1>
              <p className="text-xs text-slate-400 mt-1">Real-time identification of unauthorized access attempts, repeated download requests, and rapid view anomalies.</p>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-rose-950 border border-rose-500/40 text-xs text-rose-300 font-bold flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Real-Time Anomaly Scanner: ONLINE</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-cyber-card border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-400">Severity Level:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-semibold outline-none"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <span className="text-xs font-mono text-slate-400">Count: {filteredAlerts.length} Alerts</span>
          </div>

          {/* Alerts Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredAlerts.map((alert) => (
              <div key={alert.alertId} className="p-5 rounded-2xl bg-cyber-card border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <SecurityAlertBadge severity={alert.severity} />
                    <span className="text-xs font-mono text-slate-400 font-bold">{alert.alertId}</span>
                    <h3 className="text-sm font-bold text-white">{alert.activity}</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{alert.detectedDate} {alert.detectedTime}</span>
                </div>

                <p className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 font-mono">
                  {alert.details}
                </p>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex space-x-4 text-slate-400">
                    <span>User: <strong className="text-white">{alert.userName} ({alert.userId})</strong></span>
                    <span>Paper ID: <strong className="text-cyan-400 font-mono">{alert.paperId || 'N/A'}</strong></span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-[11px]">Status:</span>
                    <select
                      value={alert.status}
                      onChange={(e) => handleUpdateStatus(alert.alertId, e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-semibold text-xs outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Investigating">Investigating</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
};
