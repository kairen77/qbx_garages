import React, { useState, useEffect, useRef } from 'react';
import { 
  Warehouse, 
  Plus, 
  Search, 
  X, 
  MapPin, 
  Navigation, 
  Edit3, 
  Trash2, 
  Shield, 
  Car, 
  Plane, 
  Ship,
  Layers,
  Building2,
  Anchor,
  Globe,
  ChevronDown,
  Check
} from 'lucide-react';
import GarageFormModal from './GarageFormModal';
import FlagIcon from './FlagIcon';
import { fetchNui } from '../utils/nui';
import { useLanguage } from '../locales';

export default function AdminManager({ garages = {}, onClose, onRefresh, initialCreate = false }) {
  const { lang, setLang, t, languages } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [editingGarage, setEditingGarage] = useState(null);
  const [isCreating, setIsCreating] = useState(initialCreate);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const garageList = Object.entries(garages).map(([name, data]) => ({
    name,
    ...data,
  }));

  const totalCount = garageList.length;
  const carCount = garageList.filter((g) => !g.vehicleType || g.vehicleType === 'car').length;
  const airSeaCount = garageList.filter((g) => g.vehicleType === 'air' || g.vehicleType === 'sea').length;
  const restrictedCount = garageList.filter((g) => g.groups || g.type === 'depot').length;

  const publicCount = garageList.filter((g) => !g.groups && g.type !== 'depot').length;
  const jobCount = garageList.filter((g) => g.groups && !['ballas', 'families', 'lostmc', 'cartel'].includes(typeof g.groups === 'string' ? g.groups : '')).length;
  const gangCount = garageList.filter((g) => ['ballas', 'families', 'lostmc', 'cartel'].includes(typeof g.groups === 'string' ? g.groups : '')).length;
  const depotCount = garageList.filter((g) => g.type === 'depot').length;

  const filteredGarages = garageList.filter((g) => {
    const matchSearch =
      g.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'public') return !g.groups && g.type !== 'depot';
    if (selectedFilter === 'job') return g.groups && !['ballas', 'families', 'lostmc', 'cartel'].includes(typeof g.groups === 'string' ? g.groups : '');
    if (selectedFilter === 'gang') return ['ballas', 'families', 'lostmc', 'cartel'].includes(typeof g.groups === 'string' ? g.groups : '');
    if (selectedFilter === 'depot') return g.type === 'depot';
    return true;
  });

  const handleTeleport = async (coords) => {
    if (!coords) return;
    await fetchNui('teleportToCoords', { coords });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const resp = await fetchNui('deleteGarage', { name: deleteTarget.name });
    setIsDeleting(false);
    setDeleteTarget(null);
    if (resp?.success) {
      onRefresh();
    }
  };

  const handleSaveGarage = async (garageData) => {
    const resp = await fetchNui('saveGarage', garageData);
    if (resp?.success) {
      setIsCreating(false);
      setEditingGarage(null);
      onRefresh();
    } else {
      alert(resp?.message || 'Failed to save garage');
    }
  };

  const getVehicleTypeIcon = (type) => {
    if (type === 'air') return <Plane size={13} />;
    if (type === 'sea') return <Ship size={13} />;
    return <Car size={13} />;
  };

  const isFormOpen = isCreating || Boolean(editingGarage);

  return (
    <div className="ui-container">
      <div 
        className="modal-window admin-manager-window"
        style={{ display: isFormOpen ? 'none' : 'flex' }}
      >
        
        <div className="window-header">
          <div className="header-left">
            <div className="header-icon">
              <Warehouse size={22} strokeWidth={2} />
            </div>
            <div className="header-title">
              <h2>{t('admin_title')}</h2>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} title="Close (ESC)">
            <X size={18} />
          </button>
        </div>

        <div className="metrics-banner">
          <div className="metric-card">
            <div className="metric-icon-wrap">
              <Layers size={18} />
            </div>
            <div className="metric-data">
              <span className="metric-val">{totalCount}</span>
              <span className="metric-lbl">{t('total_garages')}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap">
              <Car size={18} />
            </div>
            <div className="metric-data">
              <span className="metric-val">{carCount}</span>
              <span className="metric-lbl">{t('ground_parking')}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap">
              <Anchor size={18} />
            </div>
            <div className="metric-data">
              <span className="metric-val">{airSeaCount}</span>
              <span className="metric-lbl">{t('air_marine')}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap">
              <Shield size={18} />
            </div>
            <div className="metric-data">
              <span className="metric-val">{restrictedCount}</span>
              <span className="metric-lbl">{t('restricted_depot')}</span>
            </div>
          </div>
        </div>

        <div className="controls-bar">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              className="search-input"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#71717a',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-tabs">
            {[
              { id: 'all', label: t('filter_all'), count: totalCount },
              { id: 'public', label: t('filter_public'), count: publicCount },
              { id: 'job', label: t('filter_job'), count: jobCount },
              { id: 'gang', label: t('filter_gang'), count: gangCount },
              { id: 'depot', label: t('filter_depot'), count: depotCount },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`filter-tab ${selectedFilter === tab.id ? 'active' : ''}`}
                onClick={() => setSelectedFilter(tab.id)}
              >
                <span>{tab.label}</span>
                <span className="tab-count">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="lang-picker-wrapper" ref={langDropdownRef}>
            <button
              type="button"
              className="lang-picker-btn"
              onClick={() => setLangOpen(!langOpen)}
              title={languages.find((l) => l.code === lang)?.name || 'Language'}
            >
              <FlagIcon code={lang} width={22} height={15} />
              <ChevronDown size={13} style={{ opacity: 0.65 }} />
            </button>

            {langOpen && (
              <div className="lang-picker-menu">
                <div className="lang-picker-list">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      className={`lang-picker-item ${lang === l.code ? 'active' : ''}`}
                      onClick={() => {
                        setLang(l.code);
                        setLangOpen(false);
                      }}
                    >
                      <FlagIcon code={l.code} width={20} height={14} />
                      <span className="lang-picker-name">{l.name}</span>
                      {lang === l.code && <Check size={14} strokeWidth={2.5} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="primary-btn" onClick={() => setIsCreating(true)}>
            <Plus size={16} strokeWidth={2.5} /> {t('add_new_garage')}
          </button>
        </div>

        <div className="content-area">
          {filteredGarages.length === 0 ? (
            <div className="empty-state">
              <Warehouse size={48} strokeWidth={1.5} />
              <p>{t('no_garages')}</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('th_name')}</th>
                  <th>{t('th_category')}</th>
                  <th>{t('th_type')}</th>
                  <th>{t('th_access')}</th>
                  <th>{t('th_heading')}</th>
                  <th style={{ textAlign: 'right' }}>{t('th_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredGarages.map((g) => {
                  const accessPoint = g.accessPoints?.[0];
                  const heading = accessPoint?.spawn?.w || accessPoint?.coords?.w || 0;
                  const isDepot = g.type === 'depot';

                  return (
                    <tr key={g.name}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{g.label}</div>
                        <div style={{ fontSize: 11.5, color: '#71717a', fontFamily: 'monospace' }}>
                          {g.name}
                        </div>
                      </td>
                      <td>
                        {isDepot ? (
                          <span className="badge" style={{ background: '#18181b', borderColor: 'rgba(255,255,255,0.25)' }}>
                            {t('badge_depot')}
                          </span>
                        ) : g.groups ? (
                          <span className="badge">
                            <Shield size={12} strokeWidth={2} /> {t('badge_restricted')}
                          </span>
                        ) : (
                          <span className="badge">{t('badge_public')}</span>
                        )}
                      </td>
                      <td>
                        <span className="badge">
                          {getVehicleTypeIcon(g.vehicleType)}
                          {g.vehicleType?.toUpperCase() || 'CAR'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12.5, color: '#a1a1aa' }}>
                          {g.groups
                            ? typeof g.groups === 'string'
                              ? g.groups
                              : Object.keys(g.groups).join(', ')
                            : t('open_to_everyone')}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12.5, fontFamily: 'monospace', color: '#ffffff', fontWeight: 600 }}>
                          {Number(heading).toFixed(1)}°
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="icon-btn"
                            title={t('tip_tp_coords')}
                            onClick={() => handleTeleport(accessPoint?.coords)}
                          >
                            <MapPin size={15} />
                          </button>
                          <button
                            className="icon-btn"
                            title={t('tip_tp_spawn')}
                            onClick={() => handleTeleport(accessPoint?.spawn || accessPoint?.coords)}
                          >
                            <Navigation size={15} />
                          </button>
                          <button
                            className="icon-btn"
                            title={t('tip_edit')}
                            onClick={() => setEditingGarage(g)}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            className="icon-btn"
                            title={t('tip_delete')}
                            onClick={() => setDeleteTarget({ name: g.name, label: g.label })}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {deleteTarget && (
          <div className="delete-modal-overlay">
            <div className="delete-modal-window">
              <div className="delete-modal-header">
                <div className="delete-icon-wrap">
                  <Trash2 size={22} strokeWidth={2.2} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
                    {t('delete_title')}
                  </h3>
                  <p style={{ fontSize: 13, color: '#a1a1aa', marginTop: 4, lineHeight: 1.4 }}>
                    {t('delete_confirm_text')} <strong style={{ color: '#ffffff' }}>"{deleteTarget.label}"</strong>?
                  </p>
                </div>
                <button className="close-btn" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                  <X size={17} />
                </button>
              </div>

              <div className="delete-modal-body">
                <div className="delete-warning-box">
                  <p style={{ margin: 0, fontSize: 12.5, color: '#d4d4d8', lineHeight: 1.5 }}>
                    Garage ID: <code style={{ fontFamily: 'monospace', color: '#ffffff', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>{deleteTarget.name}</code>
                    <br />
                    <span style={{ fontSize: 11.5, color: '#71717a', marginTop: 4, display: 'inline-block' }}>
                      {t('delete_warning_text')}
                    </span>
                  </p>
                </div>
              </div>

              <div className="delete-modal-footer">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  className="danger-btn"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  <Trash2 size={15} strokeWidth={2.2} />
                  {isDeleting ? t('deleting') : t('btn_delete_garage')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isFormOpen && (
        <GarageFormModal
          isEdit={Boolean(editingGarage)}
          garage={editingGarage}
          onClose={() => {
            setIsCreating(false);
            setEditingGarage(null);
          }}
          onSave={handleSaveGarage}
        />
      )}
    </div>
  );
}
