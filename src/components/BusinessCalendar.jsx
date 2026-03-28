import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BusinessCalendar = ({ entries }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getDayData = (day) => {
    const dayEntries = entries.filter(entry => isSameDay(new Date(entry.timestamp), day));
    const sales = dayEntries.reduce((sum, e) => sum + e.totalEarnings, 0);
    const expenses = dayEntries.reduce((sum, e) => sum + e.totalExpenses, 0);
    const items = dayEntries.flatMap(e => e.items);
    return { sales, expenses, items };
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const selectedData = getDayData(selectedDate);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Calendar Header */}
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', textTransform: 'capitalize' }}>
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft /></button>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronRight /></button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card" style={{ padding: '0.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '10px', fontSize: '0.7rem', fontWeight: '700', color: '#999' }}>
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {calendarDays.map((day, idx) => {
            const { sales, expenses } = getDayData(day);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const profit = sales - expenses;

            return (
              <motion.div
                key={idx}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(day)}
                style={{
                  height: '60px',
                  borderRadius: '12px',
                  padding: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: isSelected ? 'var(--primary)' : isCurrentMonth ? 'white' : 'rgba(0,0,0,0.02)',
                  color: isSelected ? 'white' : 'inherit',
                  border: isSelected ? 'none' : '1px solid rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  opacity: isCurrentMonth ? 1 : 0.4
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: '600' }}>{format(day, 'd')}</div>
                {isCurrentMonth && (sales > 0 || expenses > 0) && (
                  <div style={{ 
                    fontSize: '0.55rem', 
                    fontWeight: '700', 
                    textAlign: 'center', 
                    color: isSelected ? 'white' : profit >= 0 ? '#34a853' : '#ea4335' 
                  }}>
                    {profit >= 0 ? `+₹${sales}` : `-₹${expenses}`}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Day Details */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedDate.toString()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ borderLeft: `4px solid ${selectedData.sales >= selectedData.expenses ? '#34a853' : '#ea4335'}` }}
        >
           <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
             {format(selectedDate, 'do MMMM')} Summary
           </h3>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <p className="stat-label">Stock Sold</p>
                <p style={{ fontWeight: '700' }}>{selectedData.items.reduce((a,b) => a + b.quantity, 0)} Units</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="stat-label">Net Profit</p>
                <p style={{ fontWeight: '700', color: selectedData.sales >= selectedData.expenses ? '#34a853' : '#ea4335' }}>
                  ₹{selectedData.sales - selectedData.expenses}
                </p>
              </div>
           </div>
           
           {selectedData.items.length > 0 ? (
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedData.items.map((item, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.04)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem' }}>
                    {item.quantity} x {item.item}
                  </div>
                ))}
             </div>
           ) : (
             <p style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>No heavy sales data for this date.</p>
           )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BusinessCalendar;
