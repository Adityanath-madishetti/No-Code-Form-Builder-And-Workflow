import { toNumber, toText } from "./helpers.js";

function tokenizeExpression(expression) {
    const tokens = [];
    let i = 0;
    const src = expression || "";

    while (i < src.length) {
        const c = src[i];

        if (/\s/.test(c)) {
            i += 1;
            continue;
        }

        if (c === "{" ) {
            const close = src.indexOf("}", i + 1);
            if (close === -1) {
                throw new Error("Unclosed field reference");
            }
            const fieldId = src.slice(i + 1, close).trim();
            tokens.push({ type: "field", value: fieldId });
            i = close + 1;
            continue;
        }

        if (c === "'" || c === "\"") {
            let j = i + 1;
            let out = "";
            while (j < src.length && src[j] !== c) {
                out += src[j];
                j += 1;
            }
            if (j >= src.length) {
                throw new Error("Unclosed string literal");
            }
            tokens.push({ type: "string", value: out });
            i = j + 1;
            continue;
        }

        const twoChar = src.slice(i, i + 2);
        if (["==", "!=", ">=", "<="].includes(twoChar)) {
            tokens.push({ type: "op", value: twoChar });
            i += 2;
            continue;
        }

        if (["+","-","*","/","(",")",",",">","<"].includes(c)) {
            tokens.push({ type: "op", value: c });
            i += 1;
            continue;
        }

        if (/[0-9.]/.test(c)) {
            let j = i;
            while (j < src.length && /[0-9.]/.test(src[j])) j += 1;
            tokens.push({ type: "number", value: src.slice(i, j) });
            i = j;
            continue;
        }

        if (/[A-Za-z_]/.test(c)) {
            let j = i;
            while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j += 1;
            tokens.push({ type: "ident", value: src.slice(i, j) });
            i = j;
            continue;
        }

        throw new Error(`Unexpected token "${c}"`);
    }

    return tokens;
}

function runFormulaFunction(name, args) {
    const fn = String(name || "").toUpperCase();
    switch (fn) {
        case "IF":
            return args[0] ? args[1] : args[2];
        case "MIN":
            return Math.min(...args.map((v) => toNumber(v)));
        case "MAX":
            return Math.max(...args.map((v) => toNumber(v)));
        case "ROUND": {
            const value = toNumber(args[0]);
            const precision = Math.max(0, Math.floor(toNumber(args[1] ?? 0)));
            const factor = 10 ** precision;
            return Math.round(value * factor) / factor;
        }
        case "CONCAT":
            return args.map((v) => toText(v)).join("");
        case "LEN": {
            const value = args[0];
            if (value === null || value === undefined) return 0;
            if (Array.isArray(value)) return value.length;
            if (typeof value === "object") return Object.keys(value).length;
            return String(value).length;
        }
        default:
            throw new Error(`Unsupported function "${name}"`);
    }
}

function createParser(tokens, values) {
    let idx = 0;

    function peek() {
        return tokens[idx] || null;
    }

    function consume(expectedValue) {
        const token = tokens[idx];
        if (!token) {
            throw new Error("Unexpected end of expression");
        }
        if (expectedValue && token.value !== expectedValue) {
            throw new Error(`Expected "${expectedValue}" but found "${token.value}"`);
        }
        idx += 1;
        return token;
    }

    function parsePrimary() {
        const token = peek();
        if (!token) throw new Error("Unexpected end of expression");

        if (token.type === "number") {
            consume();
            return Number(token.value);
        }
        if (token.type === "string") {
            consume();
            return token.value;
        }
        if (token.type === "field") {
            consume();
            return values[token.value];
        }
        if (token.type === "ident") {
            consume();
            const ident = token.value;
            const next = peek();
            if (next && next.value === "(") {
                consume("(");
                const args = [];
                if (!(peek() && peek().value === ")")) {
                    args.push(parseComparison());
                    while (peek() && peek().value === ",") {
                        consume(",");
                        args.push(parseComparison());
                    }
                }
                consume(")");
                return runFormulaFunction(ident, args);
            }
            return values[ident];
        }
        if (token.value === "(") {
            consume("(");
            const expr = parseComparison();
            consume(")");
            return expr;
        }
        if (token.value === "-") {
            consume("-");
            return -toNumber(parsePrimary());
        }
        throw new Error(`Unexpected token "${token.value}"`);
    }

    function parseMulDiv() {
        let left = parsePrimary();
        while (peek() && ["*", "/"].includes(peek().value)) {
            const op = consume().value;
            const right = parsePrimary();
            if (op === "*") left = toNumber(left) * toNumber(right);
            if (op === "/") left = toNumber(left) / (toNumber(right) || 1);
        }
        return left;
    }

    function parseAddSub() {
        let left = parseMulDiv();
        while (peek() && ["+", "-"].includes(peek().value)) {
            const op = consume().value;
            const right = parseMulDiv();
            if (op === "+") {
                if (typeof left === "string" || typeof right === "string") {
                    left = `${toText(left)}${toText(right)}`;
                } else {
                    left = toNumber(left) + toNumber(right);
                }
            } else {
                left = toNumber(left) - toNumber(right);
            }
        }
        return left;
    }

    function parseComparison() {
        let left = parseAddSub();
        while (
            peek() &&
            ["==", "!=", ">", "<", ">=", "<="].includes(peek().value)
        ) {
            const op = consume().value;
            const right = parseAddSub();
            switch (op) {
                case "==":
                    left = toText(left) === toText(right);
                    break;
                case "!=":
                    left = toText(left) !== toText(right);
                    break;
                case ">":
                    left = toNumber(left) > toNumber(right);
                    break;
                case "<":
                    left = toNumber(left) < toNumber(right);
                    break;
                case ">=":
                    left = toNumber(left) >= toNumber(right);
                    break;
                case "<=":
                    left = toNumber(left) <= toNumber(right);
                    break;
                default:
                    break;
            }
        }
        return left;
    }

    function parseExpression() {
        const out = parseComparison();
        if (idx < tokens.length) {
            throw new Error(`Unexpected token "${tokens[idx].value}"`);
        }
        return out;
    }

    return { parseExpression };
}

export function evaluateFormulaExpression(expression, values) {
    const tokens = tokenizeExpression(expression || "");
    const parser = createParser(tokens, values);
    return parser.parseExpression();
}
