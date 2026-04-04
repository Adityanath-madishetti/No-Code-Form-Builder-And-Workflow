import { loginByEmailService } from "../services/authService.js";

export const loginByEmail = async (req, res, next) => {
    try {
        const result = await loginByEmailService(req.body.email);
        res.status(200).json(result);
    } catch (err) {
        if (err.message === "Email is required") {
            return res.status(400).json({ error: err.message });
        }
        next(err);
    }
};
