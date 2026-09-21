import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import {
  FolderOpen,
  FileText,
  Video,
  Download,
  Plus,
  ExternalLink,
  Trash2,
  X,
  FileSpreadsheet
} from 'lucide-react';

const StudyMaterialsScreen = ({ onOpenAddMaterial }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [materials, setMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedClassId !== 'All') params.classId = selectedClassId;

      const [matRes, clsRes] = await Promise.all([
        api.getMaterials(params),
        api.getClasses()
      ]);

      if (matRes.data.success) setMaterials(matRes.data.data);
      if (clsRes.data.success) setClasses(clsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [selectedClassId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await api.deleteMaterial(id);
      fetchMaterials();
    } catch (err) {
      alert('Failed to delete material');
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
            {t('navMaterials')}
          </h2>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            PDF notes, model papers, past papers & revision video links
          </div>
        </div>

        {onOpenAddMaterial && (
          <button
            onClick={onOpenAddMaterial}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor: colors.primary,
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}
          >
            <Plus size={16} /> Upload Notes
          </button>
        )}
      </div>

      {/* Class Filter */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          onClick={() => setSelectedClassId('All')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            backgroundColor: selectedClassId === 'All' ? colors.primary : colors.surface,
            color: selectedClassId === 'All' ? '#FFFFFF' : colors.textMuted,
            border: `1px solid ${selectedClassId === 'All' ? colors.primary : colors.border}`,
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          All Classes
        </button>
        {classes.map(c => (
          <button
            key={c._id || c.id}
            onClick={() => setSelectedClassId(c._id || c.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              backgroundColor: selectedClassId === (c._id || c.id) ? colors.primary : colors.surface,
              color: selectedClassId === (c._id || c.id) ? '#FFFFFF' : colors.textMuted,
              border: `1px solid ${selectedClassId === (c._id || c.id) ? colors.primary : colors.border}`,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Materials List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted }}>{t('loading')}</div>
      ) : materials.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}`, color: colors.textMuted }}>
          No study materials uploaded for this class yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {materials.map(mat => (
            <div
              key={mat._id || mat.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: '16px',
                padding: '16px',
                border: `1px solid ${colors.border}`,
                boxShadow: colors.cardShadow,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: mat.fileType === 'video' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(79, 70, 229, 0.15)',
                    color: mat.fileType === 'video' ? '#EF4444' : '#6366F1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {mat.fileType === 'video' ? <Video size={20} /> : <FileText size={20} />}
                </div>

                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: colors.text }}>
                    {mat.title}
                  </h4>
                  <div style={{ fontSize: '11px', color: colors.primaryLight, fontWeight: '600', marginTop: '2px' }}>
                    {mat.className} • {mat.subject} • {mat.topic}
                  </div>
                  {mat.description && (
                    <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px', lineHeight: 1.3 }}>
                      {mat.description}
                    </p>
                  )}
                  <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '6px' }}>
                    Size: {mat.fileSize || '2.0 MB'} • By {mat.uploadedBy}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <a
                  href={mat.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: colors.surfaceSubtle,
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    fontSize: '11px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none'
                  }}
                >
                  <Download size={13} color="#10B981" /> Open / Download
                </a>

                {onOpenAddMaterial && (
                  <button
                    onClick={() => handleDelete(mat._id || mat.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: colors.textMuted,
                      cursor: 'pointer',
                      fontSize: '10px',
                      textAlign: 'right'
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyMaterialsScreen;
