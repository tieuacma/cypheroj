import crypto from "crypto";
import { connectMongoDB } from "@/lib/mongodb";
import { UserModel, type SafeUser, type UserDocument } from "@/lib/models/user";
import { DbError } from "@/lib/errors/db-errors";

const JWT_SECRET = process.env.JWT_SECRET || "cypher_student_secret_key_2026";

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, actualSalt, 1000, 64, "sha512")
    .toString("hex");
  return { hash, salt: actualSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const candidateHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return crypto.timingSafeEqual(Buffer.from(candidateHash), Buffer.from(hash));
}

export function toSafeUser(doc: UserDocument): SafeUser {
  return {
    id: doc._id.toString(),
    username: doc.username,
    email: doc.email,
    name: doc.name,
    avatar: doc.avatar || "student-1",
    school: doc.school || "Trường THPT Chuyên",
    bio: doc.bio || "",
    role: (doc.role as "student" | "admin") || "student",
    solved_problems: doc.solved_problems || [],
    total_submissions: doc.total_submissions || 0,
    points: doc.points || 0,
    created_at: doc.created_at ? new Date(doc.created_at).toISOString() : new Date().toISOString(),
  };
}

export function createAuthToken(user: SafeUser): string {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600, // 7 days
  };
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(base64Payload)
    .digest("base64url");
  return `${base64Payload}.${signature}`;
}

export function verifyAuthToken(token: string): SafeUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [base64Payload, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(base64Payload)
      .digest("base64url");

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString("utf-8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function registerStudent(input: {
  username: string;
  email: string;
  password: string;
  name: string;
  school?: string;
}): Promise<{ user: SafeUser; token: string }> {
  await connectMongoDB();

  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!username || username.length < 3) {
    throw new DbError("VALIDATION_ERROR", "Tên đăng nhập phải chứa ít nhất 3 ký tự.", 400);
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    throw new DbError("VALIDATION_ERROR", "Tên đăng nhập chỉ chứa chữ cái thường, số và dấu gạch dưới (_).", 400);
  }
  if (!email || !email.includes("@")) {
    throw new DbError("VALIDATION_ERROR", "Email không hợp lệ.", 400);
  }
  if (!input.password || input.password.length < 6) {
    throw new DbError("VALIDATION_ERROR", "Mật khẩu phải chứa ít nhất 6 ký tự.", 400);
  }
  if (!name) {
    throw new DbError("VALIDATION_ERROR", "Họ và tên không được để trống.", 400);
  }

  const existingUsername = await UserModel.findOne({ username }).lean();
  if (existingUsername) {
    throw new DbError("DUPLICATE_ERROR", "Tên đăng nhập đã tồn tại trên hệ thống.", 409);
  }

  const existingEmail = await UserModel.findOne({ email }).lean();
  if (existingEmail) {
    throw new DbError("DUPLICATE_ERROR", "Địa chỉ Email này đã được đăng ký tài khoản.", 409);
  }

  const { hash, salt } = hashPassword(input.password);

  const newUser = new UserModel({
    username,
    email,
    password_hash: hash,
    salt,
    name,
    school: input.school?.trim() || "Trường THPT Chuyên",
    avatar: "student-1",
    bio: "Học sinh đam mê C++ & thuật toán",
    role: "student",
    solved_problems: [],
    total_submissions: 0,
    points: 0,
  });
  await newUser.save();

  const safeUser = toSafeUser(newUser);
  const token = createAuthToken(safeUser);

  return { user: safeUser, token };
}

export async function loginStudent(
  usernameOrEmail: string,
  password: string
): Promise<{ user: SafeUser; token: string }> {
  await connectMongoDB();

  const query = usernameOrEmail.trim().toLowerCase();
  if (!query || !password) {
    throw new DbError("VALIDATION_ERROR", "Vui lòng nhập đầy đủ tên đăng nhập/email và mật khẩu.", 400);
  }

  const userDoc = await UserModel.findOne({
    $or: [{ username: query }, { email: query }],
  });

  if (!userDoc) {
    throw new DbError("AUTH_FAILED", "Tên đăng nhập hoặc mật khẩu không chính xác.", 401);
  }

  const isValid = verifyPassword(password, userDoc.password_hash, userDoc.salt);
  if (!isValid) {
    throw new DbError("AUTH_FAILED", "Tên đăng nhập hoặc mật khẩu không chính xác.", 401);
  }

  const safeUser = toSafeUser(userDoc);
  const token = createAuthToken(safeUser);

  return { user: safeUser, token };
}

export async function getStudentProfile(username: string): Promise<SafeUser | null> {
  await connectMongoDB();
  const userDoc = await UserModel.findOne({ username: username.toLowerCase() });
  return userDoc ? toSafeUser(userDoc) : null;
}

export async function updateStudentProfile(
  username: string,
  data: { name?: string; school?: string; bio?: string; avatar?: string }
): Promise<SafeUser> {
  await connectMongoDB();

  const updatePayload: Record<string, string> = {};
  if (data.name !== undefined) updatePayload.name = data.name.trim();
  if (data.school !== undefined) updatePayload.school = data.school.trim();
  if (data.bio !== undefined) updatePayload.bio = data.bio.trim();
  if (data.avatar !== undefined) updatePayload.avatar = data.avatar.trim();

  const updatedDoc = await UserModel.findOneAndUpdate(
    { username: username.toLowerCase() },
    { $set: updatePayload },
    { new: true }
  );

  if (!updatedDoc) {
    throw new DbError("NOT_FOUND", "Không tìm thấy người dùng.", 404);
  }

  return toSafeUser(updatedDoc);
}

export async function recordStudentSubmission(username: string, problemId: string, isAc: boolean) {
  try {
    await connectMongoDB();
    const userDoc = await UserModel.findOne({ username: username.toLowerCase() });
    if (!userDoc) return;

    userDoc.total_submissions += 1;
    if (isAc && !userDoc.solved_problems.includes(problemId)) {
      userDoc.solved_problems.push(problemId);
      userDoc.points += 100;
    }
    await userDoc.save();
  } catch (err) {
    console.error("Failed to record student submission:", err);
  }
}
