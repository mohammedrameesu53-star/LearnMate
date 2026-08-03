import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import {
    AlertCircle, Search, Eye, Ban, CheckCircle2, Trash2, X,
    ShieldCheck, ShieldOff, Mail, Calendar, GraduationCap
} from "lucide-react";

export default function AdminStudents() {
    const { user } = useAuth();

    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Detail modal
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [studentDetail, setStudentDetail] = useState(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // Action state
    const [actionError, setActionError] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [deletingStudent, setDeletingStudent] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchStudents = async (search = "") => {
        setIsLoading(true);
        setError("");
        try {
            const response = await api.get("/api/adminpanel/students/", {
                params: search ? { search } : {},
            });
            setStudents(response.data || []);
        } catch (err) {
            console.error("Error fetching students:", err);
            setError("Failed to load students from backend API.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents(searchTerm);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const openStudentDetail = async (studentId) => {
        setSelectedStudentId(studentId);
        setIsDetailLoading(true);
        setStudentDetail(null);
        try {
            const response = await api.get(`/api/adminpanel/students/${studentId}/`);
            setStudentDetail(response.data);
        } catch (err) {
            console.error("Error fetching student detail:", err);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const closeStudentDetail = () => {
        setSelectedStudentId(null);
        setStudentDetail(null);
    };

    const handleToggleStatus = async (studentId) => {
        setActionLoadingId(studentId);
        setActionError("");
        try {
            const response = await api.patch(`/api/adminpanel/students/${studentId}/status/`);
            const newActiveState = response.data?.is_active;

            setStudents((prev) =>
                prev.map((s) => (s.id === studentId ? { ...s, is_active: newActiveState } : s))
            );

            if (studentDetail?.id === studentId) {
                setStudentDetail((prev) => ({ ...prev, is_active: newActiveState }));
            }
        } catch (err) {
            console.error("Error toggling student status:", err);
            setActionError("Failed to update student status.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDeleteStudent = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/api/adminpanel/students/${deletingStudent.id}/delete/`);
            setStudents((prev) => prev.filter((s) => s.id !== deletingStudent.id));
            if (selectedStudentId === deletingStudent.id) closeStudentDetail();
            setDeletingStudent(null);
        } catch (err) {
            console.error("Error deleting student:", err);
            setError("Failed to delete student.");
            setDeletingStudent(null);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading && students.length === 0) {
        return (
            <DashboardLayout role="admin" user={user}>
                <div className="flex items-center justify-center p-12 min-h-[300px]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-semibold text-slate-500">Loading student directory...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin" user={user}>
            <div className="space-y-6 animate-fade-in">
                {error && (
                    <div className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-3 rounded-xl text-xs font-semibold flex justify-between items-center">
                        <span className="flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </span>
                        <button onClick={() => fetchStudents(searchTerm)} className="underline uppercase tracking-wider text-[10px] font-bold">Retry</button>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800">Student Management</h2>
                        <p className="text-sm text-slate-500 font-medium">Review, activate/suspend, or remove student accounts</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-72 px-3.5 py-2.5 bg-white border border-slate-200/60 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition">
                        <Search size={15} className="text-slate-400 shrink-0" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by username or email..."
                            className="bg-transparent outline-none text-xs w-full text-slate-800 placeholder-slate-400"
                        />
                    </div>
                </div>

                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="pb-3">Username</th>
                                    <th className="pb-3">Email</th>
                                    <th className="pb-3">Verified</th>
                                    <th className="pb-3">MFA</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Joined</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center">
                                            <div className="h-6 w-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-6 text-center text-slate-400 font-medium">No students found.</td>
                                    </tr>
                                ) : (
                                    students.map((s) => (
                                        <tr key={s.id}>
                                            <td className="py-4">{s.username}</td>
                                            <td className="py-4 text-xs font-medium text-slate-500">{s.email}</td>
                                            <td className="py-4">
                                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase
                          ${s.is_verified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                                    {s.is_verified ? "Yes" : "No"}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase
                          ${s.mfa_enabled ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400"}`}>
                                                    {s.mfa_enabled ? "On" : "Off"}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border
                          ${s.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-500 border-rose-100"}`}>
                                                    {s.is_active ? "Active" : "Suspended"}
                                                </span>
                                            </td>
                                            <td className="py-4 text-xs font-medium text-slate-400">
                                                {new Date(s.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 text-right space-x-2 whitespace-nowrap">
                                                <button
                                                    onClick={() => openStudentDetail(s.id)}
                                                    className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold"
                                                    title="View Student"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(s.id)}
                                                    disabled={actionLoadingId === s.id}
                                                    className={`p-1.5 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold disabled:opacity-50
                            ${s.is_active ? "hover:bg-amber-50 text-amber-600" : "hover:bg-emerald-50 text-emerald-600"}`}
                                                    title={s.is_active ? "Suspend Student" : "Activate Student"}
                                                >
                                                    {s.is_active ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                                                </button>
                                                <button
                                                    onClick={() => setDeletingStudent(s)}
                                                    className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold"
                                                    title="Delete Student"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Student Detail Modal */}
            {selectedStudentId && (
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-xl">
                        <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Student Detail</h3>
                            <button onClick={closeStudentDetail} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {actionError && (
                                <div className="bg-rose-50 text-rose-600 border border-rose-100 px-3 py-2 rounded-xl text-xs font-semibold">
                                    {actionError}
                                </div>
                            )}

                            {isDetailLoading ? (
                                <div className="flex items-center justify-center p-10">
                                    <div className="h-6 w-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : studentDetail ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                <GraduationCap size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-800">{studentDetail.username}</h4>
                                                <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                                    <Mail size={12} /> {studentDetail.email}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border
                      ${studentDetail.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-500 border-rose-100"}`}>
                                            {studentDetail.is_active ? "Active" : "Suspended"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50 rounded-xl p-3">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Verified</span>
                                            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mt-1">
                                                {studentDetail.is_verified ? <ShieldCheck size={14} className="text-emerald-500" /> : <ShieldOff size={14} className="text-amber-500" />}
                                                {studentDetail.is_verified ? "Yes" : "No"}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-3">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">MFA Enabled</span>
                                            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mt-1">
                                                {studentDetail.mfa_enabled ? <ShieldCheck size={14} className="text-indigo-500" /> : <ShieldOff size={14} className="text-slate-400" />}
                                                {studentDetail.mfa_enabled ? "On" : "Off"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 text-xs text-slate-500 font-medium border-t border-slate-50 pt-4">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={13} /> Joined {new Date(studentDetail.created_at).toLocaleDateString()}
                                        </span>
                                        {studentDetail.updated_at && (
                                            <span className="flex items-center gap-1.5">
                                                Updated {new Date(studentDetail.updated_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => handleToggleStatus(studentDetail.id)}
                                            disabled={actionLoadingId === studentDetail.id}
                                            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50
                        ${studentDetail.is_active
                                                    ? "bg-amber-50 hover:bg-amber-100 text-amber-600"
                                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"}`}
                                        >
                                            {studentDetail.is_active ? (<><Ban size={14} /> Suspend</>) : (<><CheckCircle2 size={14} /> Activate</>)}
                                        </button>
                                        <button
                                            onClick={() => setDeletingStudent(studentDetail)}
                                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 text-xs font-bold cursor-pointer"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-8">Failed to load student details.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingStudent && (
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl space-y-4">
                        <h3 className="text-base font-bold text-slate-800">Delete Student?</h3>
                        <p className="text-xs text-slate-500">
                            This will permanently remove <span className="font-bold text-slate-700">{deletingStudent.email}</span> along with their enrollments and progress records. This action cannot be undone.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setDeletingStudent(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteStudent}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:bg-rose-400"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

// dashboard/admin/AdminStudents.jsx