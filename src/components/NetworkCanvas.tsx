import { useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, ReactFlowProvider, useViewport } from '@xyflow/react';
import { useStore } from '../store';
import '@xyflow/react/dist/style.css';
import DeviceNode from './nodes/DeviceNode';
import AnimatedTrafficEdge from './edges/AnimatedTrafficEdge';
import TestConnectionTool from './TestConnectionTool';

const BlueprintLayer = () => {
  const { x, y, zoom } = useViewport();
  const blueprintImage = useStore(s => s.blueprintImage);

  if (!blueprintImage) return null;

  return (
    <div 
      className="absolute pointer-events-none origin-top-left" 
      style={{ transform: `translate(${x}px, ${y}px) scale(${zoom})`, zIndex: 0 }}
    >
      <img src={blueprintImage} className="opacity-40 max-w-none" alt="Blueprint Background" />
    </div>
  );
};

function CanvasInner() {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const onNodesChange = useStore((state) => state.onNodesChange);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const setSelectedNode = useStore((state) => state.setSelectedNode);

  const nodeTypes: any = useMemo(() => ({ base: DeviceNode }), []);
  const edgeTypes: any = useMemo(() => ({ default: AnimatedTrafficEdge }), []);

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <>
      <BlueprintLayer />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background gap={24} size={2} color="#2d2d34" />
        <Controls showInteractive={false} className="bg-surface border-gray-800 fill-white" />
      </ReactFlow>
    </>
  );
}

export default function NetworkCanvas() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#1e1e24] z-0">
      <ReactFlowProvider>
        <CanvasInner />
      </ReactFlowProvider>
      <TestConnectionTool />
    </div>
  );
}
