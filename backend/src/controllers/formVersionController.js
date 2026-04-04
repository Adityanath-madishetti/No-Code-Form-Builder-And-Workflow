import {
    listVersionsService,
    getLatestVersionService,
    getVersionService,
    createVersionService,
    updateVersionService,
    updateVersionSettingsService,
    updateVersionAccessService,
    publishVersionService,
} from "../services/formVersionService.js";

export const listVersions = async (req, res, next) => {
    try {
        const versions = await listVersionsService(req.params.formId, req.user);
        res.status(200).json({ versions });
    } catch (err) {
        next(err);
    }
};

export const getLatestVersion = async (req, res, next) => {
    try {
        const version = await getLatestVersionService(req.params.formId, req.user);
        res.status(200).json({ version });
    } catch (err) {
        next(err);
    }
};

export const getVersion = async (req, res, next) => {
    try {
        const versionNum = parseInt(req.params.version, 10);
        const version = await getVersionService(req.params.formId, versionNum, req.user);
        res.status(200).json({ version });
    } catch (err) {
        next(err);
    }
};

export const createVersion = async (req, res, next) => {
    try {
        const version = await createVersionService(req.params.formId, req.user);
        res.status(201).json({ version });
    } catch (err) {
        next(err);
    }
};

export const updateVersion = async (req, res, next) => {
    try {
        const versionNum = parseInt(req.params.version, 10);
        const version = await updateVersionService(req.params.formId, versionNum, req.body, req.user);
        res.status(200).json({ version });
    } catch (err) {
        next(err);
    }
};

export const updateVersionSettings = async (req, res, next) => {
    try {
        const versionNum = parseInt(req.params.version, 10);
        const version = await updateVersionSettingsService(req.params.formId, versionNum, req.body, req.user);
        res.status(200).json({ version });
    } catch (err) {
        next(err);
    }
};

export const updateVersionAccess = async (req, res, next) => {
    try {
        const versionNum = parseInt(req.params.version, 10);
        const version = await updateVersionAccessService(req.params.formId, versionNum, req.body, req.user);
        res.status(200).json({ version });
    } catch (err) {
        next(err);
    }
};

export const publishVersion = async (req, res, next) => {
    try {
        const version = await publishVersionService(req.params.formId, req.user);
        res.status(200).json({
            message: "Form published",
            version,
        });
    } catch (err) {
        next(err);
    }
};
