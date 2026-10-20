import React, { useState, useMemo } from 'react';
import { CargoEntry, LogMessage, PlacedModule, StarSystem } from './types/game';
import { STAR_SYSTEMS, COMMODITIES } from './data/gameData';
import { calculateShipStats, getStarterShip } from './utils/shipEngine';
import { sound } from './utils/audio';

import { Header } from './components/Header';
import { ShipyardView } from './components/ShipyardView';
import { MarketView } from './components/MarketView';
import { GalaxyMapView } from './components/GalaxyMapView';
import { FlightCombatView } from './components/FlightCombatView';
import { LogTerminal } from './components/LogTerminal';
import { EventModal, SpaceEvent } from './components/EventModal';

export const App: React.FC = () => {
  // Main Game State
  const [placedModules, setPlacedModules] = useState<PlacedModule[]>(() => getStarterShip());
  const [credits, setCredits] = useState<number>(1800);
  const [currentSystem, setCurrentSystem] = useState<StarSystem>(STAR_SYSTEMS[0]);
  const [cargo, setCargo] = useState<CargoEntry[]>([
    { commodityId: 'titanium_ingots', quantity: 5, avgBuyPrice: 40 },
  ]);

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'shipyard' | 'map' | 'market' | 'flight'>('shipyard');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeEvent, setActiveEvent] = useState<SpaceEvent | null>(null);

  // Ship stats dynamically computed from placed modules
  const stats = useMemo(() => calculateShipStats(placedModules), [placedModules]);

  // Vitals
  const [currentHp, setCurrentHp] = useState<number>(stats.maxHp);
  const [currentShield, setCurrentShield] = useState<number>(stats.maxShield);

  // Telemetry Event Logs
  const [logs, setLogs] = useState<LogMessage[]>([
    {
      id: 'log_0',
      timestamp: '00:00:01',
      text: 'Vessel systems online. Docked at Sol-Prime Gateway. Welcome, Commander.',
      type: 'info',
    },
  ]);

  const addLog = (text: string, type: 'info' | 'trade' | 'alert' | 'combat' | 'success') => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [
      { id: `log_${Date.now()}_${Math.random()}`, timestamp: timeStr, text, type },
      ...prev.slice(0, 49),
    ]);
  };

  // Cargo count (mass)
  const cargoCount = useMemo(() => {
    return cargo.reduce((sum, item) => {
      const com = COMMODITIES.find((c) => c.id === item.commodityId);
      return sum + (com ? item.quantity * com.unitMass : item.quantity);
    }, 0);
  }, [cargo]);

  // Handle Hyperjump Travel & Encounters
  const handleJumpToSystem = (targetSystem: StarSystem) => {
    setCurrentSystem(targetSystem);
    addLog(`Hyperjump complete. Disengaged warp at [${targetSystem.name}].`, 'info');

    // Check for transit encounters
    const hasSmugglerHold = placedModules.some((m) => m.module.isContrabandShielded);
    const contrabandCargo = cargo.filter((c) => {
      const com = COMMODITIES.find((item) => item.id === c.commodityId);
      return com?.isIllegal;
    });

    // 1. High Security Customs Checkpoint in Core Systems
    if (targetSystem.security >= 4 && contrabandCargo.length > 0) {
      if (hasSmugglerHold) {
        addLog(
          'Patrol customs scanned your holds, but lead-lined smuggler compartments masked your cargo. Clearance granted!',
          'success'
        );
      } else {
        sound.playAlarm();
        setActiveEvent({
          title: 'Imperial Customs Checkpoint',
          type: 'customs',
          description: `Customs patrol drones boarded your vessel and detected ${contrabandCargo.reduce((s, c) => s + c.quantity, 0)} units of unshielded black-market contraband! You have been fined ₡450 and the illicit cargo has been confiscated.`,
          options: [
            {
              label: 'Pay ₡450 Fine & Surrender Contraband',
              variant: 'red',
              action: () => {
                setCredits((prev) => Math.max(0, prev - 450));
                setCargo((prev) =>
                  prev.filter((c) => {
                    const com = COMMODITIES.find((item) => item.id === c.commodityId);
                    return !com?.isIllegal;
                  })
                );
                addLog('Paid ₡450 fine. Illicit contraband seized by station police.', 'alert');
              },
            },
          ],
        });
        return;
      }
    }

    // 2. Pirate Ambush in Lawless / Low-Sec Systems
    if (targetSystem.security === 0 && Math.random() < 0.5) {
      sound.playAlarm();
      setActiveEvent({
        title: 'Corsair Ambush in Transit',
        type: 'pirate',
        description:
          'A pack of heavily armed pirate interceptors drops out of stealth and locks railguns onto your bridge! Their captain demands ₡350 protection tax to permit safe passage.',
        options: [
          {
            label: 'Pay ₡350 Protection Extortion',
            variant: 'amber',
            action: () => {
              setCredits((prev) => Math.max(0, prev - 350));
              addLog('Paid ₡350 protection tax to corsair patrol.', 'alert');
            },
          },
          {
            label: 'Refuse & Man Battle Stations!',
            variant: 'red',
            action: () => {
              sound.playLaser();
              setCurrentTab('flight');
              addLog('Combat alert: Armed hardpoints engaged against hostile corsairs!', 'combat');
            },
          },
        ],
      });
      return;
    }

    // 3. Derelict Salvage Pod (25% chance)
    if (Math.random() < 0.28) {
      sound.playTradeCash();
      setActiveEvent({
        title: 'Derelict Cargo Pod Located',
        type: 'salvage',
        description:
          'Long-range sensors detected an uncrewed drifting container jettisoned by a fleeing freighter. Recovery drones can tractor-beam it into your hold.',
        options: [
          {
            label: 'Recover Cargo (+₡400 & +3 Titanium Ingots)',
            variant: 'sci-fi',
            action: () => {
              setCredits((prev) => prev + 400);
              setCargo((prev) => {
                const ex = prev.find((c) => c.commodityId === 'titanium_ingots');
                if (ex) {
                  return prev.map((c) =>
                    c.commodityId === 'titanium_ingots' ? { ...c, quantity: c.quantity + 3 } : c
                  );
                }
                return [...prev, { commodityId: 'titanium_ingots', quantity: 3, avgBuyPrice: 0 }];
              });
              addLog('Recovered derelict cargo: +₡400 and 3x Titanium Ingots secured!', 'success');
            },
          },
        ],
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* CRT Scanline Visual Effect */}
      <div className="crt-overlay" />

      {/* Main Header & Telemetry Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        credits={credits}
        stats={stats}
        currentHp={currentHp}
        currentShield={currentShield}
        cargoCount={cargoCount}
        currentSystem={currentSystem}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          sound.enabled = !soundEnabled;
          setSoundEnabled(!soundEnabled);
        }}
      />

      {/* Active Tab Screen */}
      <main style={{ flex: 1 }}>
        {currentTab === 'shipyard' && (
          <ShipyardView
            placedModules={placedModules}
            onUpdateModules={(newMods) => {
              setPlacedModules(newMods);
              const newStats = calculateShipStats(newMods);
              setCurrentHp(newStats.maxHp);
              setCurrentShield(newStats.maxShield);
            }}
            stats={stats}
            credits={credits}
            onUpdateCredits={setCredits}
            onLog={addLog}
          />
        )}

        {currentTab === 'market' && (
          <MarketView
            currentSystem={currentSystem}
            cargo={cargo}
            onUpdateCargo={setCargo}
            credits={credits}
            onUpdateCredits={setCredits}
            stats={stats}
            placedModules={placedModules}
            onLog={addLog}
          />
        )}

        {currentTab === 'map' && (
          <GalaxyMapView
            currentSystem={currentSystem}
            onJumpToSystem={handleJumpToSystem}
            stats={stats}
            onLog={addLog}
          />
        )}

        {currentTab === 'flight' && (
          <FlightCombatView
            placedModules={placedModules}
            stats={stats}
            currentHp={currentHp}
            currentShield={currentShield}
            onUpdateHp={setCurrentHp}
            onUpdateShield={setCurrentShield}
            currentSystem={currentSystem}
            credits={credits}
            onUpdateCredits={setCredits}
            onLog={addLog}
          />
        )}
      </main>

      {/* Shipboard Event Telemetry Logs */}
      <LogTerminal logs={logs} onClearLogs={() => setLogs([])} />

      {/* Space Encounter Dialog */}
      <EventModal event={activeEvent} onClose={() => setActiveEvent(null)} />
    </div>
  );
};

export default App;
