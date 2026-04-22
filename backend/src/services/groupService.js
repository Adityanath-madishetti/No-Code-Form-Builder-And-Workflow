import crypto from "crypto";
import ComponentGroup from "../models/ComponentGroup.js";
import User from "../models/User.js";
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

    const userObj = await User.findOne({ uid }).lean();
    return { ...group.toObject(), creatorEmail: userObj ? userObj.email : "Unknown" };
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

    const groups = await ComponentGroup.find(query).sort({ updatedAt: -1 }).lean();
    
    const uids = [...new Set(groups.map(g => g.createdBy))];
    const users = await User.find({ uid: { $in: uids } }).lean();
    const emailMap = {};
    users.forEach(u => { emailMap[u.uid] = u.email; });

    return groups.map(g => ({
        ...g,
        creatorEmail: emailMap[g.createdBy] || "Unknown"
    }));
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
    
    const userObj = await User.findOne({ uid: group.createdBy }).lean();
    return { ...group.toObject(), creatorEmail: userObj ? userObj.email : "Unknown" };
}

export async function deleteGroupService(groupId, uid) {
    const group = await ComponentGroup.findOneAndDelete({ groupId, createdBy: uid });
    if (!group) throw createError(404, "Group not found or access denied");
    return group;
}
