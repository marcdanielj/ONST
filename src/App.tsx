
import { useState } from 'react';
import { useStore } from './store';
import NetworkCanvas from './components/NetworkCanvas';
import InspectorPanel from './components/InspectorPanel';
import { Download, Upload, Plus, Layers, Laptop2, Video, Database, Component } from 'lucide-react';
import { exportOnstFile, importOnstFile } from './utils/fileSystem';
import { nanoid } from 'nanoid';
import BulkDeploymentModal from './components/BulkDeploymentModal';

function MainApp() {
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const addNode = useStore(s => s.addNode);
  const loadSession = useStore(s => s.loadSession);
  const blueprintImage = useStore(s => s.blueprintImage);
  const setBlueprintImage = useStore(s => s.setBlueprintImage);

  const [showBulkModal, setShowBulkModal] = useState(false);

  const handleBlueprintUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBlueprintImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    exportOnstFile({ nodes, edges, blueprintImage });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await importOnstFile(file);
        loadSession(data);
      } catch (err) {
        alert('Failed to read .onst file');
      }
    }
  };

  const spawnNode = (kind: string, model: string) => {
    addNode({
      id: nanoid(),
      type: 'base',
      position: { x: 200 + Math.random() * 50, y: 200 + Math.random() * 50 },
      data: { kind, model, config: {} }
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Top Toolbar */}
      <div className="h-14 bg-surface border-b border-gray-800 flex items-center justify-between px-4 z-10 shrink-0 shadow-md">
        <div className="flex items-center gap-2">
          <Layers className="text-cyan-500 w-5 h-5" />
          <h1 className="font-bold tracking-wide text-gray-200">ONST <span className="text-gray-600 font-normal">| Open Network Stack Tool</span></h1>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Node Spawners */}
          <div className="flex bg-black/40 rounded p-1 mr-4 border border-gray-800">
            <button title="Add Endpooint" onClick={() => spawnNode('endpoint', 'Client Desktop')} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-cyan-400 transition-colors"><Laptop2 size={16} /></button>
            <button title="Add Camera" onClick={() => spawnNode('camera', 'IP Camera 4K')} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-cyan-400 transition-colors"><Video size={16} /></button>
            <button title="Add Server" onClick={() => spawnNode('server', 'Database Server')} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-cyan-400 transition-colors"><Database size={16} /></button>
            <div className="w-px h-6 bg-gray-800 mx-1 self-center"></div>
            <button title="Bulk Deploy" onClick={() => setShowBulkModal(true)} className="flex items-center gap-1 p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-cyan-400 transition-colors text-xs font-bold uppercase"><Component size={14} /> Batch</button>
          </div>

          <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded cursor-pointer text-sm text-gray-300 transition-colors">
            <Layers size={14} /> Blueprint
            <input type="file" accept="image/*" className="hidden" onChange={handleBlueprintUpload} />
          </label>

          <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded cursor-pointer text-sm text-gray-300 transition-colors">
            <Upload size={14} /> Import
            <input type="file" accept=".onst" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded text-sm text-gray-300 transition-colors">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <NetworkCanvas />
        <InspectorPanel />
      </div>

      {showBulkModal && <BulkDeploymentModal onClose={() => setShowBulkModal(false)} />}
    </div>
  );
}

export default function App() {
  const sessionActive = useStore(s => s.sessionActive);
  const startNewSession = useStore(s => s.startNewSession);
  const loadSession = useStore(s => s.loadSession);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await importOnstFile(file);
        loadSession(data);
      } catch (err) {
        alert('Failed to read .onst file');
      }
    }
  };

  return (
    <>
      {!sessionActive && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="bg-surface border border-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-center mb-6">
              <Layers className="text-cyan-500 w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">Open Network Stack Tool</h1>
            <p className="text-gray-400 text-center text-sm mb-8">Professional-grade network config validation.</p>
            
            <div className="grid gap-3">
              <button 
                onClick={startNewSession}
                className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
              >
                <Plus size={18} /> Start New Project
              </button>

              <label className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded font-medium cursor-pointer transition-colors border border-gray-800">
                <Upload size={18} /> Open Existing Project (.onst)
                <input type="file" accept=".onst" className="hidden" onChange={handleImport} />
              </label>
            </div>
          </div>
        </div>
      )}

      <MainApp />
    </>
  );
}
