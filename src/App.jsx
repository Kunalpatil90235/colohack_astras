import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Plus, 
  History, 
  TrendingUp, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  Calendar,
  Download,
  Trash2,
  Edit2,
  Mic,
  PlusCircle,
  X,
  ShoppingCart,
  User,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceRecorder from './components/VoiceRecorder';
import BusinessCalendar from './components/BusinessCalendar';
import AnalyticsView from './components/AnalyticsView';
import ManualEntryModal from './components/ManualEntryModal';
import StocksView from './components/StocksView';
import LoginView from './components/LoginView';
import LoanView from './components/LoanView';
import { extractBusinessData, calculateRawMaterialCost } from './utils/BusinessParser';

const API_BASE = 'http://localhost:3001/api';

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vani_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRecorder, setShowRecorder] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  
  const [dailyEntries, setDailyEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auth Persistence
  useEffect(() => {
    if (user) {
      localStorage.setItem('vani_user', JSON.stringify(user));
      fetchEntries();
    } else {
      localStorage.removeItem('vani_user');
    }
  }, [user]);

  const fetchEntries = () => {
    if (!user) return;
    setLoading(true);
    fetch(`${API_BASE}/entries?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setDailyEntries(data);
        setLoading(false);
      })
      .catch(err => {
          console.error('API Error:', err);
          setLoading(false);
      });
  };

  const handleTranscription = (text) => {
    const extracted = extractBusinessData(text);
    saveEntry(extracted);
  };

  const handleManualSave = (entry) => {
    saveEntry(entry);
  };

  const saveEntry = (entry) => {
    // SMART COSTING LOGIC: Auto-generate expenses for raw materials
    const autoExpenses = [];
    let extraExpenseTotal = 0;

    if (entry.items && entry.items.length > 0) {
      entry.items.forEach(item => {
        const costEntry = calculateRawMaterialCost(item.item, item.quantity || 1, item.amount);
        autoExpenses.push(costEntry);
        extraExpenseTotal += costEntry.amount;
      });
    }

    const finalEntry = {
      ...entry,
      expenses: [...(entry.expenses || []), ...autoExpenses],
      totalExpenses: (entry.totalExpenses || 0) + extraExpenseTotal,
      user_id: user.id
    };

    fetch(`${API_BASE}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalEntry)
    })
    .then(() => {
        fetchEntries();
        setShowRecorder(false);
        setShowManualEntry(false);
        setActiveTab('dashboard');
    });
  };

  const deleteEntry = (id) => {
    fetch(`${API_BASE}/entries/${id}?user_id=${user.id}`, { method: 'DELETE' })
      .then(() => fetchEntries());
  };

  const logout = () => {
    setUser(null);
    setDailyEntries([]);
    setActiveTab('dashboard');
  };

  const totalEarnings = dailyEntries.reduce((sum, entry) => sum + entry.totalEarnings, 0);
  const totalExpenses = dailyEntries.reduce((sum, entry) => sum + entry.totalExpenses, 0);
  const netProfit = totalEarnings - totalExpenses;

  // Auth Guard
  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  const renderContent = () => {
    if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Syncing Securely...</div>;

    switch (activeTab) {
      case 'analytics':
        return <AnalyticsView entries={dailyEntries} />;
      case 'stocks':
        return <StocksView user_id={user.id} />;
      case 'loan':
        return <LoanView entries={dailyEntries} user={user} />;
      case 'calendar':
        return <BusinessCalendar entries={dailyEntries} />;
      case 'ledger':
        return (
          <div className="entry-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '120px' }}>
             <h2 style={{ marginBottom: '10px' }}>Business Ledger</h2>
             {dailyEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>No records found. Choose an entry method above!</div>
             ) : (
                dailyEntries.map((entry, idx) => (
                  <div key={idx} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: `4px solid ${entry.totalEarnings >= entry.totalExpenses ? '#34a853' : '#ea4335'}` }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontWeight: '700', fontSize: '1rem' }}>
                            {entry.items?.length > 0 ? entry.items[0].item : (entry.expenses?.length > 0 ? entry.expenses[0].item : 'Uncategorized')}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#666' }}>
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: entry.totalEarnings > 0 ? '#34a853' : '#ea4335', fontWeight: '800' }}>
                            {entry.totalEarnings > 0 ? `+₹${entry.totalEarnings}` : `-₹${entry.totalExpenses}`}
                          </p>
                          <button onClick={() => deleteEntry(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3 }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                     </div>
                     
                     {/* Show Auto-generated cost for transparency */}
                     {entry.expenses?.some(ex => ex.isAutoGenerated) && (
                       <div style={{ fontSize: '0.7rem', color: '#888', background: '#f9f9f9', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={10} /> Includes Auto-calculated Raw Material Cost
                       </div>
                     )}
                  </div>
                ))
             )}
          </div>
        );
      default:
        return (
          <motion.div 
            key="main"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}
          >
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ padding: '4px', borderRadius: '8px', background: '#e6f4ea' }}><ArrowUpRight size={18} color="#34a853" /></div>
                  <span className="stat-label">Sales</span>
                </div>
                <div className="stat-value">₹{totalEarnings}</div>
              </div>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ padding: '4px', borderRadius: '8px', background: '#fce8e6' }}><ArrowDownRight size={18} color="#ea4335" /></div>
                  <span className="stat-label">Spend</span>
                </div>
                <div className="stat-value">₹{totalExpenses}</div>
              </div>
            </div>

            {/* Profit Card */}
            <div className="glass-card" style={{ background: 'linear-gradient(135deg, #FF5A1F 0%, #FF8A50 100%)', color: 'white' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>TOTAL NET PROFIT</span>
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>₹{netProfit}</div>
                  </div>
                  <TrendingUp size={48} style={{ opacity: 0.3 }} />
               </div>
            </div>

            {/* Trust Navigator */}
            <div 
              className="glass-card" 
              onClick={() => setActiveTab('loan')}
              style={{ borderLeft: '4px solid #138808', cursor: 'pointer' }}
            >
                <h3 style={{ fontSize: '0.9rem', color: '#138808', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} /> LOAN ELIGIBILITY STATUS
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Build financial trust with banks using your automated ledger.</p>
            </div>

            {/* Recent Activities */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Recent Activities</h2>
              <button 
                onClick={() => setActiveTab('ledger')}
                style={{ fontSize: '0.8rem', color: 'var(--primary)', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '600' }}
              >
                View History
              </button>
            </div>

            <div className="entry-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dailyEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                  <Package size={48} strokeWidth={1} style={{ marginBottom: '1rem' }} />
                  <p>No entries yet tap the button!</p>
                </div>
              ) : (
                dailyEntries.slice(0, 4).map((entry, idx) => (
                  <motion.div 
                    layout
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={idx} 
                    className="glass-card" 
                    style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                        {entry.items?.length > 0 ? entry.items[0].item : (entry.expenses?.length > 0 ? entry.expenses[0].item : 'Uncategorized')}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#999' }}>
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: '700', color: entry.totalEarnings >= entry.totalExpenses ? '#34a853' : '#ea4335' }}>
                        {entry.totalEarnings > entry.totalExpenses ? `+₹${entry.totalEarnings}` : `-₹${entry.totalExpenses}`}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Decorative Icons */}
      <img src="/samosa_icon.png" className="floating-decoration no-print" style={{ top: '10%', left: '-20px', animationDelay: '0s' }} alt="" />
      <img src="/chai_icon.png" className="floating-decoration no-print" style={{ top: '40%', right: '-20px', animationDelay: '2s' }} alt="" />
      <img src="/samosa_icon.png" className="floating-decoration no-print" style={{ bottom: '20%', left: '10px', width: '40px', height: '40px', opacity: 0.1 }} alt="" />

      {/* Header */}
      <header className="no-print" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'white', background: 'var(--primary)', padding: '4px 12px', borderRadius: '12px' }}>वानी</span> 
            Vani BI
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}> {user.email} • SQL Backend Enabled</p>
        </div>
        <button 
          onClick={logout}
          style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #eee', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <User size={20} color="#666" />
        </button>
      </header>

      {/* Modals */}
      <AnimatePresence>
        {showRecorder && (
          <VoiceRecorder 
            key="recorder"
            onTranscriptionComplete={handleTranscription} 
            onCancel={() => setShowRecorder(false)} 
          />
        )}
        {showManualEntry && (
          <ManualEntryModal 
            key="manual"
            onSave={handleManualSave}
            onClose={() => setShowManualEntry(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      {!showRecorder && !showManualEntry && renderContent()}

      {/* FAB Menu */}
      {!showRecorder && !showManualEntry && (
        <div className="no-print" style={{ position: 'fixed', bottom: '90px', right: '30px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
          <AnimatePresence>
            {showFabMenu && (
              <>
                <motion.button 
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  onClick={() => { setShowManualEntry(true); setShowFabMenu(false); }}
                  style={{ background: 'white', color: '#666', border: '1px solid #eee', borderRadius: '20px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', cursor: 'pointer', fontWeight: '600' }}
                >
                  <PlusCircle size={18} /> Manual Entry
                </motion.button>
                <motion.button 
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  onClick={() => { setShowRecorder(true); setShowFabMenu(false); }}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '20px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(255, 90, 31, 0.3)', cursor: 'pointer', fontWeight: '600' }}
                >
                  <Mic size={18} /> Voice Narration
                </motion.button>
              </>
            )}
          </AnimatePresence>
          <motion.button 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFabMenu(!showFabMenu)}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '24px',
              background: showFabMenu ? '#333' : 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
              border: 'none',
              cursor: 'pointer',
              zIndex: 1000
            }}
          >
            {showFabMenu ? <X size={32} strokeWidth={2.5} /> : <Plus size={32} strokeWidth={3} />}
          </motion.button>
        </div>
      )}

      {/* Navigation */}
      {!showRecorder && !showManualEntry && (
        <nav className="no-print" style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          background: 'rgba(255,255,255,0.85)', 
          backdropFilter: 'blur(20px)',
          display: 'flex', 
          justifyContent: 'space-around', 
          padding: '12px 0 24px 0',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          zIndex: 900
        }}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{ background: 'none', border: 'none', color: activeTab === 'dashboard' ? 'var(--primary)' : '#999', flex: 1, cursor: 'pointer' }}
          >
            <BarChart3 size={24} />
            <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>Home</div>
          </button>
          
          <button 
            onClick={() => setActiveTab('loan')}
            style={{ background: 'none', border: 'none', color: activeTab === 'loan' ? 'var(--primary)' : '#999', flex: 1, cursor: 'pointer' }}
          >
            <ShieldCheck size={24} />
            <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>Trust</div>
          </button>

          <div style={{ flex: 1 }}></div>

          <button 
            onClick={() => setActiveTab('stocks')}
            style={{ background: 'none', border: 'none', color: activeTab === 'stocks' ? 'var(--primary)' : '#999', flex: 1, cursor: 'pointer' }}
          >
            <ShoppingCart size={24} />
            <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>Stocks</div>
          </button>
          
          <button 
            onClick={() => setActiveTab('ledger')}
            style={{ background: 'none', border: 'none', color: activeTab === 'ledger' ? 'var(--primary)' : '#999', flex: 1, cursor: 'pointer' }}
          >
            <History size={24} />
            <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>History</div>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
