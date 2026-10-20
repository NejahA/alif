import { PlacedModule, ShipStats } from '../types/game';
import { MODULE_CATALOG } from '../data/gameData';

export const GRID_SIZE = 5;

export function calculateShipStats(placedModules: PlacedModule[]): ShipStats {
  let totalMass = 0;
  let powerGen = 0;
  let powerDraw = 0;
  let maxHp = 0;
  let maxShield = 0;
  let cargoCapacity = 0;
  let thrust = 0;
  let dps = 0;

  for (const item of placedModules) {
    const mod = item.module;
    totalMass += mod.mass;
    if (mod.power > 0) {
      powerGen += mod.power;
    } else {
      powerDraw += Math.abs(mod.power);
    }
    maxHp += mod.hullHp;
    maxShield += mod.shieldHp;
    cargoCapacity += mod.cargoCap;
    thrust += mod.thrust;
    if (mod.damage > 0) {
      dps += mod.damage * (mod.fireRate || 1);
    }
  }

  const netPower = powerGen - powerDraw;
  const topSpeed = thrust > 0 ? Math.round((thrust / Math.max(totalMass, 30)) * 32) : 0;
  const turnRate = Math.max(1.2, Number((4.5 - totalMass / 90).toFixed(2)));
  const jumpRange = Math.max(1, Math.round(6 - totalMass / 120));

  return {
    totalMass,
    powerGen,
    powerDraw,
    netPower,
    maxHp,
    maxShield,
    cargoCapacity,
    thrust,
    topSpeed,
    turnRate,
    dps,
    jumpRange,
  };
}

export function getStarterShip(): PlacedModule[] {
  const getMod = (id: string) => {
    const found = MODULE_CATALOG.find((m) => m.id === id);
    if (!found) throw new Error(`Module ${id} not found`);
    return found;
  };

  return [
    { gridX: 2, gridY: 0, module: getMod('weapon_gauss'), currentHp: 70 },
    { gridX: 2, gridY: 1, module: getMod('cockpit_scout'), currentHp: 100 },
    { gridX: 1, gridY: 1, module: getMod('armor_plate'), currentHp: 180 },
    { gridX: 3, gridY: 1, module: getMod('armor_plate'), currentHp: 180 },
    { gridX: 2, gridY: 2, module: getMod('reactor_fusion'), currentHp: 80 },
    { gridX: 1, gridY: 2, module: getMod('cargo_pod'), currentHp: 75 },
    { gridX: 3, gridY: 2, module: getMod('cargo_pod'), currentHp: 75 },
    { gridX: 2, gridY: 3, module: getMod('thruster_ion'), currentHp: 60 },
    { gridX: 2, gridY: 4, module: getMod('thruster_ion'), currentHp: 60 },
    { gridX: 1, gridY: 3, module: getMod('shield_deflector'), currentHp: 50 },
  ];
}
