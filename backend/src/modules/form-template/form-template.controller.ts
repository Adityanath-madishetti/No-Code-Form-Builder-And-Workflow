import { NextFunction, Request, Response } from 'express';
import * as service from './form-template.service.js';
import { ApiError } from '@/middlewares/error.middleware.js';

export const createTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const template = await service.createTemplateService(req.user.uid, req.body);
    res.status(201).json({ template });
  } catch (err) {
    next(err);
  }
};

export const listTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const templates = await service.listTemplatesService(req.user);
    res.status(200).json({ templates });
  } catch (err) {
    next(err);
  }
};

export const getTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await service.getTemplateService(req.params.templateId as string, req.user);
    res.status(200).json({ template });
  } catch (err) {
    next(err);
  }
};

export const updateTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const template = await service.updateTemplateService(
      req.params.templateId as string,
      req.user.uid,
      req.body,
    );
    res.status(200).json({ template });
  } catch (err) {
    next(err);
  }
};

export const deleteTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    await service.deleteTemplateService(req.params.templateId as string, req.user.uid);
    res.status(200).json({ message: 'Template deleted' });
  } catch (err) {
    next(err);
  }
};

export const previewTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const preview = await service.previewTemplateService(req.params.templateId as string, req.user);
    res.status(200).json({ preview });
  } catch (err) {
    next(err);
  }
};
