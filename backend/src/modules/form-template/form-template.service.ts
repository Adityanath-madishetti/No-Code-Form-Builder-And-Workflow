import crypto from 'crypto';
import * as repo from './form-template.repository.js';
import { ApiError } from '@/middlewares/error.middleware.js';
import { normalizeAccess, normalizeEmail } from '@/modules/form/form.utils.js';
import { resolveAccessIdentities } from '@/modules/form/form.service.js';
import type { FormTemplateCreate, FormTemplateUpdate } from './form-template.types.js';

const canReadTemplate = (template: any, user: any) => {
  if (template.isPublic) return true;
  if (!user) return false;
  if (template.createdBy === user.uid) return true;
  const email = normalizeEmail(user.email);
  if (!email) return false;
  return Array.isArray(template.sharedWith) && template.sharedWith.includes(email);
};

const enrichCreatorEmail = async (rows: any[]) => {
  const uids = [...new Set(rows.map((row) => row.createdBy).filter(Boolean))];
  const users = await repo.findUsersByUids(uids);
  const emailByUid = new Map(users.map((user: any) => [user.uid, user.email]));
  return rows.map((row: any) => ({
    ...row,
    creatorEmail: emailByUid.get(row.createdBy) || 'Unknown',
  }));
};

const normalizeSharedWith = (sharedWith: string[] = []) => [
  ...new Set(sharedWith.map((email) => normalizeEmail(email)).filter(Boolean)),
];

const normalizeSnapshot = async (snapshot: any) => {
  const normalizedAccess = await resolveAccessIdentities(snapshot?.access ?? {});
  return {
    meta: snapshot?.meta || {},
    theme: snapshot?.theme || null,
    settings: snapshot?.settings || {},
    access: normalizeAccess(normalizedAccess),
    pages: Array.isArray(snapshot?.pages) ? snapshot.pages : [],
    logic: snapshot?.logic || {},
    workflow: snapshot?.workflow || null,
  };
};

export const createTemplateService = async (uid: string, body: FormTemplateCreate) => {
  const template = await repo.createTemplateDoc({
    templateId: crypto.randomUUID(),
    name: body.name.trim(),
    description: body.description?.trim() || '',
    createdBy: uid,
    isPublic: body.isPublic || false,
    sharedWith: normalizeSharedWith(body.sharedWith),
    snapshot: await normalizeSnapshot(body.snapshot),
  });

  const [enriched] = await enrichCreatorEmail([template.toObject()]);
  return enriched;
};

export const listTemplatesService = async (user: any) => {
  const email = normalizeEmail(user?.email);
  const query: any = {
    $or: [{ createdBy: user?.uid }, { isPublic: true }],
  };
  if (email) query.$or.push({ sharedWith: email });

  const templates = await repo.findTemplatesByQuery(query);
  return enrichCreatorEmail(templates);
};

export const getTemplateService = async (templateId: string, user: any) => {
  const template = await repo.findTemplateById(templateId);
  if (!template) throw new ApiError(404, 'Template not found');
  if (!canReadTemplate(template, user)) {
    if (!user) throw new ApiError(401, 'Authentication required to access this template');
    throw new ApiError(403, 'Access denied');
  }
  const [enriched] = await enrichCreatorEmail([template.toObject()]);
  return enriched;
};

export const updateTemplateService = async (
  templateId: string,
  uid: string,
  updates: FormTemplateUpdate,
) => {
  const template = await repo.findTemplateById(templateId);
  if (!template) throw new ApiError(404, 'Template not found');
  if (template.createdBy !== uid) throw new ApiError(403, 'Access denied');

  if (updates.name !== undefined) template.name = updates.name.trim();
  if (updates.description !== undefined) template.description = updates.description.trim();
  if (updates.isPublic !== undefined) template.isPublic = updates.isPublic;
  if (updates.sharedWith !== undefined)
    template.sharedWith = normalizeSharedWith(updates.sharedWith);
  if (updates.snapshot !== undefined) {
    (template as any).snapshot = await normalizeSnapshot(updates.snapshot);
  }

  await template.save();
  const [enriched] = await enrichCreatorEmail([template.toObject()]);
  return enriched;
};

export const deleteTemplateService = async (templateId: string, uid: string) => {
  const deleted = await repo.deleteTemplateDoc(templateId, uid);
  if (!deleted) throw new ApiError(404, 'Template not found or access denied');
};

export const previewTemplateService = async (templateId: string, user: any) => {
  const template = await repo.findTemplateById(templateId);
  if (!template) throw new ApiError(404, 'Template not found');
  if (!canReadTemplate(template, user)) {
    if (!user) throw new ApiError(401, 'Authentication required to preview this template');
    throw new ApiError(403, 'Access denied');
  }
  return {
    templateId: template.templateId,
    name: template.name,
    description: template.description || '',
    snapshot: template.snapshot,
  };
};
