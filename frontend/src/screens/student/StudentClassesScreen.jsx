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

  const studentProfileId = user?.studentProfileId || user?.studentProfile?._id || user?.studentProfile?.id || user?._id || user?.id;

  useEffect(() => {
    let isMounted = true;
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const [stuRes, clsRes, matRes] = await Promise.all([
          api.getStudentById(studentProfileId),
          api.getClasses(),
          api.getMaterials()
        ]);

        if (isMounted) {
          if (stuRes?.data?.success && stuRes.data.data) {
            setStudent(stuRes.data.data);
          }
          if (clsRes?.data?.success && Array.isArray(clsRes.data.data)) {
            const allClasses = clsRes.data.data;
            const enrolled = stuRes?.data?.data?.enrolledClasses || user?.studentProfile?.enrolledClasses || [];
            let myClasses = allClasses.filter(c => enrolled.includes(c._id || c.id));
            if (myClasses.length === 0 && allClasses.length > 0) {
              const studentGrade = stuRes?.data?.data?.grade || user?.studentProfile?.grade || user?.grade;
              const gradeClasses = studentGrade ? allClasses.filter(c => c.grade === studentGrade) : [];
              myClasses = gradeClasses.length > 0 ? gradeClasses : allClasses;
            }
            setClasses(myClasses);
          }
          if (matRes?.data?.success && Array.isArray(matRes.data.data)) {
            setMaterials(matRes.data.data);
          }
        }
      } catch (err) {
        console.error('Error fetching student classes:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchClasses();
    return () => { isMounted = false; };
  }, [studentProfileId]);

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: colors.textMuted }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: colors.text }}>Loading Classes...</div>
        <div style={{ fontSize: '12px', marginTop: '6px' }}>Fetching your course sessions and timetable</div>
      </div>
    );
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

      {classes.length === 0 ? (
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: '18px',
            padding: '30px 20px',
            textAlign: 'center',
            border: `1px solid ${colors.border}`,
            boxShadow: colors.cardShadow
          }}
        >
          <BookOpen size={36} color={colors.primaryLight} style={{ margin: '0 auto 10px auto', opacity: 0.8 }} />
          <div style={{ fontSize: '15px', fontWeight: '700', color: colors.text }}>No Classes Scheduled Yet</div>
          <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '6px', maxWidth: '320px', margin: '6px auto 0 auto' }}>
            When your teacher creates or schedules tuition classes for your grade, they will appear right here with class dates, times, and study notes.
          </div>
        </div>
      ) : (
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
                    <MapPin size={13} /> {cls.location || 'Hall 1'}
                  </div>
                  <div>Teacher: <strong>{cls.teacherName || 'NAR Teacher'}</strong></div>
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
      )}
    </div>
  );
};

export default StudentClassesScreen;
