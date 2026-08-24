import { connectMongoDB } from "@/lib/mongodb";
import { IpBanModel } from "@/lib/models/ip-ban";

const ADMIN_KEY = process.env.ADMIN_KEY;

export interface IpBanResult {
  success: boolean;
  banned: boolean;
  failed_count: number;
  remainingAttempts?: number;
  remainingSeconds?: number;
  message: string;
}

export function extractClientIp(request: Request): string {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

/**
 * Checks if the given IP address is currently banned.
 */
export async function checkIpBanStatus(ip: string): Promise<{
  isBanned: boolean;
  remainingSeconds: number;
  failedCount: number;
  bannedUntil: Date | null;
}> {
  await connectMongoDB();
  const record = await IpBanModel.findOne({ ip }).lean();

  if (!record) {
    return { isBanned: false, remainingSeconds: 0, failedCount: 0, bannedUntil: null };
  }

  if (record.banned_until) {
    const now = Date.now();
    const bannedUntilMs = new Date(record.banned_until).getTime();

    if (bannedUntilMs > now) {
      const remainingSeconds = Math.ceil((bannedUntilMs - now) / 1000);
      return {
        isBanned: true,
        remainingSeconds,
        failedCount: record.failed_count,
        bannedUntil: record.banned_until,
      };
    }
  }

  return {
    isBanned: false,
    remainingSeconds: 0,
    failedCount: record.failed_count,
    bannedUntil: null,
  };
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours} giờ`);
  if (minutes > 0) parts.push(`${minutes} phút`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} giây`);
  return parts.join(" ");
}

/**
 * Verifies admin key and applies IP ban exponential backoff rules.
 * Rule:
 * - Incorrect 1..4 times: return remaining attempts (5 - count).
 * - Incorrect 5th time (k=0): ban IP for 1 hour (1 * 2^0 hours).
 * - Incorrect (5+k)-th time: ban IP for (1 * 2^k) hours continuously (2h, 4h, 8h...).
 * - Correct key: reset failed_count = 0 and banned_until = null.
 */
export async function verifyAdminKeyAndRecordAttempt(
  ip: string,
  keySubmitted: string
): Promise<IpBanResult> {
  await connectMongoDB();

  // Check if currently banned
  const banStatus = await checkIpBanStatus(ip);
  if (banStatus.isBanned) {
    const durationText = formatDuration(banStatus.remainingSeconds);
    return {
      success: false,
      banned: true,
      failed_count: banStatus.failedCount,
      remainingSeconds: banStatus.remainingSeconds,
      message: `IP thiết bị của bạn đang bị cấm do nhập sai Key Admin quá số lần quy định. Thời gian cấm còn lại: ${durationText}.`,
    };
  }

  let record = await IpBanModel.findOne({ ip });
  if (!record) {
    record = new IpBanModel({
      ip,
      failed_count: 0,
      banned_until: null,
      last_failed_at: new Date(),
    });
  }

  // Check key correctness
  if (ADMIN_KEY && keySubmitted === ADMIN_KEY) {
    // Reset counter on correct key
    record.failed_count = 0;
    record.banned_until = null;
    await record.save();

    return {
      success: true,
      banned: false,
      failed_count: 0,
      message: "Xác thực Key Admin thành công!",
    };
  }

  // Key is incorrect!
  const newFailedCount = record.failed_count + 1;
  record.failed_count = newFailedCount;
  record.last_failed_at = new Date();

  if (newFailedCount < 5) {
    const remainingAttempts = 5 - newFailedCount;
    record.banned_until = null;
    await record.save();

    return {
      success: false,
      banned: false,
      failed_count: newFailedCount,
      remainingAttempts,
      message: `Key Admin không chính xác! Bạn còn ${remainingAttempts} lần thử trước khi bị cấm IP thiết bị 1 giờ.`,
    };
  } else {
    // 5th fail or more: continuous x2^k ban hours
    const k = newFailedCount - 5; // k = 0 for 5th fail -> 1 hour. k = 1 for 6th fail -> 2 hours...
    const banHours = Math.pow(2, k); // 1 * 2^k
    const banMs = banHours * 3600 * 1000;
    const bannedUntilDate = new Date(Date.now() + banMs);

    record.banned_until = bannedUntilDate;
    await record.save();

    const remainingSeconds = Math.ceil(banMs / 1000);
    const durationText = formatDuration(remainingSeconds);

    return {
      success: false,
      banned: true,
      failed_count: newFailedCount,
      remainingSeconds,
      message: `CẢNH BÁO: Bạn đã nhập sai Key Admin ${newFailedCount} lần liên tiếp. IP thiết bị của bạn đã bị cấm trong ${banHours} giờ (${durationText}).`,
    };
  }
}
