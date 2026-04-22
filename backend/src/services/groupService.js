import crypto from "crypto";
import ComponentGroup from "../models/ComponentGroup.js";
import { createError } from "../middleware/errorHandler.js";
import { normalizeEmail } from "../utils/formPermissions.js";

export async function createGroupService(uid, { name, components, sharedWith, isPublic }) {
    const groupId = crypto.randomUUID();
    const normalizedEmails = (sharedWith || []).map(normalizeEmail).filter(Boolean);

    const group = await ComponentGroup.create({
        groupId,
        name,
        components,
        createdBy: uid,
        sharedWith: normalizedEmails,
        isPublic: isPublic || false
    });

    return group;
}

export async function listGroupsService(user) {
    const uid = user.uid;
    const email = normalizeEmail(user.email);

    const query = {
        $or: [
            { createdBy: uid },
            { isPublic: true }
        ]
    };

    if (email) {
        query.$or.push({ sharedWith: email });
    }

    return ComponentGroup.find(query).sort({ updatedAt: -1 });
}

export async function updateGroupService(groupId, uid, updates) {
    const group = await ComponentGroup.findOne({ groupId });
    if (!group) throw createError(404, "Group not found");
    if (group.createdBy !== uid) throw createError(403, "Access denied");

    if (updates.name !== undefined) group.name = updates.name;
    if (updates.components !== undefined) group.components = updates.components;
    if (updates.isPublic !== undefined) group.isPublic = updates.isPublic;
    if (updates.sharedWith !== undefined) {
        group.sharedWith = updates.sharedWith.map(normalizeEmail).filter(Boolean);
    }

    await group.save();
    return group;
}

export async function deleteGroupService(groupId, uid) {
    const group = await ComponentGroup.findOneAndDelete({ groupId, createdBy: uid });
    if (!group) throw createError(404, "Group not found or access denied");
    return group;
}
