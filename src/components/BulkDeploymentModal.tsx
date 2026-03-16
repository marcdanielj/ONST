import { useState } from 'react';
import { useStore } from '../store';
import { Layers, X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { AppNode } from '../store';
import { Edge } from '@xyflow/react';

export default function BulkDeploymentModal({ onClose }: { onClose: () => void }) {
  const nodes = useStore(s => s.nodes);
  const addNode = useStore(s => s.addNode);
  const addEdges = useStore(s => s.addEdges);
  
  const [deviceKind, setDeviceKind] = useState('camera');
  const [deviceModel, setDeviceModel] = useState('IP Camera 4K');
  const [quantity, setQuantity] = useState(8);
  const [targetSwitchId, setTargetSwitchId] = useState('');

  const switches = nodes.filter(n => n.data.kind === 'switch');

  const handleDeploy = () => {
    if (!targetSwitchId || quantity < 1) return;
    
    const targetSwitch = nodes.find(n => n.id === targetSwitchId);
    if (!targetSwitch) return;

    const startX = targetSwitch.position.x + 150;
    const startY = targetSwitch.position.y - 100;
    
    const newEdges: Edge[] = [];
    
    for (let i = 0; i < quantity; i++) {
      const newNodeId = nanoid();
      const node: AppNode = {
        id: newNodeId,
        type: 'base',
        position: { x: startX + (i % 4) * 80, y: startY + Math.floor(i / 4) * 80 },
        data: { kind: deviceKind, model: deviceModel, config: {} }
      };
      
      addNode(node);
      
      newEdges.push({
        id: `e-${targetSwitchId}-${newNodeId}`,
        source: targetSwitchId,
        target: newNodeId,
        type: 'default'
      });
    }

    addEdges(newEdges);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border border-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Layers className="text-cyan-500 w-5 h-5" />
            <h2 className="text-lg font-bold">Bulk Deployment</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs text-gray-500 uppercase block mb-1">Target Switch</span>
            <select 
              value={targetSwitchId} 
              onChange={e => setTargetSwitchId(e.target.value)}
              className="w-full bg-black/40 border border-gray-800 rounded px-3 py-2 text-sm text-gray-300"
            >
              <option value="">Select a switch...</option>
              {switches.map(s => (
                <option key={s.id} value={s.id}>{s.data.model} ({s.id})</option>
              ))}
            </select>
          </label>

          <div className="flex gap-4">
            <label className="block flex-1">
              <span className="text-xs text-gray-500 uppercase block mb-1">Device Type</span>
              <select 
                value={deviceKind} 
                onChange={e => setDeviceKind(e.target.value)}
                className="w-full bg-black/40 border border-gray-800 rounded px-3 py-2 text-sm text-gray-300"
              >
                <option value="camera">Camera</option>
                <option value="endpoint">Workstation</option>
                <option value="server">Server</option>
              </select>
            </label>

            <label className="block flex-1">
              <span className="text-xs text-gray-500 uppercase block mb-1">Quantity</span>
              <input 
                type="number" 
                min="1" max="48"
                value={quantity} 
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full bg-black/40 border border-gray-800 rounded px-3 py-2 text-sm text-gray-300"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs text-gray-500 uppercase block mb-1">Device Model Name</span>
            <input 
              value={deviceModel} 
              onChange={e => setDeviceModel(e.target.value)}
              className="w-full bg-black/40 border border-gray-800 rounded px-3 py-2 text-sm text-gray-300"
            />
          </label>
        </div>

        <div className="mt-8 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded font-medium transition-colors">Cancel</button>
          <button onClick={handleDeploy} disabled={!targetSwitchId} className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded font-medium transition-colors">Deploy Devices</button>
        </div>
      </div>
    </div>
  );
}
