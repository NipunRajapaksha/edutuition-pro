import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import Badge from '../../components/Badge';
import {
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Download
} from 'lucide-react';

const StudentClassesScreen = () => {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [student, setStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentProfileId = user?.studentProfileId || user?.studentProfile?._id;

  useEffect(() => {
    const fetchClasses = async () => {
      if (!studentProfileId) return;
      try {
        setLoading(true);
        const [stuRes, clsRes, matRes] = await Promise.all([
          api.getStudentById(studentProfileId),
          api.getClasses(),
          api.getMaterials()
        ]);

        if (stuRes.data.success) setStudent(stuRes.data.data);
        if (clsRes.data.success) {
          const enrolled = stuRes.data.data?.enrolledClasses || [];
          setClasses(clsRes.data.data.filter(c => enrolled.includes(c._id || c.id)));
        }
        if (matRes.data.success) setMaterials(matRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [studentProfileId]);

  if (loading) {
    return <div style={{ padding: '30px', textAlign: 'center', color: colors.textMuted }}>{t('loading')}</div>;
  }

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>
          {t('navMyClasses')}
        </h2>
        <div style={{ fontSize: '12px', color: colors.textMuted }}>
          Your enrolled tuition sessions & course notes
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {classes.map(cls => {
          const classMaterials = materials.filter(m => m.classId === (cls._id || cls.id));

          return (
            <div
              key={cls._id || cls.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: '18px',
                padding: '18px',
                border: `1px solid ${colors.border}`,
                boxShadow: colors.cardShadow
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text }}>
                    {cls.name}
                  </h3>
                  <div style={{ fontSize: '12px', color: colors.primaryLight, fontWeight: '600', marginTop: '2px' }}>
                    {cls.subject} • {cls.grade}
                  </div>
                </div>
                <Badge variant="present">Enrolled</Badge>
              </div>

              {/* Timing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '10px 0', fontSize: '12px', color: colors.textMuted }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} /> <strong>{cls.dayOfWeek}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {cls.startTime} - {cls.endTime}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} /> {cls.location}
                </div>
                <div>Teacher: <strong>{cls.teacherName}</strong></div>
              </div>

              {/* Class materials section */}
              {classMaterials.length > 0 && (
                <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '10px', marginTop: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '6px' }}>
                    COURSE STUDY MATERIALS ({classMaterials.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {classMaterials.map(m => (
                      <div
                        key={m._id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          backgroundColor: colors.surfaceSubtle,
                          fontSize: '11px'
                        }}
                      >
                        <span style={{ fontWeight: '600', color: colors.text }}>{m.title}</span>
                        <a
                          href={m.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: colors.primaryLight, display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none', fontWeight: '700' }}
                        >
                          <Download size={11} /> Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentClassesScreen;
