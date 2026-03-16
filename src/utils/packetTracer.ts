import { AppNode } from '../store';
import { Edge } from '@xyflow/react';

export interface TraceHop {
  hopId: string;
  status: 'success' | 'drop';
  reason?: string;
  layer?: 'L1' | 'L2' | 'L3';
}

function buildAdjacencyList(edges: Edge[]) {
  const adj = new Map<string, string[]>();
  edges.forEach(e => {
    if (!adj.has(e.source)) adj.set(e.source, []);
    if (!adj.has(e.target)) adj.set(e.target, []);
    adj.get(e.source)!.push(e.target);
    adj.get(e.target)!.push(e.source);
  });
  return adj;
}

function ipToLong(ip: string) {
  if (!ip) return 0;
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function getSubnet(ip: string, mask: string) {
  if (!ip || !mask) return null;
  return ipToLong(ip) & ipToLong(mask);
}

function sameSubnet(ip1?: string, mask1?: string, ip2?: string) {
  if (!ip1 || !mask1 || !ip2) return false;
  return getSubnet(ip1, mask1) === getSubnet(ip2, mask1);
}

export function tracePacket(
  nodes: AppNode[],
  edges: Edge[],
  sourceId: string,
  destId: string
): TraceHop[] {
  const hops: TraceHop[] = [];
  const source = nodes.find(n => n.id === sourceId);
  const dest = nodes.find(n => n.id === destId);
  
  if (!source || !dest) return hops;

  hops.push({ hopId: source.id, status: 'success' });
  
  const srcIp = source.data.config.ip || '';
  const srcMask = source.data.config.mask || '';
  const srcGw = source.data.config.gw || '';
  const dstIp = dest.data.config.ip || '';

  const isLocal = sameSubnet(srcIp, srcMask, dstIp);
  
  const adj = buildAdjacencyList(edges);
  const queue = [{ id: source.id, path: [source.id] }];
  const visited = new Set<string>();
  visited.add(source.id);
  
  let foundPath: string[] | null = null;
  
  // Find shortest physical path
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.id === dest.id) {
      foundPath = current.path;
      break;
    }
    const neighbors = adj.get(current.id) || [];
    for (const n of neighbors) {
      if (!visited.has(n)) {
        visited.add(n);
        queue.push({ id: n, path: [...current.path, n] });
      }
    }
  }

  if (!foundPath) {
    hops[hops.length - 1] = { hopId: source.id, status: 'drop', reason: 'No physical link path to destination.', layer: 'L1' };
    return hops;
  }
  
  if (!isLocal && !srcGw) {
    hops[0] = { hopId: source.id, status: 'drop', reason: 'No Gateway configured for non-local routing.', layer: 'L3' };
    return hops;
  }

  // let currentVlan = source.data.config.vlanId || 1;
  let hasCrossedRouter = false;

  for (let i = 1; i < foundPath.length; i++) {
    const hopNodeId = foundPath[i];
    const node = nodes.find(n => n.id === hopNodeId)!;
    
    if (node.data.kind === 'switch') {
      const swType = node.data.config.switchType as string;
      if (swType === 'managed') {
        // Placeholder for true ingress/egress check based on ports config
        hops.push({ hopId: node.id, status: 'success', layer: 'L2' });
      } else {
        hops.push({ hopId: node.id, status: 'success', layer: 'L2' });
      }
    } else if (node.data.kind === 'router') {
      if (!isLocal) {
        hasCrossedRouter = true;
        // currentVlan = 1; Routing conceptually strips L2 tags
        hops.push({ hopId: node.id, status: 'success', layer: 'L3' });
      } else {
        hops.push({ hopId: node.id, status: 'drop', reason: 'Local traffic unintentionally hitting router interface.', layer: 'L3' });
        break;
      }
    } else {
      if (node.id === dest.id) {
         if (!isLocal && !hasCrossedRouter) {
           hops.push({ hopId: node.id, status: 'drop', reason: 'Reached dest but never crossed a Gateway for remote subnet.', layer: 'L3' });
         } else {
           hops.push({ hopId: node.id, status: 'success', layer: 'L3' });
         }
      } else {
        hops.push({ hopId: node.id, status: 'drop', reason: 'Traffic illegally traversing terminal endpoint.', layer: 'L2' });
        break;
      }
    }
  }
  
  return hops;
}
