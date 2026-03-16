import { useState } from 'react';
import { useStore } from '../store';
import { Activity, X, CheckCircle, AlertOctagon, CornerDownRight } from 'lucide-react';

export default function TestConnectionTool() {
  const nodes = useStore(s => s.nodes);
  const activeTrace = useStore(s => s.activeTrace);
  const runTrace = useStore(s => s.runTrace);
  const clearTrace = useStore(s => s.clearTrace);
  
  const [srcId, setSrcId] = useState('');
  const [dstId, setDstId] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const endpoints = nodes.filter(n => ['endpoint', 'camera', 'server'].includes(n.data.kind as string));

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute bottom-6 left-6 z-20 bg-surface border border-gray-700 shadow-xl rounded-full p-4 hover:bg-gray-800 transition-colors group flex items-center justify-center"
        title="Packet Tracer"
      >
        <Activity className="text-cyan-400 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div className="absolute bottom-6 left-6 z-20 bg-surface border border-gray-700 shadow-2xl rounded-xl w-80 overflow-hidden flex flex-col max-h-[500px] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-black/20 p-3 border-b border-gray-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="text-cyan-400 w-4 h-4" />
          <h3 className="font-bold text-sm">Visual Ping (ICMP)</h3>
        </div>
        <button onClick={() => { setIsOpen(false); clearTrace(); }} className="text-gray-400 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4 shrink-0">
        <div>
          <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Source</label>
          <select value={srcId} onChange={e => setSrcId(e.target.value)} className="w-full bg-black/40 border border-gray-800 rounded px-2 py-1.5 text-xs text-gray-300">
            <option value="">Select source...</option>
            {endpoints.map(e => <option key={e.id} value={e.id}>{e.data.model} ({e.data.config.ip || 'No IP'})</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Destination</label>
          <select value={dstId} onChange={e => setDstId(e.target.value)} className="w-full bg-black/40 border border-gray-800 rounded px-2 py-1.5 text-xs text-gray-300">
            <option value="">Select destination...</option>
            {endpoints.map(e => <option key={e.id} value={e.id}>{e.data.model} ({e.data.config.ip || 'No IP'})</option>)}
          </select>
        </div>
        <button 
          onClick={() => { clearTrace(); setTimeout(() => runTrace(srcId, dstId), 50); }} 
          disabled={!srcId || !dstId || srcId === dstId}
          className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded text-xs font-bold uppercase tracking-wider"
        >
          Execute Trace
        </button>
      </div>

      {activeTrace && (
        <div className="flex-1 overflow-y-auto bg-black/50 p-4 border-t border-gray-800 font-data text-xs space-y-3 custom-scrollbar min-h-32">
          {activeTrace.map((hop, i) => {
             const isFail = hop.status === 'drop';
             const isLast = i === activeTrace.length - 1;
             const node = nodes.find(n => n.id === hop.hopId);
             
             return (
               <div key={i} className={`flex items-start gap-2 ${isFail ? 'text-red-400' : 'text-gray-300'}`}>
                 <div className="pt-0.5 shrink-0">
                   {isFail ? <AlertOctagon size={14} /> : (isLast ? <CheckCircle size={14} className="text-green-500" /> : <CornerDownRight size={14} className="text-cyan-600" />)}
                 </div>
                 <div>
                   <div className="font-bold">{hop.layer ? `[${hop.layer}] ` : ''}Hop {i + 1}: {node ? node.data.model : hop.hopId}</div>
                   {hop.reason && <div className="text-red-500/80 mt-0.5">{hop.reason}</div>}
                   {isLast && !isFail && <div className="text-green-500 mt-0.5">ICMP Echo Reply received.</div>}
                 </div>
               </div>
             )
          })}
        </div>
      )}
    </div>
  );
}
