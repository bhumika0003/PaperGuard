import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SecureViewerModal } from '../../components/ui/SecureViewerModal';
import { HashIntegrityModal } from '../../components/ui/HashIntegrityModal';
import { StatCard } from '../../components/ui/StatCard';
import { Upload, FileText, Hash, ShieldCheck, Eye, Lock, Clock, CheckCircle, Paperclip, Edit, AlertTriangle, X } from 'lucide-react';
import api from '../../services/api';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [examName, setExamName] = useState('Spring 2026 End-Sem Examination');
  const [subject, setSubject] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [examDate, setExamDate] = useState('');
  const [semester, setSemester] = useState('Semester VI');
  const [department, setDepartment] = useState(user?.department || 'Computer Science');
  const [paperType, setPaperType] = useState('End-Sem Examination');
  const [description, setDescription] = useState('');
  const [textContent, setTextContent] = useState('');
  const [paperFile, setPaperFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');

  // Modals
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [hashPaper, setHashPaper] = useState(null);

  // Edit Paper State
  const [editingPaper, setEditingPaper] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [editSubjectCode, setEditSubjectCode] = useState('');
  const [editExamDate, setEditExamDate] = useState('');
  const [editSemester, setEditSemester] = useState('Semester VI');
  const [editDepartment, setEditDepartment] = useState('Computer Science');
  const [editTextContent, setEditTextContent] = useState('');
  const [editPaperFile, setEditPaperFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchTeacherPapers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/papers');
      setPapers(res.data.papers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherPapers();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setAttachmentError('');
    setUploadSuccess(null);

    // Mandatory Document / Text Attachment Check
    if (!paperFile && (!textContent || !textContent.trim())) {
      setAttachmentError('Attachment Required: You must select a paper file (.pdf, .docx, .txt) or enter text content before a SHA-256 fingerprint hash can be generated.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('examName', examName);
      formData.append('subject', subject);
      formData.append('subjectCode', subjectCode);
      formData.append('examDate', examDate);
      formData.append('semester', semester);
      formData.append('department', department);
      formData.append('paperType', paperType);
      formData.append('description', description);
      formData.append('textContent', textContent);

      if (paperFile) {
        formData.append('paperFile', paperFile);
      }

      const res = await api.post('/papers/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadSuccess(res.data.paper);
      setSubject('');
      setSubjectCode('');
      setExamDate('');
      setTextContent('');
      setPaperFile(null);
      fetchTeacherPapers();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (paper) => {
    setEditingPaper(paper);
    setEditSubject(paper.subject || '');
    setEditSubjectCode(paper.subjectCode || '');
    setEditExamDate(paper.examDate || '');
    setEditSemester(paper.semester || 'Semester VI');
    setEditDepartment(paper.department || 'Computer Science');
    setEditTextContent('');
    setEditPaperFile(null);
  };

  const handleUpdatePaper = async (e) => {
    e.preventDefault();
    if (!editingPaper) return;
    setUpdating(true);

    try {
      const formData = new FormData();
      formData.append('subject', editSubject);
      formData.append('subjectCode', editSubjectCode);
      formData.append('examDate', editExamDate);
      formData.append('semester', editSemester);
      formData.append('department', editDepartment);
      if (editTextContent) formData.append('textContent', editTextContent);
      if (editPaperFile) formData.append('paperFile', editPaperFile);

      const res = await api.put(`/papers/${editingPaper.paperId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert(`Paper updated successfully! New SHA-256 fingerprint: ${res.data.paper.hash}\n\nNotice: Principal and Exam Controller have been alerted of this paper revision.`);
      setEditingPaper(null);
      fetchTeacherPapers();
    } catch (err) {
      alert(err.response?.data?.message || 'Paper update failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-8 overflow-y-auto">
          
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Teacher Module</span>
              <h1 className="text-2xl font-extrabold text-white mt-1">Question Paper Creation & Fingerprinting</h1>
              <p className="text-xs text-slate-400 mt-1">Upload examination papers, generate SHA-256 digital fingerprints, and track review status.</p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>Download & Print Access: RESTRICTED</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Uploaded Papers" value={papers.length} icon={FileText} color="cyan" />
            <StatCard title="Fingerprints Generated" value={papers.length} icon={Hash} color="emerald" />
            <StatCard title="Security Policy" value="Restricted" icon={Lock} trend="No Download Allowed" color="rose" />
          </div>

          {/* Upload Form Section */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800 space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Upload & Digitally Stamp Question Paper</h3>
                <p className="text-xs text-slate-400">SHA-256 fingerprint will be generated automatically upon submission.</p>
              </div>
            </div>

            {attachmentError && (
              <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-2.5 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span className="font-semibold">{attachmentError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Question Paper Uploaded & SHA-256 Hash Generated Successfully!</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-mono pt-2 border-t border-emerald-900">
                  <div><span className="text-slate-400">Paper ID:</span> <strong className="text-cyan-400">{uploadSuccess.paperId}</strong></div>
                  <div className="truncate"><span className="text-slate-400">SHA-256 Hash:</span> <strong className="text-cyan-300">{uploadSuccess.hash}</strong></div>
                </div>
              </div>
            )}

            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Exam Name</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subject Name</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Distributed Systems & Cloud Security"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subject Code</label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="e.g. CS601"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Semester I">Semester I</option>
                  <option value="Semester II">Semester II</option>
                  <option value="Semester III">Semester III</option>
                  <option value="Semester IV">Semester IV</option>
                  <option value="Semester V">Semester V</option>
                  <option value="Semester VI">Semester VI</option>
                  <option value="Semester VII">Semester VII</option>
                  <option value="Semester VIII">Semester VIII</option>
                </select>
              </div>

              {/* File Attachment Input Option */}
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-cyan-400" />
                  Attach Question Paper File (.pdf, .docx, .txt) <span className="text-rose-400">* Required (or type text)</span>
                </label>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <input
                    type="file"
                    onChange={(e) => { setPaperFile(e.target.files[0]); setAttachmentError(''); }}
                    accept=".pdf,.doc,.docx,.txt"
                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-pointer"
                  />
                  {paperFile && (
                    <p className="text-[11px] text-emerald-400 font-mono mt-2">
                      Selected File: {paperFile.name} ({(paperFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Or Type Question Paper Content / Draft Text
                </label>
                <textarea
                  rows="4"
                  value={textContent}
                  onChange={(e) => { setTextContent(e.target.value); setAttachmentError(''); }}
                  placeholder="Enter examination question paper text content here..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{uploading ? 'Uploading & Hashing...' : 'Upload & Generate SHA-256 Hash'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Submitted Papers Table */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Uploaded Question Papers & Fingerprints</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Paper ID</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">SHA-256 Hash ID</th>
                    <th className="py-3 px-4">Exam Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {papers.map((p) => (
                    <tr key={p.paperId} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{p.paperId}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">{p.subject} ({p.subjectCode})</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-300 max-w-[180px] truncate">
                        {p.hash}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{p.examDate}</td>
                      <td className="py-3.5 px-4"><StatusBadge status={p.status} /></td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => { setSelectedPaperId(p.paperId); setIsViewerOpen(true); }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" /> View
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium transition inline-flex items-center gap-1 cursor-pointer"
                          title="Edit Question Paper & Recalculate Hash"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-400" /> Edit
                        </button>
                        <button
                          onClick={() => setHashPaper(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 font-mono text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Hash className="w-3.5 h-3.5" /> Verify Hash
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      {/* Edit Question Paper Modal */}
      {editingPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-cyber-card border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold">
                <Edit className="w-5 h-5" />
                <span>Edit Question Paper ({editingPaper.paperId})</span>
              </div>
              <button onClick={() => setEditingPaper(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-amber-300/90 bg-amber-950/60 p-3 rounded-xl border border-amber-500/30">
              Notice: Editing this paper will recalculate its SHA-256 fingerprint hash and generate a security alert to the Principal and Exam Controller.
            </p>

            <form onSubmit={handleUpdatePaper} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                  <input type="text" value={editSubject} onChange={(e) => setEditSubject(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject Code</label>
                  <input type="text" value={editSubjectCode} onChange={(e) => setEditSubjectCode(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Exam Date</label>
                  <input type="date" value={editExamDate} onChange={(e) => setEditExamDate(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Semester</label>
                  <select value={editSemester} onChange={(e) => setEditSemester(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none">
                    <option value="Semester I">Semester I</option>
                    <option value="Semester II">Semester II</option>
                    <option value="Semester III">Semester III</option>
                    <option value="Semester IV">Semester IV</option>
                    <option value="Semester V">Semester V</option>
                    <option value="Semester VI">Semester VI</option>
                    <option value="Semester VII">Semester VII</option>
                    <option value="Semester VIII">Semester VIII</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Replace Document File (.pdf, .docx, .txt)</label>
                <input type="file" onChange={(e) => setEditPaperFile(e.target.files[0])} accept=".pdf,.doc,.docx,.txt" className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-500/10 file:text-cyan-400 cursor-pointer" />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Or Update Paper Text Content</label>
                <textarea rows="3" value={editTextContent} onChange={(e) => setEditTextContent(e.target.value)} placeholder="Type updated question paper text content..." className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs outline-none" />
              </div>

              <div className="flex space-x-2 pt-2">
                <button type="submit" disabled={updating} className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition disabled:opacity-50">
                  {updating ? 'Updating & Notifying...' : 'Save & Alert Principal'}
                </button>
                <button type="button" onClick={() => setEditingPaper(null)} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SecureViewerModal paperId={selectedPaperId} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} role="Teacher" />
      <HashIntegrityModal paper={hashPaper} isOpen={!!hashPaper} onClose={() => setHashPaper(null)} />
    </div>
  );
};
