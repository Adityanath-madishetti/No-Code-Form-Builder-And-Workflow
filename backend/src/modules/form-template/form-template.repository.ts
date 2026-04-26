import FormTemplate from '@/database/models/FormTemplate.js';
import User from '@/database/models/User.js';

export const createTemplateDoc = async (data: any) => {
  return FormTemplate.create(data);
};

export const findTemplateById = async (templateId: string) => {
  return FormTemplate.findOne({ templateId });
};

export const findTemplatesByQuery = async (query: any) => {
  return FormTemplate.find(query).sort({ updatedAt: -1 }).lean();
};

export const deleteTemplateDoc = async (templateId: string, uid: string) => {
  return FormTemplate.findOneAndDelete({ templateId, createdBy: uid });
};

export const findUsersByUids = async (uids: string[]) => {
  if (!uids.length) return [];
  return User.find({ uid: { $in: uids } })
    .select('uid email')
    .lean();
};

export const findUsersByEmails = async (emails: string[]) => {
  if (!emails.length) return [];
  return User.find({ email: { $in: emails } })
    .select('uid email')
    .lean();
};
