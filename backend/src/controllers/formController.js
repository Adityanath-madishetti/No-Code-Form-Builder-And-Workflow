import {
    createFormService,
    listFormsService,
    listSharedFormsService,
    getFormService,
    updateFormService,
    deleteFormService,
    publishFormService,
    getPublicFormService,
} from "../services/formService.js";

export const createForm = async (req, res, next) => {
    try {
        const { form, formVersion } = await createFormService(req.user.uid, req.body);
        res.status(201).json({ form, formVersion });
    } catch (err) {
        next(err);
    }
};

export const listForms = async (req, res, next) => {
    try {
        const forms = await listFormsService(req.user.uid);
        res.status(200).json({ forms });
    } catch (err) {
        next(err);
    }
};

export const listSharedForms = async (req, res, next) => {
    try {
        const forms = await listSharedFormsService(req.user);
        res.status(200).json({ forms });
    } catch (err) {
        next(err);
    }
};

export const getForm = async (req, res, next) => {
    try {
        const form = await getFormService(req.params.formId, req.user);
        res.status(200).json({ form });
    } catch (err) {
        next(err);
    }
};

export const updateForm = async (req, res, next) => {
    try {
        const form = await updateFormService(req.params.formId, req.body, req.user);
        res.status(200).json({ form });
    } catch (err) {
        next(err);
    }
};

export const deleteForm = async (req, res, next) => {
    try {
        const form = await deleteFormService(req.params.formId, req.user.uid);
        res.status(200).json({ message: "Form deleted", form });
    } catch (err) {
        next(err);
    }
};

export const publishForm = async (req, res, next) => {
    try {
        const { form, publishedVersion } = await publishFormService(req.params.formId, req.user.uid);
        res.status(200).json({
            message: "Form published successfully",
            form,
            publishedVersion,
        });
    } catch (err) {
        next(err);
    }
};

export const getPublicForm = async (req, res, next) => {
    try {
        const { form, version } = await getPublicFormService(req.params.formId, req.user);
        res.status(200).json({ form, version });
    } catch (err) {
        next(err);
    }
};
