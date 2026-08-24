import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const IpBanSchema = new Schema(
  {
    ip: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    failed_count: { type: Number, required: true, default: 0 },
    banned_until: { type: Date, default: null },
    last_failed_at: { type: Date, default: Date.now },
  },
  {
    collection: "ip_bans",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
  }
);

export type IpBanDocument = InferSchemaType<typeof IpBanSchema> & {
  _id: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
};

export const IpBanModel: Model<IpBanDocument> =
  (mongoose.models.IpBan as Model<IpBanDocument> | undefined) ??
  mongoose.model<IpBanDocument>("IpBan", IpBanSchema);
