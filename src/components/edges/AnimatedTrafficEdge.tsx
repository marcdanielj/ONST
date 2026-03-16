import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import { useStore } from '../../store';

export default function AnimatedTrafficEdge({
  sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, source, target
}: EdgeProps) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  
  const activeTrace = useStore(s => s.activeTrace);
  
  let animationState = 'none'; // 'success' | 'drop' | 'none'
  if (activeTrace) {
    for (let i = 0; i < activeTrace.length - 1; i++) {
        const curr = activeTrace[i];
        const next = activeTrace[i+1];
        if ((curr.hopId === source && next.hopId === target) || (curr.hopId === target && next.hopId === source)) {
           animationState = next.status; 
           break;
        }
    }
  }

  const color = animationState === 'success' ? '#22c55e' : animationState === 'drop' ? '#ef4444' : '#4b5563';
  const width = animationState !== 'none' ? 3 : 1.5;
  const isAnimated = animationState !== 'none';

  return (
    <>
      <BaseEdge 
         path={edgePath} 
         style={{ stroke: color, strokeWidth: width, transition: 'all 0.3s' }} 
      />
      {isAnimated && (
        <circle r="4" fill={color}>
          <animateMotion dur="1s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </>
  );
}
