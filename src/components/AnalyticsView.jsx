import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  Legend
} from 'recharts';
import { TrendingUp, Package, IndianRupee, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subDays } from 'date-fns';

const AnalyticsView = ({ entries }) => {
  // 1. Prepare Weekly Data
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const weeklyData = last7Days.map(day => {
    const dayEntries = entries.filter(e => isSameDay(new Date(e.timestamp), day));
    return {
      name: format(day, 'EEE'),
      sales: dayEntries.reduce((sum, e) => sum + e.totalEarnings, 0),
      expenses: dayEntries.reduce((sum, e) => sum + e.totalExpenses, 0),
      items: dayEntries.flatMap(e => e.items).reduce((sum, i) => sum + i.quantity, 0)
    };
  });

  // 2. Prepare Stock Prediction Data (Heuristic: 20% growth for top items)
  const allItems = entries.flatMap(e => e.items);
  const topItems = allItems.reduce((acc, curr) => {
    acc[curr.item] = (acc[curr.item] || 0) + curr.quantity;
    return acc;
  }, {});

  const stockData = Object.entries(topItems)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, current]) => ({
      name: name.length > 8 ? name.slice(0, 7) + '.' : name,
      current,
      required: Math.round(current * 1.25) // Suggest 25% more for "safety"
    }));

  const totalRevenue = entries.reduce((s,e) => s + e.totalEarnings, 0);
  const totalExpenses = entries.reduce((s,e) => s + e.totalExpenses, 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '100px' }}>
      
      {/* Overview Stats */}
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
         <div style={{ borderRight: '1px solid #eee' }}>
           <p className="stat-label" style={{ fontSize: '0.65rem' }}>TOTAL REVENUE</p>
           <p style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--success)' }}>₹{totalRevenue}</p>
         </div>
         <div>
           <p className="stat-label" style={{ fontSize: '0.65rem' }}>TOTAL SPENDING</p>
           <p style={{ fontWeight: '800', fontSize: '1.2rem', color: '#ea4335' }}>₹{totalExpenses}</p>
         </div>
      </div>

      {/* Weekly Sales vs Spending */}
      <div className="glass-card">
        <h3 style={{ fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="var(--primary)" /> Weekly Performance
        </h3>
        <div style={{ height: '220px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={11} stroke="#999" axisLine={false} tickLine={false} />
              <YAxis fontSize={11} stroke="#999" axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="sales" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} name="Sales ₹" />
              <Bar dataKey="expenses" fill="rgba(0,0,0,0.1)" radius={[4, 4, 0, 0]} barSize={20} name="Spend ₹" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stock Needed Prediction */}
      <div className="glass-card">
        <h3 style={{ fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={18} color="var(--secondary)" /> Suggested Stock for Next Week
        </h3>
        {stockData.length > 0 ? (
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" fontSize={10} hide />
                <YAxis dataKey="name" type="category" width={60} fontSize={10} axisLine={false} tickLine={false} stroke="#666" />
                <Tooltip />
                <Area dataKey="required" stroke="#00B1B0" fill="#00B1B0" fillOpacity={0.2} name="Needed" />
                <Area dataKey="current" stroke="#ddd" fill="#ddd" fillOpacity={0.1} name="Current Baseline" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#999', fontSize: '0.9rem' }}>
            Not enough data to predict stock. Sell more items!
          </div>
        )}
      </div>

      {/* Monthly Trend Indicator */}
      <div className="glass-card" style={{ background: 'var(--bg-gradient)' }}>
         <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
            <Calendar size={18} /> Monthly Progress
         </p>
         <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
               <div>
                  <p className="stat-label">Net Profit</p>
                  <p style={{ fontWeight: '800', fontSize: '1.5rem' }}>₹{netProfit}</p>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.7rem', color: '#34a853', fontWeight: '700' }}>+12% vs last month</p>
                  <p className="stat-label">Projected Growth</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
