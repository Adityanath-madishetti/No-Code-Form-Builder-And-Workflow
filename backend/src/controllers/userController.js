import {
    syncUserService,
    getMeService,
    updateMeService,
} from "../services/userService.js";

export const syncUser = async (req, res, next) => {
    try {
        const user = await syncUserService(req.user);
        res.status(200).json({ user });
    } catch (err) {
        next(err);
    }
};

export const getMe = async (req, res, next) => {
    try {
        const user = await getMeService(req.user.uid);
        res.status(200).json({ user });
    } catch (err) {
        next(err);
    }
};

export const updateMe = async (req, res, next) => {
    try {
        const user = await updateMeService(req.user.uid, req.body);
        res.status(200).json({ user });
    } catch (err) {
        next(err);
    }
};
