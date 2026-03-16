export type DeviceKind = 'switch' | 'router' | 'endpoint' | 'camera' | 'server';

export interface BaseDeviceConfig {
  ip?: string;
  mask?: string;
  gw?: string;
  mac?: string;
  vlanId?: number;
}

export type PortDensity = 4 | 8 | 16 | 24 | 48;
export type SwitchType = 'hub' | 'unmanaged' | 'managed';
export type PoERating = 'none' | 'poe' | 'poe+' | 'poe++';

export interface PortConfig {
  id: number;
  vlanId: number;
  poeEnabled: boolean;
  portSecurityEnabled: boolean;
  connectedMacs: string[];
}

export interface SwitchConfig extends BaseDeviceConfig {
  switchType: SwitchType;
  portDensity: PortDensity;
  poeRating: PoERating;
  ports: Record<number, PortConfig>; // Index is port number e.g., 1..24
}

export interface DhcpPool {
  id: string;
  startIp: string;
  endIp: string;
  subnetMask: string;
  defaultGateway: string;
}

export interface StaticRoute {
  id: string;
  network: string;
  mask: string;
  nextHop: string;
}

export interface RouterConfig extends BaseDeviceConfig {
  dhcpPools: DhcpPool[];
  staticRoutes: StaticRoute[];
}

export type EndpointConfig = BaseDeviceConfig;

export type AnyDeviceConfig = Partial<SwitchConfig & RouterConfig & EndpointConfig>;

export interface DeviceNodeData extends Record<string, unknown> {
  kind: DeviceKind | string;
  model: string;
  config: AnyDeviceConfig;
}
