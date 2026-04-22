import {
    createGroupService,
    listGroupsService,
    updateGroupService,
    deleteGroupService
} from "../services/groupService.js";

export const createGroup = async (req, res, next) => {
    try {
        const group = await createGroupService(req.user.uid, req.body);
        res.status(201).json({ group });
    } catch (err) {
        next(err);
    }
};

export const listGroups = async (req, res, next) => {
    try {
        const groups = await listGroupsService(req.user);
        res.status(200).json({ groups });
    } catch (err) {
        next(err);
    }
};

export const updateGroup = async (req, res, next) => {
    try {
        const group = await updateGroupService(req.params.groupId, req.user.uid, req.body);
        res.status(200).json({ group });
    } catch (err) {
        next(err);
    }
};

export const deleteGroup = async (req, res, next) => {
    try {
        await deleteGroupService(req.params.groupId, req.user.uid);
        res.status(200).json({ message: "Group deleted" });
    } catch (err) {
        next(err);
    }
};
