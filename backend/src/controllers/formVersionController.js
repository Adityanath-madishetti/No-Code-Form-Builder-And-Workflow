import Form from "../models/Form.js";
import FormVersion from "../models/FormVersion.js";
import { createError } from "../middleware/errorHandler.js";

/**
 * GET /api/forms/:formId/versions
 * List all versions of a form.
 */
export const listVersions = async (req, res, next) => {
    try {
        const { formId } = req.params;

        // Verify form exists and user owns it
        const form = await Form.findOne({ formId, isDeleted: false });
        if (!form) throw createError(404, "Form not found");
        if (form.createdBy !== req.user.uid) throw createError(403, "Access denied");

        const versions = await FormVersion.find({ formId })
            .select("formId version meta.name meta.isDraft createdAt updatedAt")
            .sort({ version: -1 });

        res.status(200).json({ versions });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/forms/:formId/versions/latest
 * Get the latest (highest version number) version of a form.
 */
export const getLatestVersion = async (req, res, next) => {
    try {
        const { formId } = req.params;

        const form = await Form.findOne({ formId, isDeleted: false });
        if (!form) throw createError(404, "Form not found");
        if (form.createdBy !== req.user.uid) throw createError(403, "Access denied");

        const version = await FormVersion.findOne({ formId }).sort({ version: -1 });

        if (!version) throw createError(404, "No versions found");

        res.status(200).json({ version });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/forms/:formId/versions/:version
 * Get a specific version of a form.
 */
export const getVersion = async (req, res, next) => {
    try {
        const { formId } = req.params;
        const versionNum = parseInt(req.params.version, 10);

        if (isNaN(versionNum)) throw createError(400, "Invalid version number");

        const form = await Form.findOne({ formId, isDeleted: false });
        if (!form) throw createError(404, "Form not found");
        if (form.createdBy !== req.user.uid) throw createError(403, "Access denied");

        const version = await FormVersion.findOne({ formId, version: versionNum });

        if (!version) throw createError(404, "Version not found");

        res.status(200).json({ version });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/forms/:formId/versions
 * Create a new version by cloning the latest and incrementing.
 */
export const createVersion = async (req, res, next) => {
    try {
        const { formId } = req.params;
        const uid = req.user.uid;

        const form = await Form.findOne({ formId, isDeleted: false });
        if (!form) throw createError(404, "Form not found");
        if (form.createdBy !== uid) throw createError(403, "Access denied");

        // Get latest version to clone from
        const latest = await FormVersion.findOne({ formId }).sort({ version: -1 });
        if (!latest) throw createError(404, "No existing version to clone");

        const newVersionNum = latest.version + 1;

        // Clone the latest version, stripping all Mongoose internals
        const cloned = latest.toObject();
        delete cloned._id;
        delete cloned.__v;
        delete cloned.id;
        delete cloned.createdAt;
        delete cloned.updatedAt;

        cloned.version = newVersionNum;
        cloned.meta = {
            ...cloned.meta,
            isDraft: true,
        };

        // Add to version history
        cloned.versionHistory = [
            ...(cloned.versionHistory || []),
            {
                version: newVersionNum,
                createdBy: uid,
                createdAt: new Date(),
                message: (req.body && req.body.message) || `Created version ${newVersionNum}`,
            },
        ];

        const newVersion = await FormVersion.create(cloned);

        // Update form header
        await Form.findOneAndUpdate(
            { formId },
            { currentVersion: newVersionNum },
            { returnDocument: "after" }
        );

        res.status(201).json({ version: newVersion });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/forms/:formId/versions/:version
 * Save/update a specific draft version (auto-save from the builder).
 */
export const updateVersion = async (req, res, next) => {
    try {
        const { formId } = req.params;
        const versionNum = parseInt(req.params.version, 10);
        const uid = req.user.uid;

        if (isNaN(versionNum)) throw createError(400, "Invalid version number");

        const form = await Form.findOne({ formId, isDeleted: false });
        if (!form) throw createError(404, "Form not found");
        if (form.createdBy !== uid) throw createError(403, "Access denied");

        // Only updatable fields — prevent overwriting formId, version, etc.
        const allowedFields = [
            "meta",
            "settings",
            "pages",
            "logic",
            "workflow",
            "access",
        ];

        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            throw createError(400, "No valid fields to update");
        }

        const version = await FormVersion.findOneAndUpdate(
            { formId, version: versionNum },
            { $set: updates },
            { returnDocument: "after", runValidators: true }
        );

        if (!version) throw createError(404, "Version not found");

        res.status(200).json({ version });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/forms/:formId/versions/publish
 * Publish the latest version (set isDraft to false, activate form).
 */
export const publishVersion = async (req, res, next) => {
    try {
        const { formId } = req.params;
        const uid = req.user.uid;

        const form = await Form.findOne({ formId, isDeleted: false });
        if (!form) throw createError(404, "Form not found");
        if (form.createdBy !== uid) throw createError(403, "Access denied");

        // Publish the latest version
        const version = await FormVersion.findOneAndUpdate(
            { formId, version: form.currentVersion },
            {
                $set: { "meta.isDraft": false },
                $push: {
                    versionHistory: {
                        version: form.currentVersion,
                        createdBy: uid,
                        createdAt: new Date(),
                        message: `Published version ${form.currentVersion}`,
                    },
                },
            },
            { returnDocument: "after" }
        );

        if (!version) throw createError(404, "Version not found");

        // Activate the form
        await Form.findOneAndUpdate({ formId }, { isActive: true }, { returnDocument: "after" });

        res.status(200).json({ message: "Form published", version });
    } catch (err) {
        next(err);
    }
};
