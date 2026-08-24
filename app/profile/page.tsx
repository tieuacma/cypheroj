"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Trophy,
  CheckCircle2,
  Code2,
  Edit3,
  School,
  Calendar,
  Sparkles,
  Award,
  Save,
  ArrowRight,
  Shield,
  UserCheck,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<"overview" | "edit">("overview");

  // Form states for profile edit
  const [name, setName] = useState(user?.name || "");
  const [school, setSchool] = useState(user?.school || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "student-1");

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-semibold">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span>Đang tải thông tin hồ sơ...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 rounded-3xl border border-sky-500/20 bg-card flex flex-col items-center gap-4 shadow-lg">
            <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500">
              <UserCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold">Yêu cầu Đăng nhập</h2>
            <p className="text-sm text-muted-foreground">
              Bạn cần đăng nhập bằng tài khoản học sinh để truy cập trang hồ sơ cá nhân.
            </p>
            <Link
              href="/"
              className="mt-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition-all"
            >
              Về trang chủ đăng nhập
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const getRankBadge = (points: number) => {
    if (points >= 1000) {
      return { title: "Radiant Master", color: "text-amber-500 bg-amber-500/10 border-amber-500/30", icon: Trophy };
    }
    if (points >= 500) {
      return { title: "Cao thủ Thuật toán", color: "text-purple-500 bg-purple-500/10 border-purple-500/30", icon: Award };
    }
    if (points >= 100) {
      return { title: "Thợ săn Code C++", color: "text-sky-500 bg-sky-500/10 border-sky-500/30", icon: Code2 };
    }
    return { title: "Tập sự Lập trình", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30", icon: GraduationCap };
  };

  const badge = getRankBadge(user.points);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const res = await updateProfile({ name, school, bio, avatar });
    setIsSaving(false);

    if (res.success) {
      setMessage({ type: "success", text: "Cập nhật thông tin hồ sơ thành công!" });
      setActiveTab("overview");
    } else {
      setMessage({ type: "error", text: res.error || "Cập nhật hồ sơ thất bại." });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col text-foreground selection:bg-sky-500/20">
        <Navbar />

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
          {/* Header Card */}
          <div className="relative rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-card dark:from-sky-500/5 dark:via-indigo-500/5 p-6 md:p-8 shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 p-1 shadow-xl shadow-sky-500/20">
                  <div className="w-full h-full bg-card rounded-[22px] flex items-center justify-center text-4xl md:text-5xl font-black text-sky-500 uppercase">
                    {user.name ? user.name.charAt(0) : user.username.charAt(0)}
                  </div>
                </div>
              </div>

              {/* Info details */}
              <div className="flex-1 flex flex-col items-center md:items-start gap-2 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className={`px-3 py-1 rounded-full border text-xs font-black flex items-center gap-1.5 ${badge.color}`}>
                    <badge.icon className="w-3.5 h-3.5" />
                    {badge.title}
                  </span>
                  <span className="px-3 py-1 rounded-full border border-border bg-card text-xs font-mono font-bold text-muted-foreground">
                    @{user.username}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-black tracking-tight">{user.name}</h1>

                <p className="text-sm text-muted-foreground max-w-xl font-medium">
                  {user.bio || "Học sinh đam mê lập trình C++ và chinh phục thuật toán."}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-muted-foreground font-semibold mt-2">
                  <span className="flex items-center gap-1.5">
                    <School className="w-4 h-4 text-sky-500" />
                    {user.school || "Trường THPT Chuyên"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-sky-500" />
                    Tham gia {new Date(user.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => {
                  setName(user.name);
                  setSchool(user.school);
                  setBio(user.bio);
                  setActiveTab(activeTab === "overview" ? "edit" : "overview");
                }}
                className="px-4 py-2.5 rounded-2xl border border-sky-500/30 bg-card hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 className="w-4 h-4" />
                {activeTab === "overview" ? "Chỉnh sửa hồ sơ" : "Xem tổng quan"}
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl border border-sky-500/15 bg-card shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-foreground font-mono">
                  {user.solved_problems?.length || 0}
                </div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Bài tập đã AC
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-amber-500/15 bg-card shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-amber-500 font-mono">{user.points}đ</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Tổng điểm Học sinh
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-indigo-500/15 bg-card shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-foreground font-mono">
                  {user.total_submissions || 0}
                </div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Lượt nộp bài
                </div>
              </div>
            </div>
          </div>

          {/* Alert Message */}
          {message && (
            <div
              className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{message.text}</span>
            </div>
          )}

          {/* Main Tab Content */}
          {activeTab === "overview" ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-lg font-extrabold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-sky-500" />
                  Danh sách Bài tập Đã hoàn thành ({user.solved_problems?.length || 0})
                </h2>

                <Link
                  href="/problems"
                  className="text-xs font-bold text-sky-500 hover:underline flex items-center gap-1"
                >
                  Luyện tập thêm bài mới <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {user.solved_problems && user.solved_problems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {user.solved_problems.map((probId) => (
                    <Link
                      key={probId}
                      href={`/problems/${probId}`}
                      className="p-4 rounded-2xl border border-sky-500/20 bg-card hover:border-sky-500 hover:shadow-md transition-all group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-sky-500">#{probId}</span>
                          <span className="text-sm font-extrabold group-hover:text-sky-500 transition-colors">
                            {probId.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-500 font-mono">+100đ</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-12 rounded-3xl border border-dashed border-border text-center flex flex-col items-center gap-3 text-muted-foreground">
                  <Code2 className="w-10 h-10 text-muted-foreground/50" />
                  <p className="text-sm font-semibold">Bạn chưa hoàn thành bài tập nào.</p>
                  <Link
                    href="/problems"
                    className="px-5 py-2.5 rounded-2xl bg-sky-500 text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-95 shadow-md shadow-sky-500/20 transition-all"
                  >
                    Bắt đầu giải bài ngay
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Profile Edit Tab */
            <div className="p-6 md:p-8 rounded-3xl border border-sky-500/20 bg-card shadow-lg flex flex-col gap-6">
              <h2 className="text-lg font-extrabold border-b border-border pb-3 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-sky-500" /> Chỉnh sửa Hồ sơ Học sinh
              </h2>

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-muted-foreground">Họ và Tên Học sinh</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="theme-input"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-muted-foreground">Trường / Lớp học</label>
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="Ví dụ: THPT Chuyên Hà Nội - Lớp 11A1"
                      className="theme-input"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted-foreground">Giới thiệu bản thân (Bio)</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Viết một chút về mục tiêu học tập hoặc ngôn ngữ yêu thích..."
                    className="theme-input resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-5 py-2.5 rounded-2xl border border-border text-foreground font-bold text-xs"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Đang lưu..." : "Lưu hồ sơ"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
}
