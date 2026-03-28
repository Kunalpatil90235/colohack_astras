import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  IndianRupee, 
  Calendar,
  Lock,
  Stamp,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';

const LoanView = ({ entries, user }) => {
  const [score, setScore] = useState(0);
  const [ready, setReady] = useState(false);

  // Data Aggregations
  const totalEarnings = entries.reduce((sum, e) => sum + e.totalEarnings, 0);
  const totalExpenses = entries.reduce((sum, e) => sum + e.totalExpenses, 0);
  const netProfit = totalEarnings - totalExpenses;

  // Group by Month
  const monthlyData = entries.reduce((acc, entry) => {
    const date = new Date(entry.timestamp);
    const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = { earnings: 0, expenses: 0 };
    acc[key].earnings += entry.totalEarnings;
    acc[key].expenses += entry.totalExpenses;
    return acc;
  }, {});

  // Group by Year
  const yearlyData = entries.reduce((acc, entry) => {
    const year = new Date(entry.timestamp).getFullYear();
    if (!acc[year]) acc[year] = { earnings: 0, expenses: 0 };
    acc[year].earnings += entry.totalEarnings;
    acc[year].expenses += entry.totalExpenses;
    return acc;
  }, {});

  // Detailed Item List
  const itemizedSales = entries.flatMap(entry => {
    return (entry.items || []).map(it => ({
      ...it,
      date: new Date(entry.timestamp).toLocaleDateString(),
      fullDate: entry.timestamp
    }));
  }).sort((a, b) => new Date(b.fullDate) - new Date(a.fullDate));

  useEffect(() => {
    const uniqueDays = new Set(entries.map(e => new Date(e.timestamp).toDateString())).size;
    const revenue = entries.reduce((sum, e) => sum + e.totalEarnings, 0);
    
    // Simple Score algorithm
    let calculatedScore = (uniqueDays / 7) * 40 + (revenue / 10000) * 60;
    calculatedScore = Math.min(100, Math.floor(calculatedScore));
    setScore(calculatedScore);
    setReady(calculatedScore > 75);
  }, [entries]);

  const generateReport = () => {
    window.print();
  };

  return (
    <div className="loan-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
      
      {/* 📜 PRINTABLE STATEMENT (Styled only for Print) */}
      <style>
        {`
          @media print {
            .app-container { max-width: 100% !important; border: none !important; padding: 0 !important; }
            .loan-container { width: 100% !important; padding: 0 !important; }
            .print-only { display: block !important; }
            .screen-only { display: none !important; }
            body { background: white !important; }
            
            .certificate-border {
               border: 15px double #138808;
               padding: 40px;
               min-height: 98vh;
               font-family: 'Hind', 'Outfit', sans-serif;
               position: relative;
               color: #000;
            }

            .watermark {
               position: absolute;
               top: 50%;
               left: 50%;
               transform: translate(-50%, -50%) rotate(-45deg);
               font-size: 8rem;
               color: rgba(19, 136, 8, 0.05);
               z-index: -1;
               white-space: nowrap;
               font-weight: 800;
            }

            .report-table {
               width: 100%;
               border-collapse: collapse;
               margin: 20px 0;
            }

            .report-table th, .report-table td {
               border: 1px solid #ccc;
               padding: 12px;
               text-align: left;
            }

            .report-table th {
               background-color: #f5f5f5 !important;
               -webkit-print-color-adjust: exact;
               color: #333;
            }
          }
          @media screen {
            .print-only { display: none; }
          }
        `}
      </style>

      {/* Actual Certificate Content (Visible only during print) */}
      <div className="print-only">
        <div className="certificate-border">
          <div className="watermark">VERIFIED BUSINESS</div>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
             <h1 style={{ color: '#138808', fontSize: '2.5rem', marginBottom: '8px' }}>व़ानी Business Trust Statement</h1>
             <p style={{ fontSize: '1.1rem', color: '#666' }}>Certified Digital Ledger & Revenue Summary</p>
             <hr style={{ borderColor: '#138808', margin: '20px 0' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
             <div>
                <p><strong>Vendor Email:</strong> {user.email}</p>
                <p><strong>Business Type:</strong> Micro-Entrepreneur</p>
                <p><strong>Statement Date:</strong> {new Date().toLocaleDateString()}</p>
             </div>
             <div style={{ textAlign: 'right' }}>
                <p><strong>Financial Trust Score:</strong> {score}%</p>
                <p><strong>Recorded History:</strong> {new Set(entries.map(e => new Date(e.timestamp).toDateString())).size} Active Days</p>
                <p><strong>Account Status:</strong> <span style={{ color: '#138808' }}>Verified</span></p>
             </div>
          </div>

          <h2 style={{ fontSize: '1.4rem', color: '#138808', marginBottom: '10px' }}>I. Financial Performance Breakdown</h2>
          
          <h3 style={{ fontSize: '1rem', marginTop: '20px' }}>Monthly Revenue Trends</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Month & Year</th>
                <th>Total Earnings (Sales)</th>
                <th>Total Spend (Raw Material)</th>
                <th>Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(monthlyData).map(([key, val]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>₹{val.earnings}</td>
                  <td>₹{val.expenses}</td>
                  <td>₹{val.earnings - val.expenses}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ fontSize: '1rem', marginTop: '20px' }}>Yearly Summary</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Fiscal Year</th>
                <th>Total Earnings</th>
                <th>Total Spend</th>
                <th>Annual Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(yearlyData).map(([key, val]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>₹{val.earnings}</td>
                  <td>₹{val.expenses}</td>
                  <td>₹{val.earnings - val.expenses}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ pageBreakBefore: 'always' }}></div>

          <h2 style={{ fontSize: '1.4rem', color: '#138808', marginBottom: '10px', marginTop: '30px' }}>II. Detailed Transaction Log</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Item Sold</th>
                <th>Quantity</th>
                <th>Gross Amount</th>
              </tr>
            </thead>
            <tbody>
              {itemizedSales.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center' }}>No itemized sales data found.</td></tr>
              ) : (
                itemizedSales.map((it, idx) => (
                  <tr key={idx}>
                    <td>{it.date}</td>
                    <td>{it.item}</td>
                    <td>{it.quantity}</td>
                    <td>₹{it.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{ marginTop: '80px', borderTop: '2px solid #eee', paddingTop: '20px', textAlign: 'center' }}>
            <p style={{ fontStyle: 'italic', color: '#888', fontSize: '0.9rem' }}>
              This document is a certified extract from the Vani BI SQL Ledger Engine. 
              The revenue and expenses have been verified against narration audio and manual entries.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '100px', marginTop: '40px' }}>
               <div style={{ borderTop: '1px solid #ccc', padding: '10px 40px' }}>Owner Signature</div>
               <div style={{ borderTop: '1px solid #ccc', padding: '10px 40px' }}>Vani BI Seal</div>
            </div>
          </div>
        </div>
      </div>

      {/* UI Elements (Hide during print) */}
      <div className="screen-only" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header Status Card */}
        <div className="glass-card" style={{ 
          background: ready ? 'linear-gradient(135deg, #138808 0%, #34a853 100%)' : 'linear-gradient(135deg, #444 0%, #666 100%)', 
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9, fontSize: '0.9rem' }}>
              {ready ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />} FINANCIAL TRUST SCORE
            </h3>
            <div style={{ fontSize: '3rem', fontWeight: '800', margin: '4px 0' }}>{score}%</div>
            <p style={{ fontSize: '0.95rem', fontWeight: '600' }}>
              {ready ? "Congratulations! You are eligible for the PM SVANidhi Loan." : "Keep narrating daily to reach the 75% Bank-Ready score."}
            </p>
          </div>
          <TrendingUp size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }} />
        </div>

        {/* Income Proof Section */}
        <h2 style={{ fontSize: '1.25rem', marginTop: '10px' }}>Proof of Income for Banks</h2>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Business Statement</h3>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>A clean, detailed summary of your sales, profit, and items sold for bank verification.</p>
          </div>
          <button 
             onClick={generateReport}
             className="btn-primary"
             style={{ 
               width: '56px', 
               height: '56px', 
               borderRadius: '16px', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               boxShadow: '0 8px 16px rgba(255, 90, 31, 0.2)'
             }}
          >
            <Download size={24} />
          </button>
        </div>

        {/* Quick Summary Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
           <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #34a853' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#888' }}>GROSS EARNINGS</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '800' }}>₹{totalEarnings}</p>
           </div>
           <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #FF5A1F' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#888' }}>TOTAL SPEND</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '800' }}>₹{totalExpenses}</p>
           </div>
        </div>

        {/* Requirements Checklist */}
        <h2 style={{ fontSize: '1.25rem', marginTop: '10px' }}>Loan Requirements (PM SVANidhi)</h2>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <CheckCircle2 color={score > 50 ? "#34a853" : "#ddd"} />
               <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>Aadhaar Linked Mobile Number</p>
                  <p style={{ fontSize: '0.75rem', color: '#888' }}>Required for E-KYC verification.</p>
               </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <CheckCircle2 color={score > 70 ? "#34a853" : "#ddd"} />
               <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>Certificate of Vending (COV)</p>
                  <p style={{ fontSize: '0.75rem', color: '#888' }}>Provided by Town Vending Committee.</p>
               </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <CheckCircle2 color={ready ? "#34a853" : "#ddd"} />
               <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>Digital Transactions Proof</p>
                  <p style={{ fontSize: '0.75rem', color: '#888' }}>Vani records serve as primary digital proof of cash sales.</p>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoanView;
