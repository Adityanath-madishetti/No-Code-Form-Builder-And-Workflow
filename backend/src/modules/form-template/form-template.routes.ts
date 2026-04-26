import { Router } from 'express';
import { optionalAuth, verifyToken } from '@/middlewares/auth.middleware.js';
import { validateRequest } from '@/middlewares/validate.middleware.js';
import * as controller from './form-template.controller.js';
import { createFormTemplateSchema, updateFormTemplateSchema } from './form-template.schema.js';

const router = Router();

router.post('/', verifyToken, validateRequest(createFormTemplateSchema), controller.createTemplate);
router.get('/', verifyToken, controller.listTemplates);
router.get('/:templateId', optionalAuth, controller.getTemplate);
router.patch(
  '/:templateId',
  verifyToken,
  validateRequest(updateFormTemplateSchema),
  controller.updateTemplate,
);
router.delete('/:templateId', verifyToken, controller.deleteTemplate);
router.get('/:templateId/preview', optionalAuth, controller.previewTemplate);

export default router;
