import {
    submitFormService,
    listSubmissionsService,
    exportSubmissionsCsvService,
    getSubmissionService,
    getMyFormSubmissionsService,
    updateMySubmissionService,
    getMySubmissionsService,
} from "../services/submissionService.js";

export const submitForm = async (req, res, next) => {
    try {
        const result = await submitFormService(req.params.formId, req.body, req.user);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

export const listSubmissions = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const result = await listSubmissionsService(req.params.formId, page, limit, req.user);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

export const exportSubmissionsCsv = async (req, res, next) => {
    try {
        const csvContent = await exportSubmissionsCsvService(req.params.formId, req.user);
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="form-${req.params.formId}-submissions.csv"`
        );
        res.status(200).send(csvContent);
    } catch (err) {
        next(err);
    }
};

export const getSubmission = async (req, res, next) => {
    try {
        const submission = await getSubmissionService(req.params.formId, req.params.submissionId, req.user);
        res.status(200).json({ submission });
    } catch (err) {
        next(err);
    }
};

export const getMyFormSubmissions = async (req, res, next) => {
    try {
        const submissions = await getMyFormSubmissionsService(req.params.formId, req.user);
        res.status(200).json({ submissions });
    } catch (err) {
        next(err);
    }
};

export const updateMySubmission = async (req, res, next) => {
    try {
        const submission = await updateMySubmissionService(req.params.formId, req.params.submissionId, req.body, req.user);
        res.status(200).json({ submission });
    } catch (err) {
        next(err);
    }
};

export const getMySubmissions = async (req, res, next) => {
    try {
        const submissions = await getMySubmissionsService(req.user);
        res.status(200).json({ submissions });
    } catch (err) {
        next(err);
    }
};
