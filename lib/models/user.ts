import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password_hash: { type: String, required: true },
    salt: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    avatar: { type: String, default: "student-1" },
    school: { type: String, default: "Trường THPT Chuyên" },
    bio: { type: String, default: "Học sinh đam mê C++ & thuật toán" },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    solved_problems: { type: [String], default: [] },
    total_submissions: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
  },
  {
    collection: "users",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
  }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
};

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar: string;
  school: string;
  bio: string;
  role: "student" | "admin";
  solved_problems: string[];
  total_submissions: number;
  points: number;
  created_at: string;
}

export const UserModel: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument> | undefined) ??
  mongoose.model<UserDocument>("User", UserSchema);
