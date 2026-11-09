import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Car, 
  Save, 
  Crosshair, 
  Check, 
  AlertCircle,
  Shield,
  Layers,
  Palette
} from 'lucide-react';
import { fetchNui } from '../utils/nui';
import { useLanguage } from '../locales';

export default function GarageFormModal({ garage, isEdit, onClose, onSave }) {
  const { t } = useLanguage();

  const hasSeparateDrop = Boolean(
    garage?.accessPoints?.[0]?.dropPoint &&
    garage?.accessPoints?.[0]?.spawn &&
    (
      Math.abs((Number(garage.accessPoints[0].dropPoint.x) || 0) - (Number(garage.accessPoints[0].spawn.x) || 0)) > 0.5 ||
      Math.abs((Number(garage.accessPoints[0].dropPoint.y) || 0) - (Number(garage.accessPoints[0].spawn.y) || 0)) > 0.5
    )
  );

  const [parkMode, setParkMode] = useState(hasSeparateDrop ? 'separate' : 'same');

  const [formData, setFormData] = useState({
    name: garage?.name || '',
    label: garage?.label || '',
    type: garage?.type || 'public',
    vehicleType: garage?.vehicleType || 'car',
    groups: garage?.groups ? (typeof garage.groups === 'string' ? garage.groups : Object.keys(garage.groups).join(', ')) : '',
    shared: garage?.shared || false,
    distance: garage?.distance || garage?.accessPoints?.[0]?.useRadius || 3.5,
    interaction: garage?.accessPoints?.[0]?.coords || null,
    spawn: garage?.accessPoints?.[0]?.spawn || null,
    dropPoint: garage?.accessPoints?.[0]?.dropPoint || null,
    drawMarker: garage?.drawMarker !== undefined ? garage.drawMarker : (garage?.accessPoints?.[0]?.drawMarker !== undefined ? garage.accessPoints[0].drawMarker : true),
    blipEnabled: garage?.accessPoints?.[0]?.blip !== undefined ? true : true,
    blipSprite: garage?.accessPoints?.[0]?.blip?.sprite || 357,
    blipColor: garage?.accessPoints?.[0]?.blip?.color || 3,
  });

  const [loadingCoords, setLoadingCoords] = useState(false);

  const captureCoords = async (target) => {
    setLoadingCoords(true);
    const coords = await fetchNui('getCurrentCoords', { target });
    if (coords) {
      if (target === 'single_all') {
        setFormData((prev) => ({
          ...prev,
          spawn: coords,
          interaction: coords,
          dropPoint: coords,
        }));
      } else if (target === 'spawn') {
        setFormData((prev) => ({
          ...prev,
          spawn: coords,
          interaction: coords,
        }));
      } else if (target === 'dropPoint') {
        setFormData((prev) => ({
          ...prev,
          dropPoint: coords,
        }));
      }
    }
    setLoadingCoords(false);
  };

  const handleParkModeChange = (mode) => {
    setParkMode(mode);
    if (mode === 'same') {
      setFormData((prev) => ({ ...prev, dropPoint: prev.spawn }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.label) {
      alert(t('alert_fill_id'));
      return;
    }
    if (!formData.spawn) {
      alert(t('alert_capture_coords'));
      return;
    }
    if (parkMode === 'separate' && !formData.dropPoint) {
      alert(t('alert_capture_park'));
      return;
    }

    const finalSpawn = formData.spawn;
    const finalInteraction = finalSpawn;
    const finalDropPoint = parkMode === 'separate' ? formData.dropPoint : finalSpawn;

    onSave({
      ...formData,
      distance: Number(formData.distance) || 3.5,
      interaction: finalInteraction,
      spawn: finalSpawn,
      dropPoint: finalDropPoint,
      isEdit,
    });
  };

  const formatVec = (v) => {
    if (!v) return null;
    const x = Number(v.x).toFixed(2);
    const y = Number(v.y).toFixed(2);
    const z = Number(v.z).toFixed(2);
    const w = v.w !== undefined ? ` | H: ${Number(v.w).toFixed(1)}°` : '';
    return `X: ${x}, Y: ${y}, Z: ${z}${w}`;
  };

  return (
    <div className="modal-overlay">
      <div className="form-modal-content">
        <div className="form-modal-header">
          <h3 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {isEdit ? `${t('edit_garage')}: ${formData.label}` : t('create_new_garage')}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-modal-form">
          <div className="form-modal-body">
            
            <div className="form-row">
              <div className="form-group">
                <label>{t('garage_id_label')}</label>
                <input
                  className="form-input"
                  type="text"
                  disabled={isEdit}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder={t('garage_id_placeholder')}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('display_label')}</label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder={t('display_label_placeholder')}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('garage_category')}</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="public">{t('cat_public')}</option>
                  <option value="job">{t('cat_job')}</option>
                  <option value="gang">{t('cat_gang')}</option>
                  <option value="depot">{t('cat_depot')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('vehicle_type')}</label>
                <select
                  className="form-select"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                >
                  <option value="car">{t('veh_car')}</option>
                  <option value="air">{t('veh_air')}</option>
                  <option value="sea">{t('veh_sea')}</option>
                  <option value="all">{t('veh_all')}</option>
                </select>
              </div>
            </div>

            {(formData.type === 'job' || formData.type === 'gang') && (
              <div className="form-row">
                <div className="form-group">
                  <label>
                    {formData.type === 'gang' ? t('gang_name_label') : t('job_name_label')}
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    value={formData.groups}
                    onChange={(e) => setFormData({ ...formData, groups: e.target.value })}
                    placeholder={formData.type === 'gang' ? t('gang_placeholder') : t('job_placeholder')}
                  />
                </div>
                <div className="form-group" style={{ justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 18 }}>
                    <input
                      type="checkbox"
                      checked={formData.shared}
                      onChange={(e) => setFormData({ ...formData, shared: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: '#ffffff' }}
                    />
                    <span style={{ fontSize: 13, color: '#e4e4e7' }}>{t('shared_fleet')}</span>
                  </label>
                </div>
              </div>
            )}

            <div className="coords-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Crosshair size={16} color="#ffffff" />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{t('gps_waypoints')}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 12px', background: '#0e1118', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t('waypoint_mode')}
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      padding: '9px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: parkMode === 'same' ? '#ffffff' : '#141720',
                      color: parkMode === 'same' ? '#000000' : '#a1a1aa',
                      border: parkMode === 'same' ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    onClick={() => handleParkModeChange('same')}
                  >
                    <Layers size={14} /> {t('mode_single')}
                  </button>

                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      padding: '9px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: parkMode === 'separate' ? '#ffffff' : '#141720',
                      color: parkMode === 'separate' ? '#000000' : '#a1a1aa',
                      border: parkMode === 'separate' ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    onClick={() => handleParkModeChange('separate')}
                  >
                    <Crosshair size={14} /> {t('mode_separate')}
                  </button>
                </div>
              </div>

              {parkMode === 'same' ? (
                <div className="coords-item">
                  <div className="coords-info">
                    <span>{t('pt_garage_combined')}</span>
                    <span className="coords-val">
                      {formatVec(formData.spawn) || t('not_set')}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="capture-btn"
                    disabled={loadingCoords}
                    onClick={() => captureCoords('single_all')}
                  >
                    <MapPin size={14} /> {t('btn_capture_garage')}
                  </button>
                </div>
              ) : (
                
                <>
                  <div className="coords-item">
                    <div className="coords-info">
                      <span>{t('pt_spawn')}</span>
                      <span className="coords-val">
                        {formatVec(formData.spawn) || t('not_set')}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="capture-btn"
                      disabled={loadingCoords}
                      onClick={() => captureCoords('spawn')}
                    >
                      <Navigation size={14} /> {t('btn_capture_spawn')}
                    </button>
                  </div>

                  <div className="coords-item">
                    <div className="coords-info">
                      <span>{t('pt_park')}</span>
                      <span className="coords-val">
                        {formatVec(formData.dropPoint) || t('not_set')}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="capture-btn"
                      disabled={loadingCoords}
                      onClick={() => captureCoords('dropPoint')}
                    >
                      <Car size={14} /> {t('btn_capture_park')}
                    </button>
                  </div>
                </>
              )}

              <div className="coords-item" style={{ alignItems: 'center' }}>
                <div className="coords-info">
                  <span>{t('distance_label')}</span>
                  <span className="coords-val" style={{ color: '#71717a' }}>
                    {t('distance_desc')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    step="0.5"
                    min="1.0"
                    max="20.0"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: parseFloat(e.target.value) || 3.5 })}
                    style={{
                      width: 75,
                      textAlign: 'center',
                      padding: '7px 8px',
                      background: '#141720',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      color: '#ffffff',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 600 }}>{t('meters')}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.drawMarker}
                    onChange={(e) => setFormData({ ...formData, drawMarker: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: '#ffffff' }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>
                    {t('ground_markers')}
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.blipEnabled}
                    onChange={(e) => setFormData({ ...formData, blipEnabled: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: '#ffffff' }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>
                    {t('map_blip')}
                  </span>
                </label>
              </div>

              {formData.blipEnabled && (
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('blip_sprite')}</label>
                    <input
                      className="form-input"
                      type="number"
                      value={formData.blipSprite}
                      onChange={(e) => setFormData({ ...formData, blipSprite: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('blip_color')}</label>
                    <input
                      className="form-input"
                      type="number"
                      value={formData.blipColor}
                      onChange={(e) => setFormData({ ...formData, blipColor: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-modal-footer">
            <button type="button" className="secondary-btn" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="primary-btn">
              <Save size={16} strokeWidth={2.5} /> {isEdit ? t('save_changes') : t('create_garage')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
