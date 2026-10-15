import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Search, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import { TopBar } from '../components/TopBar';

/* ───────── colour helpers ───────── */
const CATEGORY_COLORS = {
  'AI & Technology': { bg: '#EDE9FE', text: '#5B21B6' },
  'Data & AI': { bg: '#FEF3C7', text: '#92400E' },
  'Engineering & Web': { bg: '#DBEAFE', text: '#334155' },
  'Data & Analytics': { bg: '#E0E7FF', text: '#3730A3' },
  'Business & Management': { bg: '#FCE7F3', text: '#9D174D' },
  'Sales & Business': { bg: '#FFEDD5', text: '#9A3412' },
  'Healthcare & Coding': { bg: '#D1FAE5', text: '#065F46' },
};
const catColor = (cat) => CATEGORY_COLORS[cat] || { bg: '#E0EAFC', text: '#334155' };

/* ───────── fonts ───────── */
const heading = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const body = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export const CourseCatalogPage = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseList, myEnrollments] = await Promise.all([
          api.get('/courses'),
          api.get('/courses/my-enrollments'),
        ]);
        setCourses(courseList || []);
        setEnrollments(myEnrollments || []);
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  /* Build categories from actual course data */
  const categories = [
    'All',
    ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean))),
  ];

  const filteredCourses = courses.filter((c) => {
    const matchesCat =
      selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      <TopBar
        title="Courses"
        subtitle="Browse all available courses and start learning"
      />

      {/* ───── Filter Bar ───── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          marginBottom: 28,
        }}
      >
        {/* Category pills */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
          }}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...body,
                  padding: '7px 16px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? '#586B84' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#334155',
                  border: '1px solid',
                  borderColor: isActive ? '#586B84' : '#CFDEF3',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: 999,
            border: '1px solid #CFDEF3',
            boxShadow: '0 2px 8px rgba(207, 222, 243, 0.25)',
            width: 240,
            flexShrink: 0,
          }}
        >
          <Search size={15} color="#9CA3AF" />
          <input
            type="text"
            placeholder="Search courses…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              ...body,
              border: 'none',
              background: 'transparent',
              fontSize: 13,
              width: '100%',
              color: '#0F172A',
            }}
          />
        </div>
      </div>

      {/* ───── Course Grid ───── */}
      {filteredCourses.length === 0 ? (
        <div
          className="skill-card"
          style={{ padding: '60px 32px', textAlign: 'center' }}
        >
          <BookOpen
            size={36}
            color="#9CA3AF"
            style={{ marginBottom: 12 }}
          />
          <h3
            style={{
              ...heading,
              fontSize: 17,
              fontWeight: 700,
              color: '#0F172A',
              marginBottom: 6,
            }}
          >
            No courses found
          </h3>
          <p style={{ ...body, fontSize: 13, color: '#64748B' }}>
            Try adjusting your search or category filter.
          </p>
        </div>
      ) : (
        <div
          className="course-catalog-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: 22,
          }}
        >
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            const enrollment = enrollments.find(
              (e) => e.courseId === course.id
            );
            const c = catColor(course.category);

            return (
              <div
                key={course.id}
                className="skill-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 24,
                }}
              >
                {/* Top */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        ...body,
                        backgroundColor: c.bg,
                        color: c.text,
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {course.category}
                    </span>
                  </div>

                  <h3
                    style={{
                      ...heading,
                      fontSize: 17,
                      fontWeight: 600,
                      color: '#0F172A',
                      marginBottom: 8,
                      lineHeight: 1.35,
                    }}
                  >
                    {course.title}
                  </h3>

                  <p
                    style={{
                      ...body,
                      fontSize: 13,
                      color: '#64748B',
                      lineHeight: 1.55,
                      marginBottom: 16,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {course.description}
                  </p>
                </div>

                {/* Bottom */}
                <div>
                  {/* Divider + price */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: 14,
                      borderTop: '1px solid #CFDEF3',
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          ...body,
                          fontSize: 11,
                          color: '#9CA3AF',
                        }}
                      >
                        Certificate Fee
                      </span>
                      <div
                        style={{
                          ...heading,
                          fontSize: 18,
                          fontWeight: 600,
                          color: '#0F172A',
                        }}
                      >
                        ₹{course.price ? Math.round(course.price) : 99}
                      </div>
                    </div>

                    {isEnrolled && (
                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            ...body,
                            fontSize: 11,
                            color: '#9CA3AF',
                          }}
                        >
                          Progress
                        </span>
                        <div
                          style={{
                            ...heading,
                            fontSize: 15,
                            fontWeight: 700,
                            color:
                              enrollment?.progressPercent === 100
                                ? '#059669'
                                : '#64748B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 4,
                          }}
                        >
                          {enrollment?.progressPercent === 100 && (
                            <CheckCircle2 size={14} />
                          )}
                          {enrollment?.progressPercent || 0}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  {isEnrolled ? (
                    <button
                      onClick={() => navigate(`/assessments/${course.id}`)}
                      className="btn-primary"
                      style={{ width: '100%', padding: '10px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <span>Start Assessment</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="btn-primary"
                      style={{ width: '100%', padding: '10px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <span>View Details & Start</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
