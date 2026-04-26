import mongoose from 'mongoose';

const { Schema } = mongoose;

const IdentitySchema = new Schema(
  {
    uid: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
  },
  { _id: false },
);

const TemplateAccessSchema = new Schema(
  {
    editors: { type: [IdentitySchema], default: [] },
    reviewers: { type: [IdentitySchema], default: [] },
    viewers: { type: [IdentitySchema], default: [] },
    roles: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const FormTemplateSchema = new Schema(
  {
    templateId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    createdBy: { type: String, required: true, index: true },
    isPublic: { type: Boolean, default: false },
    sharedWith: { type: [String], default: [] },
    snapshot: {
      meta: { type: Schema.Types.Mixed, default: {} },
      theme: { type: Schema.Types.Mixed, default: null },
      settings: { type: Schema.Types.Mixed, default: {} },
      access: { type: TemplateAccessSchema, default: {} },
      pages: { type: [Schema.Types.Mixed], default: [] },
      logic: { type: Schema.Types.Mixed, default: {} },
      workflow: { type: Schema.Types.Mixed, default: null },
    },
  },
  { timestamps: true },
);

FormTemplateSchema.index({ createdBy: 1, updatedAt: -1 });

export default mongoose.model('FormTemplate', FormTemplateSchema);
