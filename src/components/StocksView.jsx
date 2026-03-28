import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const StocksView = ({ user_id }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user_id) return;
    
    fetch(`http://localhost:3001/api/stocks?user_id=${user_id}`)
      .then(res => res.json())
      .then(data => {
        setStocks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Stock API Error:', err);
        setLoading(false);
      });
  }, [user_id]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading stock levels...</div>;

  return (
    <div className="stocks-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
      <div className="glass-card" style={{ background: 'var(--primary-glow)', border: 'none' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '10px' }}>
          <TrendingUp size={18} /> TOMORROW'S PREDICTION
        </h3>
        <p style={{ fontSize: '0.95rem', fontWeight: '600' }}>
            {stocks.some(s => s.needed > 0) 
              ? `You are running low on ${stocks.find(s => s.needed > 0).name}. We recommend stocking up today.` 
              : "All stocks are looking good for tomorrow's business!"}
        </p>
      </div>

      <h2 style={{ fontSize: '1.25rem' }}>Shopping List for Tomorrow</h2>
      
      <div className="stock-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {stocks.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No inventory tracked yet.</div>
        ) : (
          stocks.map((stock, idx) => (
            <motion.div 
              key={idx}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card" 
              style={{ 
                  padding: '1rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderLeft: `4px solid ${stock.needed > 0 ? '#ea4335' : '#34a853'}`
              }}
            >
              <div>
                <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{stock.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                  <Package size={14} /> Current: {stock.current_qty} {stock.unit}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                {stock.needed > 0 ? (
                  <div style={{ color: '#ea4335', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>NEED TO BUY</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.25rem', fontWeight: '800' }}>
                      <ShoppingCart size={18} /> {stock.needed} {stock.unit}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#34a853', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                     <CheckCircle2 size={20} /> Stock OK
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem', opacity: 0.8 }}>
          <AlertTriangle size={24} color="#fbbc04" style={{ marginBottom: '10px' }} />
          <p style={{ fontSize: '0.85rem' }}>Stock suggestions are based on local market trends and your {user_id ? 'personal' : ''} daily narration history.</p>
      </div>
    </div>
  );
};

export default StocksView;
