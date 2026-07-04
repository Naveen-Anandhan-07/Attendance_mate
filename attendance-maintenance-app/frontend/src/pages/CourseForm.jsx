import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourse, createCourse, updateCourse } from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import Loader from '../components/Loader.jsx';

const emptyForm = {
  courseName: '',
  courseCode: '',
  credits: '',
  totalHours: '',
  facultyName: '',
  semester: ''
};

export default function CourseForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getCourse(id).then((res) => {
        setForm(res.data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      credits: Number(form.credits),
      totalHours: Number(form.totalHours)
    };
    try {
      if (isEdit) {
        await updateCourse(id, payload);
        showToast('Course updated successfully');
      } else {
        await createCourse(payload);
        showToast('Course added successfully');
      }
      navigate('/courses');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save course', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading course..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Edit Course' : 'Add Course'}</h1>
          <div className="page-subtitle">Fill in the course details below</div>
        </div>
      </div>

      <div className="panel">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course Name *</label>
            <input name="courseName" value={form.courseName} onChange={handleChange} required placeholder="Database Management Systems" />
          </div>
          <div className="form-group">
            <label>Course Code *</label>
            <input name="courseCode" value={form.courseCode} onChange={handleChange} required placeholder="CS3501" />
          </div>
          <div className="form-group">
            <label>Credits *</label>
            <input type="number" min="0" step="0.5" name="credits" value={form.credits} onChange={handleChange} required placeholder="4" />
          </div>
          <div className="form-group">
            <label>Total Planned Hours *</label>
            <input type="number" min="0" name="totalHours" value={form.totalHours} onChange={handleChange} required placeholder="60" />
          </div>
          <div className="form-group">
            <label>Faculty Name (optional)</label>
            <input name="facultyName" value={form.facultyName} onChange={handleChange} placeholder="Dr. Meera Krishnan" />
          </div>
          <div className="form-group">
            <label>Semester</label>
            <input name="semester" value={form.semester} onChange={handleChange} placeholder="V" />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update Course' : 'Add Course'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/courses')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
