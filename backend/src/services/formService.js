import crypto from "crypto";
import Form from "../models/Form.js";
import FormVersion from "../models/FormVersion.js";
import Submission from "../models/Submission.js";
import { createError } from "../middleware/errorHandler.js";
import {
    canEditForm,
    canFillForm,
    normalizeEmail,
    normalizeVersionForResponse,
} from "../utils/formPermissions.js";

export async function getLatestVersion(formId) {
    return FormVersion.findOne({ formId }).sort({ version: -1 });
}

export async function createFormService(uid, { title, description }) {
    const formId = crypto.randomUUID();

    const form = await Form.create({
        formId,
        title: title || "Untitled Form",
        currentVersion: 1,
        createdBy: uid,
    });

    const formVersion = await FormVersion.create({
        formId,
        version: 1,
        meta: {
            createdBy: uid,
            name: title || "Untitled Form",
            description: description || "",
            isDraft: true,
        },
        settings: {
            collectEmailMode: "none",
            submissionPolicy: "none",
            canViewOwnSubmission: false,
        },
        access: {
            visibility: "private",
            editors: [],
            reviewers: [],
            viewers: [],
        },
        pages: [
            {
                pageId: crypto.randomUUID(),
                pageNo: 1,
                title: "Page 1",
                components: [],
            },
        ],
        versionHistory: [
            {
                version: 1,
                createdBy: uid,
                createdAt: new Date(),
                message: "Initial draft",
            },
        ],
    });

    return { form, formVersion };
}

export async function listFormsService(uid) {
    return Form.find({
        isDeleted: false,
        createdBy: uid,
    }).sort({ updatedAt: -1 });
}

export async function listSharedFormsService(user) {
    const uid = user.uid;
    const email = normalizeEmail(user.email);
    const matchClauses = [
        { "latestAccess.editors.uid": uid },
        { "latestAccess.reviewers.uid": uid },
    ];
    if (email) {
        matchClauses.push({ "latestAccess.editors.email": email });
        matchClauses.push({ "latestAccess.reviewers.email": email });
    }

    const sharedFormRows = await FormVersion.aggregate([
        { $sort: { version: -1 } },
        {
            $group: {
                _id: "$formId",
                latestAccess: { $first: "$access" },
            },
        },
        { $match: { $or: matchClauses } },
        { $project: { _id: 0, formId: "$_id", latestAccess: 1 } },
    ]);

    const hasIdentity = (list = []) =>
        Array.isArray(list) &&
        list.some((entry) => {
            const entryUid = typeof entry?.uid === "string" ? entry.uid : "";
            const entryEmail = normalizeEmail(entry?.email);
            return (entryUid && entryUid === uid) || (email && entryEmail === email);
        });

    const roleMap = new Map();
    for (const row of sharedFormRows) {
        const roles = [];
        if (hasIdentity(row.latestAccess?.editors)) roles.push("editor");
        if (hasIdentity(row.latestAccess?.reviewers)) roles.push("reviewer");
        if (roles.length) {
            roleMap.set(row.formId, roles);
        }
    }

    const sharedFormIds = [...roleMap.keys()];
    if (sharedFormIds.length === 0) {
        return [];
    }

    const [forms, submissionCounts] = await Promise.all([
        Form.find({
            formId: { $in: sharedFormIds },
            isDeleted: false,
            createdBy: { $ne: uid },
        }).sort({ updatedAt: -1 }),
        Submission.aggregate([
            { $match: { formId: { $in: sharedFormIds } } },
            {
                $group: {
                    _id: "$formId",
                    count: { $sum: 1 },
                },
            },
        ]),
    ]);

    const countMap = new Map(
        submissionCounts.map((entry) => [entry._id, entry.count])
    );

    return forms
        .map((form) => {
            const sharedRoles = roleMap.get(form.formId) || [];
            if (!sharedRoles.length) return null;

            return {
                formId: form.formId,
                title: form.title,
                currentVersion: form.currentVersion,
                isActive: form.isActive,
                createdBy: form.createdBy,
                updatedAt: form.updatedAt,
                createdAt: form.createdAt,
                sharedRole: sharedRoles.includes("editor")
                    ? "editor"
                    : "reviewer",
                sharedRoles,
                submissionCount: countMap.get(form.formId) || 0,
            };
        })
        .filter(Boolean);
}

export async function getFormService(formId, user) {
    const form = await Form.findOne({ formId, isDeleted: false });
    if (!form) throw createError(404, "Form not found");

    const latestVersion = await getLatestVersion(formId);
    if (!latestVersion) throw createError(404, "Form version not found");

    if (!canEditForm(form, latestVersion, user)) {
        throw createError(403, "Access denied");
    }

    return form;
}

export async function updateFormService(formId, fields, user) {
    const allowedFields = ["title", "isActive"];
    const updates = {};

    for (const field of allowedFields) {
        if (fields[field] !== undefined) {
            updates[field] = fields[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        throw createError(400, "No valid fields to update");
    }

    const form = await Form.findOne({ formId, isDeleted: false });
    if (!form) throw createError(404, "Form not found");

    const latestVersion = await getLatestVersion(formId);
    if (!latestVersion) throw createError(404, "Form version not found");

    if (!canEditForm(form, latestVersion, user)) {
        throw createError(403, "Access denied");
    }

    return Form.findOneAndUpdate(
        { formId, isDeleted: false },
        { $set: updates },
        { returnDocument: "after", runValidators: true }
    );
}

export async function deleteFormService(formId, uid) {
    const form = await Form.findOneAndUpdate(
        {
            formId: formId,
            createdBy: uid,
            isDeleted: false,
        },
        { $set: { isDeleted: true, isActive: false } },
        { returnDocument: "after" }
    );

    if (!form) {
        throw createError(404, "Form not found");
    }

    return form;
}

export async function publishFormService(formId, uid) {
    const form = await Form.findOne({ formId, isDeleted: false });
    if (!form) throw createError(404, "Form not found");
    if (form.createdBy !== uid) throw createError(403, "Access denied");

    form.isActive = true;
    await form.save();

    const latestVersion = await FormVersion.findOne({ formId }).sort({
        version: -1,
    });
    if (!latestVersion) throw createError(400, "No version to publish");

    latestVersion.meta.isDraft = false;
    await latestVersion.save();

    return { form, publishedVersion: latestVersion.version };
}

export async function getPublicFormService(formId, user) {
    const form = await Form.findOne({ formId, isDeleted: false });
    if (!form) throw createError(404, "Form not found");
    if (!form.isActive) {
        throw createError(400, "This form is not currently accepting responses");
    }

    const versionDoc = await FormVersion.findOne({
        formId,
        "meta.isDraft": false,
    }).sort({ version: -1 });
    if (!versionDoc) {
        throw createError(400, "No published version available");
    }

    const version = normalizeVersionForResponse(versionDoc);

    if (!canFillForm(form, version, user)) {
        if (!user) {
            throw createError(401, "Authentication required to access this form");
        }
        throw createError(403, "You do not have access to this form");
    }

    return { form, version };
}
