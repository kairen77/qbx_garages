import React, { useState, useEffect } from 'react';
import PlayerGarage from './components/PlayerGarage';
import AdminManager from './components/AdminManager';
import { fetchNui, isEnvBrowser } from './utils/nui';
import { Car, Shield } from 'lucide-react';
import bgImage from './assets/bg.jpg';

const MOCK_ADMIN_GARAGES = {
  motelgarage: {
    label: 'Motel Parking',
    vehicleType: 'car',
    accessPoints: [
      {
        blip: { name: 'Public Parking', sprite: 357, color: 3 },
        coords: { x: 275.58, y: -344.74, z: 45.17, w: 70.0 },
        spawn: { x: 271.26, y: -342.32, z: 44.7, w: 159.97 },
        dropPoint: { x: 271.26, y: -342.32, z: 44.7 },
      },
    ],
  },
  pillboxgarage: {
    label: 'Legion Square',
    vehicleType: 'car',
    accessPoints: [
      {
        blip: { name: 'Legion Square', sprite: 357, color: 3 },
        coords: { x: 218.66, y: -804.08, z: 30.75, w: 65.69 },
        spawn: { x: 229.33, y: -805.01, z: 30.54, w: 156.79 },
        dropPoint: { x: 229.33, y: -805.01, z: 30.54 },
      },
    ],
  },
  police: {
    label: 'Mission Row Police Garage',
    vehicleType: 'car',
    groups: 'police',
    shared: true,
    accessPoints: [
      {
        coords: { x: 454.6, y: -1017.4, z: 28.4, w: 0.0 },
        spawn: { x: 438.4, y: -1018.3, z: 27.7, w: 90.0 },
      },
    ],
  },
  ballas: {
    label: 'Ballas Gang Garage',
    vehicleType: 'car',
    groups: 'ballas',
    accessPoints: [
      {
        coords: { x: 98.5, y: -1954.49, z: 20.84, w: 0.0 },
        spawn: { x: 98.5, y: -1954.49, z: 20.75, w: 335.73 },
      },
    ],
  },
  intairport: {
    label: 'LSIA Airport Hangar',
    vehicleType: 'air',
    accessPoints: [
      {
        blip: { name: 'Hangar', sprite: 360, color: 3 },
        coords: { x: -1025.34, y: -3017.0, z: 13.95, w: 331.99 },
        spawn: { x: -979.2, y: -2995.51, z: 13.95, w: 52.19 },
      },
    ],
  },
  impoundlot: {
    label: 'Central Police Impound',
    type: 'depot',
    vehicleType: 'car',
    accessPoints: [
      {
        blip: { name: 'Impound Lot', sprite: 68, color: 3 },
        coords: { x: 400.45, y: -1630.87, z: 29.29, w: 228.88 },
        spawn: { x: 407.2, y: -1645.58, z: 29.31, w: 228.28 },
      },
    ],
  },
};

const MOCK_PLAYER_GARAGE = {
  garageName: 'pillboxgarage',
  garageInfo: {
    label: 'Legion Square',
    vehicleType: 'car',
  },
  accessPointIndex: 1,
  vehicles: [
    {
      id: 101,
      brand: 'Benefactor',
      name: 'XLS',
      modelName: 'xls',
      garage: 'pillboxgarage',
      garageLabel: 'Legion Square',
      isCurrentGarage: true,
      state: 1,
      depotPrice: 0,
      props: {
        plate: '45BCQ774',
        engineHealth: 880,
        bodyHealth: 900,
        fuelLevel: 65,
      },
    },
    {
      id: 102,
      brand: 'Enus',
      name: 'Deity',
      modelName: 'deity',
      garage: 'motelgarage',
      garageLabel: 'Motel Parking',
      isCurrentGarage: false,
      state: 1,
      depotPrice: 0,
      props: {
        plate: '48CUE650',
        engineHealth: 980,
        bodyHealth: 1000,
        fuelLevel: 85,
      },
    },
    {
      id: 103,
      brand: 'Vapid',
      name: 'Contender',
      modelName: 'contender',
      garage: 'grovestreet',
      garageLabel: 'Grove Street',
      isCurrentGarage: false,
      state: 0,
      depotPrice: 0,
      props: {
        plate: '44KKY346',
        engineHealth: 750,
        bodyHealth: 800,
        fuelLevel: 45,
      },
    },
    {
      id: 104,
      brand: 'Karin',
      name: 'Vivanite',
      modelName: 'vivanite',
      garage: 'impoundlot',
      garageLabel: 'Police Impound',
      isCurrentGarage: false,
      state: 2,
      depotPrice: 1500,
      props: {
        plate: '48YGY676',
        engineHealth: 920,
        bodyHealth: 960,
        fuelLevel: 70,
      },
    },
  ],
};

export default function App() {
  const inBrowser = isEnvBrowser();
  const [view, setView] = useState(inBrowser ? 'player' : null);
  const [garageData, setGarageData] = useState(inBrowser ? MOCK_PLAYER_GARAGE : null);
  const [adminGarages, setAdminGarages] = useState(inBrowser ? MOCK_ADMIN_GARAGES : {});

  useEffect(() => {
    const handleMessage = (event) => {
      const { action, data } = event.data;

      if (action === 'openGarage') {
        setGarageData(data);
        setView('player');
      } else if (action === 'openAdminManager') {
        setAdminGarages(data.garages || {});
        setView('admin');
      } else if (action === 'updateGarages') {
        setAdminGarages(data.garages || {});
      } else if (action === 'close') {
        setView(null);
        setGarageData(null);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (inBrowser) {
      document.body.style.backgroundImage = `url(${bgImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
    } else {
      document.body.style.background = 'transparent';
    }
  }, [inBrowser]);

  const handleClose = () => {
    if (!inBrowser) {
      setView(null);
      setGarageData(null);
    }
    fetchNui('closeUI');
  };

  const handleRefreshAdmin = async () => {
    const resp = await fetchNui('getGarages');
    if (resp?.garages) {
      setAdminGarages(resp.garages);
    }
  };

  return (
    <div
      style={
        inBrowser
          ? {
            width: '100vw',
            height: '100vh',
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }
          : undefined
      }
    >

      {inBrowser && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#0e1118',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 12,
            padding: 6,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.85)',
          }}
        >
          <button
            type="button"
            title="Player Garage Preview"
            onClick={() => {
              setGarageData(MOCK_PLAYER_GARAGE);
              setView('player');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              background: view === 'player' ? '#ffffff' : '#141720',
              color: view === 'player' ? '#000000' : '#a1a1aa',
              border: '1px solid',
              borderColor: view === 'player' ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Car size={18} strokeWidth={2.2} />
          </button>

          <button
            type="button"
            title="Admin Manager Preview (/admingarage)"
            onClick={() => setView('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              background: view === 'admin' ? '#ffffff' : '#141720',
              color: view === 'admin' ? '#000000' : '#a1a1aa',
              border: '1px solid',
              borderColor: view === 'admin' ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Shield size={18} strokeWidth={2.2} />
          </button>
        </div>
      )}

      {view === 'player' && garageData && (
        <PlayerGarage
          garageName={garageData.garageName}
          garageInfo={garageData.garageInfo}
          vehicles={garageData.vehicles}
          accessPointIndex={garageData.accessPointIndex}
          onClose={handleClose}
        />
      )}

      {view === 'admin' && (
        <AdminManager
          garages={adminGarages}
          onClose={handleClose}
          onRefresh={handleRefreshAdmin}
        />
      )}
    </div>
  );
}
