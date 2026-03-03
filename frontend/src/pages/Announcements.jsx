import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { announcementService } from '../services/announcement.service';
import { academicService } from '../services/academic.service';
import { useAuth } from '../context/AuthContext';

const Announcements = () => {
    const { user } = useAuth();

    // Data State
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    // Target State
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const res = await announcementService.getAnnouncements();
            setAnnouncements(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
        const fetchBranches = async () => {
            try {
                const res = await academicService.getAllBranches();
                setBranches(res.data);
            } catch (err) { }
        };
        fetchBranches();
    }, []);

    // Cascading Drops
    useEffect(() => {
        if (!selectedBranch) return setSemesters([]);
        academicService.getSemestersByBranch(selectedBranch)
            .then(res => setSemesters(res.data.sort((a, b) => a.number - b.number)))
            .catch(console.error);
    }, [selectedBranch]);

    useEffect(() => {
        if (!selectedSemester) return setSubjects([]);
        academicService.getSubjectsBySemester(selectedSemester)
            .then(res => setSubjects(res.data))
            .catch(console.error);
    }, [selectedSemester]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setMessage('');
        setSubmitting(true);

        // Construct target object based on what is selected (narrowest first)
        const target = {};
        if (selectedBranch) target.branch = selectedBranch;
        if (selectedSemester) target.semester = selectedSemester;
        if (selectedSubject) target.subject = selectedSubject;

        try {
            await announcementService.createAnnouncement({
                title,
                content,
                target,
                expiresAt: expiresAt || undefined
            });
            setMessage('Announcement broadcasted successfully!');

            // Reset
            setTitle('');
            setContent('');
            setSelectedBranch('');
            setSelectedSemester('');
            setSelectedSubject('');
            setExpiresAt('');

            fetchAnnouncements();
        } catch (err) {
            setMessage(err.response?.data?.error?.message || 'Failed to create announcement.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Announcement System</h1>
                <p className="text-gray-500">Broadcast messages to specific branches, semesters, or globally.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create Form */}
                {(user?.role === 'Manager' || user?.role === 'ClassTeacher') && (
                    <Card className="col-span-1 h-fit bg-blue-50 border-blue-100">
                        <h2 className="text-lg font-semibold mb-4 text-blue-900 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                            New Broadcast
                        </h2>

                        {message && (
                            <div className="p-3 mb-4 rounded text-sm bg-white border border-green-200 text-green-700 font-medium">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-4">
                            <Input label="Title" placeholder="e.g. Midterm Exam Schedule" value={title} onChange={e => setTitle(e.target.value)} required />

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">Message Content</label>
                                <textarea
                                    className="border border-gray-300 px-3 py-2 rounded-md outline-none transition-colors focus:ring-2 focus:ring-blue-200 focus:border-blue-500 min-h-[100px]"
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="p-3 bg-white rounded border border-gray-200 space-y-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Audience (Optional)</h3>
                                <p className="text-xs text-gray-400 mb-2">Leave blank for Global broadcast.</p>

                                <select className="w-full text-sm border border-gray-300 px-2 py-1.5 rounded outline-none" value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
                                    <option value="">-- Any Branch --</option>
                                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                </select>

                                <select className="w-full text-sm border border-gray-300 px-2 py-1.5 rounded outline-none disabled:bg-gray-100" value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} disabled={!selectedBranch}>
                                    <option value="">-- Any Semester --</option>
                                    {semesters.map(s => <option key={s._id} value={s._id}>Semester {s.number}</option>)}
                                </select>

                                <select className="w-full text-sm border border-gray-300 px-2 py-1.5 rounded outline-none disabled:bg-gray-100" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedSemester}>
                                    <option value="">-- Any Subject --</option>
                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>

                            <Input label="Optional Expiry Date" type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />

                            <Button type="submit" isLoading={submitting} className="w-full">Broadcast</Button>
                        </form>
                    </Card>
                )}

                {/* Feed Log */}
                <Card className={(user?.role === 'Manager' || user?.role === 'ClassTeacher') ? 'col-span-1 lg:col-span-2' : 'col-span-1 lg:col-span-3'}>
                    <h2 className="text-lg font-semibold mb-4">Broadcast History</h2>
                    {loading ? (
                        <div className="text-gray-500">Loading history...</div>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto">
                            {announcements.length === 0 ? (
                                <p className="text-gray-500 italic p-4 bg-gray-50 rounded text-center">No announcements have been made.</p>
                            ) : (
                                announcements.map(ann => (
                                    <div key={ann._id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-900">{ann.title}</h3>
                                            <span className="text-xs text-gray-400 font-mono">{new Date(ann.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{ann.content}</p>

                                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100">
                                            <span className="text-xs text-gray-500">Target:</span>
                                            {(!ann.target?.branch && !ann.target?.semester) ? (
                                                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded font-medium">Global</span>
                                            ) : (
                                                <>
                                                    {ann.target.branch && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">Branch Scoped</span>}
                                                    {ann.target.semester && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">Sem Scoped</span>}
                                                    {ann.target.subject && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">Subj Scoped</span>}
                                                </>
                                            )}
                                            <span className="ml-auto text-xs text-gray-400 italic">By: {ann.createdBy?.name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Announcements;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
