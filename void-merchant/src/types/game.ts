export type ModuleType =
  | 'cockpit'
  | 'reactor'
  | 'thruster'
  | 'cargo'
  | 'smuggler_hold'
  | 'shield'
  | 'weapon'
  | 'armor';

export interface ShipModule {
  id: string;
  name: string;
  type: ModuleType;
  description: string;
  cost: number;
  mass: number; // in tons
  power: number; // Positive = generates MW, Negative = consumes MW
  hullHp: number;
  shieldHp: number;
  cargoCap: number;
  thrust: number; // in kN
  damage: number; // weapon DPS
  fireRate: number; // shots per sec
  color: string;
  symbol: string;
  isIllegal?: boolean;
  isContrabandShielded?: boolean;
}

export interface PlacedModule {
  gridX: number;
  gridY: number;
  module: ShipModule;
  currentHp: number;
}

export interface ShipStats {
  totalMass: number;
  powerGen: number;
  powerDraw: number;
  netPower: number;
  maxHp: number;
  maxShield: number;
  cargoCapacity: number;
  thrust: number;
  topSpeed: number;
  turnRate: number;
  dps: number;
  jumpRange: number;
}

export type CommodityCategory = 'minerals' | 'technology' | 'medical' | 'luxury' | 'contraband';

export interface Commodity {
  id: string;
  name: string;
  category: CommodityCategory;
  basePrice: number;
  isIllegal: boolean;
  unitMass: number;
  icon: string;
  description: string;
}

export interface MarketItem {
  commodityId?: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
}

export interface StarSystem {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  type: 'core' | 'mining' | 'pirate' | 'research';
  security: number; // 0 to 5
  x: number; // map coordinates
  y: number;
  market: Record<string, MarketItem>;
  accentColor: string;
}

export interface CargoEntry {
  commodityId: string;
  quantity: number;
  avgBuyPrice: number;
}

export interface LogMessage {
  id: string;
  timestamp: string;
  text: string;
  type: 'info' | 'trade' | 'alert' | 'combat' | 'success';
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  isPlayer: boolean;
  color: string;
  life: number;
  maxLife: number;
}

export interface EnemyShip {
  id: string;
  name: string;
  type: 'corsair' | 'corvette' | 'patrol';
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  speed: number;
  dps: number;
  bounty: number;
  lootCores: number;
  fireCooldown: number;
}
