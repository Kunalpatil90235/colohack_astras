import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Check, X, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceRecorder = ({ onTranscriptionComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [language, setLanguage] = useState('en-IN'); 
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const errorRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Browser not supported. Please use Google Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsRecording(true);
      isRecordingRef.current = true;
      setError(null);
      errorRef.current = null;
    };

    recognition.onresult = (event) => {
      let final = '';
      let interim = '';
      
      // Robust transcription: always rebuild from the full list to avoid duplications
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      
      setTranscript(final);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      let errMsg = null;
      if (event.error === 'not-allowed') {
        errMsg = 'Microphone Permission Denied. Please enable it in browser settings.';
      } else if (event.error === 'network') {
        errMsg = 'Network error. Speech recognition requires an internet connection.';
      } else if (event.error === 'aborted') {
        // Recognition aborted, usually silent restart takes care of this
      } else {
        errMsg = `Speech Error: ${event.error}`;
      }
      
      if (errMsg) {
        setError(errMsg);
        errorRef.current = errMsg;
      }
      
      setIsRecording(false);
      isRecordingRef.current = false;
    };

    recognition.onend = () => {
      // Don't auto-stop if the user didn't click stop, helps with silence handling
      if (isRecordingRef.current && !errorRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log('Failed to restart recognition:', e);
          setIsRecording(false);
          isRecordingRef.current = false;
        }
      } else {
          setIsRecording(false);
          isRecordingRef.current = false;
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      isRecordingRef.current = false;
      if (recognitionRef.current) recognitionRef.current.stop();
    } else {
      setError(null);
      errorRef.current = null;
      setTranscript('');
      setInterimTranscript('');
      try {
        if (recognitionRef.current) recognitionRef.current.start();
      } catch (e) {
        console.error('Manual start failed:', e);
        setIsRecording(false);
        isRecordingRef.current = false;
      }
    }
  };

  const handleFinish = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    isRecordingRef.current = false;
    onTranscriptionComplete(transcript.trim() + ' ' + interimTranscript.trim());
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="glass-card"
      style={{ 
        minHeight: '400px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'relative',
        padding: '2rem'
      }}
    >
      {/* Language Toggle */}
      <div className="no-print" style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '8px' }}>
         <button 
           onClick={() => setLanguage('en-IN')}
           style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid #ddd', background: language === 'en-IN' ? 'var(--primary)' : 'white', color: language === 'en-IN' ? 'white' : '#666', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }}
         >English</button>
         <button 
           onClick={() => setLanguage('hi-IN')}
           style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid #ddd', background: language === 'hi-IN' ? 'var(--primary)' : 'white', color: language === 'hi-IN' ? 'white' : '#666', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }}
         >हिन्दी</button>
      </div>

      <motion.button
        onClick={toggleRecording}
        whileTap={{ scale: 0.9 }}
        animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
        transition={isRecording ? { repeat: Infinity, duration: 2 } : {}}
        style={{ 
          width: '120px', 
          height: '120px', 
          borderRadius: '50%', 
          background: isRecording ? 'var(--primary)' : '#FFF',
          border: isRecording ? 'none' : '4px solid #eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginBottom: '2rem',
          boxShadow: isRecording ? '0 20px 40px rgba(255, 90, 31, 0.4)' : '0 10px 20px rgba(0,0,0,0.05)',
          transition: 'all 0.3s'
        }}
      >
        {isRecording ? <Mic size={48} color="white" /> : <Mic size={48} color="var(--primary)" />}
      </motion.button>

      <div style={{ textAlign: 'center', width: '100%' }}>
         <h2 style={{ marginBottom: '0.5rem', color: isRecording ? 'var(--primary)' : '#1A1C1E' }}>
            {isRecording ? 'Listening...' : 'Ready to Listen'}
         </h2>
         
         {/* Error Display */}
         <AnimatePresence>
           {error && (
             <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               exit={{ opacity: 0, height: 0 }}
               style={{ color: '#ea4335', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#fce8e6', padding: '8px', borderRadius: '8px' }}
             >
               <AlertCircle size={14} /> {error}
             </motion.div>
           )}
         </AnimatePresence>

         <div className="transcript-box" style={{ 
            minHeight: '80px', 
            maxHeight: '140px', 
            overflowY: 'auto', 
            padding: '1.25rem', 
            background: 'rgba(0,0,0,0.02)', 
            border: '1px dashed #ddd',
            borderRadius: '16px',
            fontSize: '1rem',
            lineHeight: '1.6',
            color: '#333',
            fontStyle: (transcript || interimTranscript) ? 'normal' : 'italic',
            marginBottom: '1.5rem',
            width: '100%'
         }}>
            {transcript || interimTranscript || (language === 'hi-IN' ? 'जो भी आपने आज किया, हमें बताएं...' : 'Tell Vani what you sold today...')}
            <span style={{ color: 'var(--primary)', opacity: 0.6 }}>{interimTranscript}</span>
         </div>

         <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={onCancel}
              style={{ padding: '0.8rem 1.5rem', borderRadius: '16px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#666' }}
            >
               <X size={18} /> Cancel
            </button>
            <button 
              disabled={!transcript && !interimTranscript}
              onClick={handleFinish}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: (transcript || interimTranscript) ? 1 : 0.5, boxShadow: (transcript || interimTranscript) ? '0 10px 20px rgba(255, 90, 31, 0.2)' : 'none' }}
            >
               <Check size={18} /> Finish Narration
            </button>
         </div>
         
         <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <ShieldAlert size={12} /> Privacy: Audios are processed in your browser.
         </p>
      </div>
    </motion.div>
  );
};

export default VoiceRecorder;
