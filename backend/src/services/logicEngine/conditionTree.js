import { toNumber, toText, isEmpty } from "./helpers.js";

function evaluateLeafCondition(leaf, values) {
    const left = values[leaf.instanceId];
    const right = leaf.value;

    switch (leaf.operator) {
        case "equals":
            return toText(left) === toText(right);
        case "not_equals":
            return toText(left) !== toText(right);
        case "contains":
            if (Array.isArray(left)) {
                return left.some((entry) => toText(entry) === toText(right));
            }
            return toText(left).toLowerCase().includes(toText(right).toLowerCase());
        case "not_contains":
            if (Array.isArray(left)) {
                return !left.some((entry) => toText(entry) === toText(right));
            }
            return !toText(left).toLowerCase().includes(toText(right).toLowerCase());
        case "greater_than":
            return toNumber(left) > toNumber(right);
        case "less_than":
            return toNumber(left) < toNumber(right);
        case "is_empty":
            return isEmpty(left);
        case "is_not_empty":
            return !isEmpty(left);
        default:
            return false;
    }
}

export function evaluateConditionTree(condition, values) {
    if (!condition) return true;
    if (condition.type === "leaf") {
        return evaluateLeafCondition(condition, values);
    }

    const children = Array.isArray(condition.conditions)
        ? condition.conditions
        : [];
    if (children.length === 0) return true;

    if (condition.operator === "OR") {
        return children.some((child) => evaluateConditionTree(child, values));
    }

    return children.every((child) => evaluateConditionTree(child, values));
}
