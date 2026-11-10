import React, { useState } from 'react';
import { 
  Car, 
  Search, 
  X, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Gauge, 
  Shield, 
  Fuel, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { fetchNui } from '../utils/nui';

export default function PlayerGarage({ 
  garageName, 
  garageInfo = {}, 
  vehicles = [], 
  accessPointIndex = 1,
  initialExpandedId = null,
  onClose 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(initialExpandedId);
  const [isSpawning, setIsSpawning] = useState(false);
  const [imgErrors, setImgErrors] = useState({});

  const isDepot = garageInfo.type === 'depot';

  const checkIsHere = (veh) => {
    if (veh.isCurrentGarage !== undefined) return Boolean(veh.isCurrentGarage);
    if (!garageName) return true;
    return veh.garage === garageName;
  };

  const sortedVehicles = [...vehicles]
    .filter((veh) => {
      const brand = veh.brand || '';
      const name = veh.name || veh.modelName || '';
      const plate = veh.props?.plate || '';
      const garageLabel = veh.garageLabel || '';
      const query = searchTerm.toLowerCase();

      return (
        brand.toLowerCase().includes(query) ||
        name.toLowerCase().includes(query) ||
        plate.toLowerCase().includes(query) ||
        garageLabel.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const aHere = checkIsHere(a);
      const bHere = checkIsHere(b);

      if (aHere && !bHere) return -1;
      if (!aHere && bHere) return 1;

      const aGaraged = a.state === 1;
      const bGaraged = b.state === 1;
      if (aGaraged && !bGaraged) return -1;
      if (!aGaraged && bGaraged) return 1;

      const aLabel = `${a.brand || ''} ${a.name || a.modelName || ''}`.trim().toLowerCase();
      const bLabel = `${b.brand || ''} ${b.name || b.modelName || ''}`.trim().toLowerCase();
      return aLabel.localeCompare(bLabel);
    });

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleTakeOut = async (e, vehicle) => {
    e.stopPropagation();
    if (isSpawning) return;
    setIsSpawning(true);
    const resp = await fetchNui('spawnVehicle', {
      vehicleId: vehicle.id,
      garageName,
      accessPointIndex,
    });
    setIsSpawning(false);
    if (resp?.success) {
      onClose();
    }
  };

  const getVehicleImageUrl = (modelName) => {
    if (!modelName) return null;
    return `https://docs.fivem.net/vehicles/${modelName.toLowerCase()}.webp`;
  };

  return (
    <div className="ui-container">
      
      <div className="jg-modal-window">
        
        <div className="jg-header">
          <div className="jg-header-left">
            <Car size={22} strokeWidth={2.2} />
            <h2>{garageInfo.label || 'Garage'}</h2>
          </div>
          <button className="jg-close-btn" onClick={onClose} title="Close (ESC)">
            <X size={19} />
          </button>
        </div>

        <div className="jg-search-bar">
          <div className="jg-search-wrapper">
            <Search size={17} color="#71717a" />
            <input
              type="text"
              className="jg-search-input"
              placeholder="Search by name or plate"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="jg-search-clear" onClick={() => setSearchTerm('')}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="jg-vehicle-list">
          {sortedVehicles.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <Car size={46} strokeWidth={1.5} color="#52525b" />
              <p style={{ color: '#71717a', fontSize: 14.5 }}>No vehicles found.</p>
            </div>
          ) : (
            sortedVehicles.map((veh) => {
              const engine = Math.round((veh.props?.engineHealth || 1000) / 10);
              const body = Math.round((veh.props?.bodyHealth || 1000) / 10);
              const fuel = Math.round(veh.props?.fuelLevel || 100);
              const vehLabel = `${veh.brand || ''} ${veh.name || veh.modelName || 'Vehicle'}`.trim();
              const plate = veh.props?.plate || 'UNKNOWN';
              const depotPrice = veh.depotPrice || 0;

              const isGaraged = veh.state === 1;
              const isOut = veh.state === 0;
              const isImpounded = veh.state === 2;

              const isHere = checkIsHere(veh);
              const garageDisplayLabel = veh.garageLabel || garageInfo.label || 'Unknown';

              const isExpanded = expandedId === veh.id;
              const hasImgError = imgErrors[veh.id];

              return (
                <div
                  key={veh.id}
                  className={`jg-row-item ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleExpand(veh.id)}
                >
                  
                  <div className="jg-row-content">
                    
                    <div className="jg-row-icon">
                      {!hasImgError && veh.modelName ? (
                        <img
                          src={getVehicleImageUrl(veh.modelName)}
                          alt={vehLabel}
                          className="jg-vehicle-thumb"
                          loading="lazy"
                          onError={() => setImgErrors((prev) => ({ ...prev, [veh.id]: true }))}
                        />
                      ) : (
                        <Car size={26} strokeWidth={1.7} />
                      )}
                    </div>

                    <div className="jg-row-info">
                      <div className="jg-row-title">{vehLabel}</div>
                      <div className="jg-row-sub">
                        <span className="jg-plate-badge">{plate}</span>
                        <span className="jg-stat-pill">
                          <Fuel size={13} /> {fuel}%
                        </span>
                        <span className="jg-stat-pill">
                          <Gauge size={13} /> {engine}%
                        </span>
                      </div>
                    </div>

                    <div className="jg-row-right">
                      {isImpounded ? (
                        <div className="jg-loc-pill impound">
                          <AlertTriangle size={13.5} strokeWidth={2.5} />
                          <span>Impound</span>
                        </div>
                      ) : isOut ? (
                        <div className="jg-loc-pill outside">
                          <AlertTriangle size={13.5} strokeWidth={2.5} />
                          <span>Outside</span>
                        </div>
                      ) : isHere ? (
                        
                        <div className="jg-loc-pill current-garage">
                          <MapPin size={13.5} strokeWidth={2.5} />
                          <span>{garageDisplayLabel}</span>
                        </div>
                      ) : (
                        
                        <div className="jg-loc-pill other-garage">
                          <MapPin size={13.5} strokeWidth={2} />
                          <span>{garageDisplayLabel}</span>
                        </div>
                      )}

                      <div className="jg-chevron">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="jg-drawer" onClick={(e) => e.stopPropagation()}>
                      
                      <div className="jg-drawer-stats">
                        <div className="jg-stat-bar-item">
                          <span className="jg-stat-bar-label">
                            <Gauge size={13.5} /> Engine
                          </span>
                          <div className="jg-bar-track">
                            <div className="jg-bar-fill" style={{ width: `${Math.min(100, Math.max(5, engine))}%` }} />
                          </div>
                          <span className="jg-bar-val">{engine}%</span>
                        </div>

                        <div className="jg-stat-bar-item">
                          <span className="jg-stat-bar-label">
                            <Shield size={13.5} /> Body
                          </span>
                          <div className="jg-bar-track">
                            <div className="jg-bar-fill" style={{ width: `${Math.min(100, Math.max(5, body))}%` }} />
                          </div>
                          <span className="jg-bar-val">{body}%</span>
                        </div>

                        <div className="jg-stat-bar-item">
                          <span className="jg-stat-bar-label">
                            <Fuel size={13.5} /> Fuel
                          </span>
                          <div className="jg-bar-track">
                            <div className="jg-bar-fill" style={{ width: `${Math.min(100, Math.max(5, fuel))}%` }} />
                          </div>
                          <span className="jg-bar-val">{fuel}%</span>
                        </div>
                      </div>

                      <div className="jg-drawer-action">
                        {isGaraged && isHere && (
                          <button
                            className="jg-action-btn primary"
                            disabled={isSpawning}
                            onClick={(e) => handleTakeOut(e, veh)}
                          >
                            <span>Drive Out</span>
                            <ArrowRight size={16} strokeWidth={2.5} />
                          </button>
                        )}

                        {isGaraged && !isHere && (
                          <button className="jg-action-btn disabled" disabled>
                            Vehicle is parked at {garageDisplayLabel}
                          </button>
                        )}

                        {isOut && isDepot && (
                          <button
                            className="jg-action-btn primary"
                            disabled={isSpawning}
                            onClick={(e) => handleTakeOut(e, veh)}
                          >
                            <span>Claim Vehicle (${depotPrice.toLocaleString()})</span>
                            <ArrowRight size={16} strokeWidth={2.5} />
                          </button>
                        )}

                        {isOut && !isDepot && (
                          <button className="jg-action-btn disabled" disabled>
                            Vehicle is currently out in the world
                          </button>
                        )}

                        {isImpounded && isDepot && (
                          <button
                            className="jg-action-btn primary"
                            disabled={isSpawning}
                            onClick={(e) => handleTakeOut(e, veh)}
                          >
                            <span>Pay Impound (${depotPrice.toLocaleString()})</span>
                            <ArrowRight size={16} strokeWidth={2.5} />
                          </button>
                        )}

                        {isImpounded && !isDepot && (
                          <button className="jg-action-btn disabled" disabled>
                            Impounded — Visit Police Impound Depot
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="jg-footer">
          <span>{vehicles.length} vehicle(s)</span>
        </div>
      </div>
    </div>
  );
}
