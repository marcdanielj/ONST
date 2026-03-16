import type { Node } from '@xyflow/react';

export type Conflict = {
  type: 'IP_CONFLICT' | 'SECURITY_RISK' | 'ROUTING_ERROR';
  message: string;
  tip: string;
};

// Assuming nodes carry config in data.config
export const runValidation = (nodes: Node[]): Record<string, Conflict[]> => {
  const issues: Record<string, Conflict[]> = {};

  const addIssue = (id: string, issue: Conflict) => {
    if (!issues[id]) issues[id] = [];
    issues[id].push(issue);
  };

  // 1. IP Conflict Loop
  const seenIps = new Map<string, string[]>(); // ip -> [nodeIds]
  nodes.forEach(n => {
    const config = n.data?.config as any;
    const ip = config?.ip;
    if (ip) {
      if (!seenIps.has(ip)) seenIps.set(ip, []);
      seenIps.get(ip)!.push(n.id);
    }
  });

  seenIps.forEach((ids, ip) => {
    if (ids.length > 1) {
      ids.forEach(id => {
        addIssue(id, {
          type: 'IP_CONFLICT',
          message: `IP Address Collision: ${ip} is used by multiple devices.`,
          tip: 'Assign a static IP outside the DHCP pool, or set device to DHCP.'
        });
      });
    }
  });

  // 2. Security Risk & Routing Checks
  nodes.forEach(n => {
    const d = n.data as any;
    if (!d || !d.kind || !d.config) return;

    // Security check: High value targets on default VLAN 1
    const riskyKinds = ['camera', 'pos', 'access_control', 'server'];
    if (riskyKinds.includes(d.kind.toLowerCase())) {
      if (d.config.vlanId === 1 || d.config.vlanId === '1') {
        addIssue(n.id, {
          type: 'SECURITY_RISK',
          message: `Security Risk: ${d.kind.toUpperCase()} is on default VLAN 1.`,
          tip: 'Move security devices and endpoints to isolated VLANs (e.g., VLAN 20 for Cameras).'
        });
      }
    }

    // Routing check: Very basic subnet mask heuristic (assuming standard /24 for now)
    const { ip, mask, gw } = d.config;
    if (ip && mask && gw) {
      // Basic check for x.y.z.w vs x.y.z.g matching on first 3 octets for a 255.255.255.0 mask
      if (mask === '255.255.255.0') {
        const ipParts = ip.split('.');
        const gwParts = gw.split('.');
        if (ipParts.length === 4 && gwParts.length === 4) {
          if (ipParts[0] !== gwParts[0] || ipParts[1] !== gwParts[1] || ipParts[2] !== gwParts[2]) {
            addIssue(n.id, {
              type: 'ROUTING_ERROR',
              message: `Unreachable Gateway: ${gw} is not in the ${ip}/${mask} subnet.`,
              tip: 'Ensure the Gateway IP is locally accessible on the configured subnet.'
            });
          }
        }
      }
    }
  });

  return issues;
};
