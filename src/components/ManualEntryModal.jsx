import React, { useState } from 'react';
import { X, ShoppingBag, CreditCard, Tag, Package, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManualEntryModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    item: '',
    quantity: '',
    amount: '',
    type: 'sale' // 'sale' or 'expense'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.item || !formData.amount) return;

    const entry = {
      items: formData.type === 'sale' ? [{
        item: formData.item,
        quantity: parseInt(formData.quantity) || 1,
        amount: parseInt(formData.amount),
        type: 'sale'
      }] : [],
      expenses: formData.type === 'expense' ? [{
        item: formData.item,
        quantity: parseInt(formData.quantity) || 1,
        amount: parseInt(formData.amount),
        type: 'expense'
      }] : [],
      totalEarnings: formData.type === 'sale' ? parseInt(formData.amount) : 0,
      totalExpenses: formData.type === 'expense' ? parseInt(formData.amount) : 0,
      rawText: `Manual Entry: ${formData.item}`,
      timestamp: new Date().toISOString()
    };

    onSave(entry);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="manual-entry-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: 'white' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Add New Entry</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><X /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Type Selector */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
            <button 
              type="button"
              onClick={() => setFormData({...formData, type: 'sale'})}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid ' + (formData.type === 'sale' ? 'var(--primary)' : '#eee'),
                background: formData.type === 'sale' ? 'var(--primary-glow)' : 'white',
                color: formData.type === 'sale' ? 'var(--primary)' : '#666',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <ShoppingBag size={18} /> Sale
            </button>
            <button 
              type="button"
              onClick={() => setFormData({...formData, type: 'expense'})}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid ' + (formData.type === 'expense' ? '#ea4335' : '#eee'),
                background: formData.type === 'expense' ? 'rgba(234, 67, 53, 0.1)' : 'white',
                color: formData.type === 'expense' ? '#ea4335' : '#666',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <CreditCard size={18} /> Expense
            </button>
          </div>

          <div className="input-field">
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#999', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
               <Tag size={14} /> Item Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. Samosa, Ingredients" 
              value={formData.item}
              onChange={(e) => setFormData({...formData, item: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', fontSize: '1rem', outline: 'none' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="input-field">
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#999', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <Package size={14} /> Quantity
              </label>
              <input 
                type="number" 
                placeholder="1" 
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', fontSize: '1rem', outline: 'none' }}
              />
            </div>
            <div className="input-field">
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#999', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <IndianRupee size={14} /> Amount
              </label>
              <input 
                type="number" 
                placeholder="₹" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', fontSize: '1rem', outline: 'none' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            style={{ marginTop: '10px', padding: '15px', borderRadius: '16px', fontSize: '1rem', background: formData.type === 'sale' ? 'var(--primary)' : '#ea4335' }}
          >
            Save Transanction
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ManualEntryModal;
