"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, UserPlus, Lock, Mail, User, School, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await register({
      username,
      email,
      name,
      school,
      password,
    });
    setIsLoading(false);

    if (result.success) {
      router.push("/profile");
    } else {
      setError(result.error || "Đăng ký thất bại.");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col text-foreground">
        <Navbar />

        <main className="flex-1 flex items-center justify-center p-4 py-8">
          <div className="w-full max-w-md bg-card border border-sky-500/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 mb-1">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black">Tạo Tài Khoản Học Sinh</h1>
              <p className="text-xs text-muted-foreground">
                Rèn luyện tư duy thuật toán cùng hàng ngàn học sinh khác!
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2.5 mb-5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="hocsinh123"
                    className="w-full px-3 py-2.5 theme-input text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Họ và Tên</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2.5 theme-input text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hocsinh@gmail.com"
                    className="w-full pl-10 pr-4 theme-input"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">Trường / Lớp học</label>
                <div className="relative">
                  <School className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="THPT Chuyên Hà Nội"
                    className="w-full pl-10 pr-4 theme-input"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)..."
                    className="w-full pl-10 pr-4 theme-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-extrabold text-sm hover:opacity-95 shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
              >
                {isLoading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-sky-500 font-bold hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
