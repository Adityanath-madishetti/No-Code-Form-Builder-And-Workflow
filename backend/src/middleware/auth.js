import admin from "../config/firebase.js";

/**
 * Middleware: Verify Firebase ID Token
 *
 * Expects header:  Authorization: Bearer <Firebase ID Token>
 * On success, attaches decoded token to req.user
 */
export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const token = authHeader.split("Bearer ")[1];
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = decoded; // { uid, email, name, picture, ... }
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

/**
 * Middleware: Optional Auth
 *
 * Like verifyToken but doesn't reject unauthenticated requests.
 * If a valid token is present, req.user is populated.
 * If not, req.user remains undefined and the request proceeds.
 */
export const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    try {
        const token = authHeader.split("Bearer ")[1];
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = decoded;
    } catch {
        // Token invalid — proceed without user context
    }

    next();
};
