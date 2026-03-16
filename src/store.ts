import { create } from 'zustand';
import { Node, Edge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react';
import { runValidation, Conflict } from './utils/conflictEngine';
import { DeviceNodeData, AnyDeviceConfig } from './types/hardware';
import { tracePacket, TraceHop } from './utils/packetTracer';

export type AppNode = Node<DeviceNodeData>;

interface NetworkState {
  nodes: AppNode[];
  edges: Edge[];
  sessionActive: boolean;
  conflicts: Record<string, Conflict[]>;
  selectedNodeId: string | null;
  blueprintImage: string | null;
  activeTrace: TraceHop[] | null;

  startNewSession: () => void;
  loadSession: (data: any) => void;
  setBlueprintImage: (url: string | null) => void;
  runTrace: (srcId: string, dstId: string) => void;
  clearTrace: () => void;
  
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  
  addNode: (node: AppNode) => void;
  addEdges: (newEdges: Edge[]) => void;
  updateNodeConfig: (id: string, newConfig: Partial<AnyDeviceConfig>) => void;
  setSelectedNode: (id: string | null) => void;
  
  validateNetwork: () => void;
}

export const useStore = create<NetworkState>((set, get) => ({
  nodes: [],
  edges: [],
  sessionActive: false,
  conflicts: {},
  selectedNodeId: null,
  blueprintImage: null,
  activeTrace: null,

  startNewSession: () => set({ sessionActive: true, nodes: [], edges: [], conflicts: {}, blueprintImage: null, activeTrace: null }),
  loadSession: (data) => set({ 
    sessionActive: true, 
    nodes: (data.nodes || []) as AppNode[], 
    edges: data.edges || [],
    blueprintImage: data.blueprintImage || null,
    activeTrace: null
  }),

  setBlueprintImage: (url) => set({ blueprintImage: url }),
  
  runTrace: (srcId, dstId) => {
    const hops = tracePacket(get().nodes, get().edges, srcId, dstId);
    set({ activeTrace: hops });
  },
  clearTrace: () => set({ activeTrace: null }),

  onNodesChange: (changes) => set({
    nodes: applyNodeChanges(changes, get().nodes) as AppNode[]
  }),
  onEdgesChange: (changes) => set({
    edges: applyEdgeChanges(changes, get().edges)
  }),

  addNode: (node) => set(s => ({ nodes: [...s.nodes, node] })),
  addEdges: (newEdges) => set(s => ({ edges: [...s.edges, ...newEdges] })),
  
  updateNodeConfig: (id, newConfig) => {
    set(s => ({
      nodes: s.nodes.map(n => 
        n.id === id 
          ? { ...n, data: { ...n.data, config: { ...(n.data.config as object), ...newConfig } } }
          : n
      )
    }));
    get().validateNetwork(); // Re-validate on change
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  validateNetwork: () => {
    const issues = runValidation(get().nodes);
    set({ conflicts: issues });
  }
}));
