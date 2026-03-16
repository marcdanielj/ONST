import { Handle, Position } from '@xyflow/react';
import { useStore } from '../../store';
import { Router, Server, Monitor, Video, Network, AlertTriangle } from 'lucide-react';

export default function DeviceNode({ data, id }: any) {
  const conflicts = useStore(s => s.conflicts[id]);
  const isSelected = useStore(s => s.selectedNodeId === id);

  const hasDanger = conflicts && conflicts.length > 0;
  
  let cxClass = 'w-10 h-10 rounded-md flex items-center justify-center border-2 bg-surface relative transition-all shadow-md ';
  if (hasDanger) cxClass += 'border-red-500 shadow-red-500/50 animate-pulse ';
  else if (isSelected) cxClass += 'border-cyan-400 shadow-cyan-400/50 ';
  else cxClass += 'border-gray-700 hover:border-gray-500';

  let Icon = Monitor;
  if (data.kind === 'router') Icon = Router;
  if (data.kind === 'switch') Icon = Network;
  if (data.kind === 'camera') Icon = Video;
  if (data.kind === 'server') Icon = Server;
  if (data.kind === 'endpoint') Icon = Monitor;

  return (
    <div className="flex flex-col items-center">
      <div className={cxClass}>
        <Icon size={20} className={hasDanger ? 'text-red-400' : isSelected ? 'text-cyan-400' : 'text-gray-300'} />
        {/* Connection Handles */}
        <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-gray-500 border-0 opacity-0 group-hover:opacity-100" />
        <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-gray-500 border-0 opacity-0 group-hover:opacity-100" />
        <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-gray-500 border-0 opacity-0 group-hover:opacity-100" />
        <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-gray-500 border-0 opacity-0 group-hover:opacity-100" />
      </div>

      {/* Editable Labels below node */}
      <div className="absolute top-[44px] text-center w-32 -left-[44px]">
        <div className="font-primary font-bold text-xs truncate bg-black/60 px-1 rounded text-gray-200 inline-block pointer-events-none">
          {data?.model || 'Device'}
        </div>
        <div className="font-data text-[10px] text-cyan-400 bg-black/60 px-1 rounded mt-0.5 truncate inline-block pointer-events-none">
          {data?.config?.ip || 'No IP'}
        </div>
      </div>
      
      {hasDanger && (
        <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 shadow-lg">
          <AlertTriangle size={12} className="text-white" />
        </div>
      )}
    </div>
  );
}
