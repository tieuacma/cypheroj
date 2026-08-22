import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type { DbProblem } from "@/lib/db/types";

const PROBLEM_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const ProblemSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => PROBLEM_ID_PATTERN.test(value),
        message:
          'Problem id must be lowercase alphanumeric segments separated by hyphens (e.g. "sum-two-numbers").',
      },
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, default: "" },
    input_format: { type: String, required: true, default: "" },
    output_format: { type: String, required: true, default: "" },
    category: { type: String, required: true, trim: true, default: "General" },
    sample_input: { type: String, required: true, default: "" },
    sample_output: { type: String, required: true, default: "" },
    time_limit_ms: { type: Number, required: true, min: 1, default: 1000 },
    memory_limit_mb: { type: Number, required: true, min: 1, default: 256 },
    is_subtask: { type: Boolean, required: true, default: false },
    subtasks: {
      type: [
        {
          label: { type: String, required: true, trim: true },
          points: { type: Number, required: true, min: 0 },
        },
      ],
      default: [],
    },
  },
  {
    collection: "problems",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
  }
);

export type ProblemDocument = InferSchemaType<typeof ProblemSchema> & {
  _id: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
};

export type ProblemLean = DbProblem & {
  _id: mongoose.Types.ObjectId;
};

export const ProblemModel: Model<ProblemDocument> =
  (mongoose.models.Problem as Model<ProblemDocument> | undefined) ??
  mongoose.model<ProblemDocument>("Problem", ProblemSchema);

export { PROBLEM_ID_PATTERN };
