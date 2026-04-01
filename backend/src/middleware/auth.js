import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

/**
 * Middleware: Verify JWT Token
 *
 * Expects header:  Authorization: Bearer <JWT>
 * On success, attaches decoded token to req.user
 */
export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const token = authHeader.split("Bearer ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { uid, email, iat, exp }
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

/**
 * Middleware: Optional Auth
 *
 * Like verifyToken but doesn't reject unauthenticated requests.
 */
export const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    try {
        const token = authHeader.split("Bearer ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
    } catch {
        // Token invalid — proceed without user context
    }

    next();
};
