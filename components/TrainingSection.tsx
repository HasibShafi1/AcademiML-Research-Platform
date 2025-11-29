import React, { useEffect, useState } from 'react';
import { Terminal, CheckCircle, Loader2 } from 'lucide-react';
import { AppStatus } from '../types';

interface Props {
  status: AppStatus;
}

const TrainingSection: React.FC<Props> = ({ status }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === AppStatus.TRAINING) {
      setLogs(['Initializing training environment...', 'Loading dataset...', 'Applying preprocessing pipelines...']);
      setProgress(5);
      
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.floor(Math.random() * 8);
        });
        setLogs(prev => [
          ...prev, 
          `[Epoch ${Math.floor(Math.random() * 50)}] loss: ${(Math.random() * 0.5).toFixed(4)} - acc: ${(0.7 + Math.random() * 0.2).toFixed(4)} - val_loss: ${(Math.random() * 0.6).toFixed(4)}`
        ].slice(-6)); 
      }, 600);

      return () => clearInterval(interval);
    } else if (status === AppStatus.COMPLETED) {
      setProgress(100);
      setLogs(prev => [...prev, 'Training completed successfully.', 'Generating research report...', 'Finalizing visualizations...']);
    } else {
        setLogs([]);
        setProgress(0);
    }
  }, [status]);

  if (status === AppStatus.IDLE) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-8 animate-in zoom-in-95 duration-300">
       <div className="flex justify-between items-center mb-6">
         <div className="flex items-center gap-3">
            {status === AppStatus.TRAINING ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-full">
                    <Loader2 className="animate-spin text-primary-600 dark:text-primary-400" size={24} />
                </div>
            ) : (
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-full">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                </div>
            )}
            <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {status === AppStatus.TRAINING ? 'Training Model' : 'Training Complete'}
                </h2>
                <p className="text-sm text-slate-500">
                    {status === AppStatus.TRAINING ? 'Optimizing parameters...' : 'Ready to view results'}
                </p>
            </div>
         </div>
         <span className="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400">{progress}%</span>
       </div>
       
       <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-8 overflow-hidden">
          <div 
            className="bg-primary-600 h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden" 
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse w-full h-full"></div>
          </div>
       </div>

       <div className="bg-slate-950 rounded-xl p-5 font-mono text-sm border border-slate-800 shadow-inner">
         <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800 pb-3 mb-3 text-xs uppercase tracking-wider">
            <Terminal size={14} />
            <span>System Output</span>
         </div>
         <div className="space-y-1.5 h-32 overflow-y-auto font-mono text-xs md:text-sm">
            {logs.map((log, i) => (
                <div key={i} className="text-slate-300">
                    <span className="text-green-500 mr-2">➜</span>
                    {log}
                </div>
            ))}
            {status === AppStatus.TRAINING && (
                <div className="text-primary-400 animate-pulse mt-2">_</div>
            )}
         </div>
       </div>
    </div>
  );
};

export default TrainingSection;