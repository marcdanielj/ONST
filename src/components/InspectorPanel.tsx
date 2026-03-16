import { useStore } from '../store';
import { AlertTriangle, ShieldAlert, Zap, Network, Save, X } from 'lucide-react';
import { useState } from 'react';
import { AnyDeviceConfig } from '../types/hardware';

export default function InspectorPanel() {
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const nodes = useStore(s => s.nodes);
  const conflicts = useStore(s => s.conflicts);
  const updateNodeConfig = useStore(s => s.updateNodeConfig);

  const [pendingConfig, setPendingConfig] = useState<Partial<AnyDeviceConfig> | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'ipv4' | 'ports' | 'routing'>('general');

  const node = nodes.find(n => n.id === selectedNodeId);

  if (!node) {
    if (pendingConfig !== null) setPendingConfig(null);
    return null;
  }

  const config = pendingConfig || (node.data.config as AnyDeviceConfig) || {};
  const nodeConflicts = conflicts[node.id];

  const handleChange = (k: string, v: any) => {
    setPendingConfig({ ...config, [k]: v });
  };

  const applyChanges = () => {
    if (pendingConfig) {
      updateNodeConfig(node.id, pendingConfig);
      setPendingConfig(null);
    }
  };

  const discardChanges = () => {
    setPendingConfig(null);
  };

  const getIconForConflict = (type: string) => {
    if (type === 'SECURITY_RISK') return <ShieldAlert className="text-red-500 w-5 h-5 flex-shrink-0" />;
    if (type === 'IP_CONFLICT') return <Zap className="text-yellow-500 w-5 h-5 flex-shrink-0" />;
    return <AlertTriangle className="text-orange-500 w-5 h-5 flex-shrink-0" />;
  };

  const isSwitch = node.data.kind === 'switch';
  const isRouter = node.data.kind === 'router';
  
  // Initialize ports object if needed for UI, even if missing in config
  const portDensity = config.portDensity || 8;
  const currentPorts = config.ports || {};

  const handlePortChange = (portId: number, field: string, val: any) => {
    const existing = currentPorts[portId] || { id: portId, vlanId: 1, poeEnabled: false, portSecurityEnabled: false, connectedMacs: [] };
    handleChange('ports', {
      ...currentPorts,
      [portId]: { ...existing, [field]: val }
    });
  };

  return (
      <div
        className="w-[350px] bg-surface h-full border-l border-gray-800 flex flex-col z-20 shadow-[-10px_0_20px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-surface z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Network className="text-cyan-500 w-5 h-5" />
            <h2 className="font-bold text-lg">Inspector</h2>
          </div>
          <div className="text-xs text-cyan-500 font-data bg-cyan-500/10 px-2 py-1 rounded">{node.id}</div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 shrink-0">
          <button onClick={() => setActiveTab('general')} className={`flex-1 py-3 text-[10px] font-bold uppercase transition-colors ${activeTab === 'general' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>General</button>
          <button onClick={() => setActiveTab('ipv4')} className={`flex-1 py-3 text-[10px] font-bold uppercase transition-colors ${activeTab === 'ipv4' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>IPv4/L3</button>
          {isSwitch && (
            <button onClick={() => setActiveTab('ports')} className={`flex-1 py-3 text-[10px] font-bold uppercase transition-colors ${activeTab === 'ports' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>Ports</button>
          )}
          {isRouter && (
            <button onClick={() => setActiveTab('routing')} className={`flex-1 py-3 text-[10px] font-bold uppercase transition-colors ${activeTab === 'routing' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>Routing</button>
          )}
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Conflicts Module */}
          {nodeConflicts && nodeConflicts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1"><AlertTriangle size={12}/> Active Alerts</h3>
              {nodeConflicts.map((c, i) => (
                <div key={i} className="bg-red-950/30 border border-red-900/50 rounded-md p-3">
                  <div className="flex gap-3">
                    {getIconForConflict(c.type)}
                    <div>
                      <div className="font-bold text-red-400 text-sm mb-1">{c.message}</div>
                      <div className="text-xs text-red-300/80 italic">Tip: {c.tip}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form Module */}
          <div className="space-y-4">
            
            {activeTab === 'general' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                <label className="block">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Device Model</span>
                  <input 
                    disabled
                    value={(node.data.model as string) || 'Generic Device'} 
                    className="w-full bg-black/40 border border-gray-800 rounded px-3 py-2 text-sm text-gray-500"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">MAC Address</span>
                  <input 
                    value={config.mac || ''} 
                    onChange={e => handleChange('mac', e.target.value)}
                    className="w-full bg-black border border-gray-800 focus:border-cyan-500 rounded px-3 py-2 text-sm font-data outline-none transition-colors"
                    placeholder="00:1A:2B:3C:4D:5E"
                  />
                </label>
                {isSwitch && (
                  <label className="block">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Switch Type</span>
                    <select 
                      value={config.switchType || 'managed'} 
                      onChange={e => handleChange('switchType', e.target.value as any)}
                      className="w-full bg-black border border-gray-800 focus:border-cyan-500 rounded px-3 py-2 text-sm outline-none transition-colors text-gray-300"
                    >
                      <option value="hub">Hub (L1)</option>
                      <option value="unmanaged">Unmanaged (L2 Basic)</option>
                      <option value="managed">Managed (L2/L3)</option>
                    </select>
                  </label>
                )}
              </div>
            )}

            {activeTab === 'ipv4' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                <label className="block">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">IP Address</span>
                  <input 
                    value={config.ip || ''} 
                    onChange={e => handleChange('ip', e.target.value)}
                    className="w-full bg-black border border-gray-800 focus:border-cyan-500 rounded px-3 py-2 text-sm font-data outline-none transition-colors"
                    placeholder="192.168.1.10"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Subnet Mask</span>
                  <input 
                    value={config.mask || ''} 
                    onChange={e => handleChange('mask', e.target.value)}
                    className="w-full bg-black border border-gray-800 focus:border-cyan-500 rounded px-3 py-2 text-sm font-data outline-none transition-colors"
                    placeholder="255.255.255.0"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Gateway IP</span>
                  <input 
                    value={config.gw || ''} 
                    onChange={e => handleChange('gw', e.target.value)}
                    className="w-full bg-black border border-gray-800 focus:border-cyan-500 rounded px-3 py-2 text-sm font-data outline-none transition-colors"
                    placeholder="192.168.1.1"
                  />
                </label>
                
                {!isSwitch && !isRouter && (
                  <label className="block">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Native VLAN ID</span>
                    <input 
                      type="number"
                      value={config.vlanId || ''} 
                      onChange={e => handleChange('vlanId', Number(e.target.value))}
                      className="w-full bg-black border border-gray-800 focus:border-cyan-500 rounded px-3 py-2 text-sm font-data outline-none transition-colors"
                      placeholder="10"
                    />
                  </label>
                )}
              </div>
            )}

            {activeTab === 'ports' && isSwitch && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({length: portDensity}).map((_, i) => {
                    const portNum = i + 1;
                    const p = currentPorts[portNum] || { vlanId: 1, poeEnabled: false };
                    return (
                      <div key={portNum} className="bg-black/40 border border-gray-800 p-2 rounded">
                        <div className="font-bold text-xs text-gray-400 mb-2 border-b border-gray-800 pb-1 flex justify-between">
                          <span>Port {portNum}</span>
                          <span className={`${p.poeEnabled ? 'text-amber-400' : 'text-gray-600'}`}><Zap size={12} /></span>
                        </div>
                        <label className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-gray-500 uppercase">VLAN</span>
                          <input 
                            type="number"
                            value={p.vlanId}
                            onChange={(e) => handlePortChange(portNum, 'vlanId', Number(e.target.value))}
                            className="w-12 bg-black border border-gray-700 rounded text-center text-xs py-0.5 outline-none focus:border-cyan-500 font-data"
                          />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-500 uppercase">PoE</span>
                          <input 
                            type="checkbox"
                            checked={p.poeEnabled}
                            onChange={(e) => handlePortChange(portNum, 'poeEnabled', e.target.checked)}
                            className="accent-cyan-500 cursor-pointer"
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'routing' && isRouter && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="p-3 bg-black/40 border border-gray-800 rounded">
                  <h4 className="text-xs font-bold text-gray-300 mb-1">DHCP Server</h4>
                  <div className="space-y-2 mt-3">
                    <label className="block">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Pool Block</span>
                      <input 
                        value="192.168.1.100 - 192.168.1.200"
                        readOnly
                        className="w-full bg-black/40 border border-gray-800 rounded px-2 py-1 text-xs font-data transition-colors text-gray-500"
                      />
                    </label>
                  </div>
                </div>
                <div className="p-3 bg-black/40 border border-gray-800 rounded">
                  <h4 className="text-xs font-bold text-gray-300 mb-2">Static Routes</h4>
                  <p className="text-[10px] text-gray-500">Routing tables will populate automatically based on neighboring topologies or imported configurations.</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Action Buttons */}
        {pendingConfig && (
          <div 
            className="p-4 border-t border-gray-800 flex gap-2 bg-surface shrink-0 z-10"
          >
            <button 
              onClick={discardChanges}
              className="flex-1 py-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors flex justify-center items-center gap-2 font-medium"
            >
              <X size={16} /> Discard
            </button>
            <button 
              onClick={applyChanges}
              className="flex-1 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex justify-center items-center gap-2"
            >
              <Save size={16} /> Apply
            </button>
          </div>
        )}
      </div>
  );
}
