import { normalizeLogicPayload } from "./logicEngine/normalizer.js";
import { evaluateConditionTree } from "./logicEngine/conditionTree.js";
import { evaluateFormulaExpression } from "./logicEngine/formulaParser.js";
import { isEmpty } from "./logicEngine/helpers.js";

// Re-export normalizer in case it's needed externally
export { normalizeLogicPayload } from "./logicEngine/normalizer.js";
export { evaluateConditionTree } from "./logicEngine/conditionTree.js";
export { evaluateFormulaExpression } from "./logicEngine/formulaParser.js";

function flattenSubmissionPages(pages = []) {
    const values = {};
    for (const page of pages) {
        for (const response of page?.responses || []) {
            values[response.componentId] = response.response;
        }
    }
    return values;
}

function buildComponentMap(version) {
    const componentIds = [];
    const componentMap = {};
    const pageByComponent = {};

    for (const page of version?.pages || []) {
        for (const component of page?.components || []) {
            if (!component?.componentId) continue;
            componentIds.push(component.componentId);
            componentMap[component.componentId] = component;
            pageByComponent[component.componentId] = {
                pageId: page.pageId,
                pageNo: page.pageNo,
            };
        }
    }

    return { componentIds, componentMap, pageByComponent };
}

function buildSubmissionPagesFromValues(version, values, visibility, enabled) {
    const pages = [];

    for (const page of version?.pages || []) {
        const responses = [];
        for (const component of page?.components || []) {
            const componentId = component?.componentId;
            if (!componentId) continue;
            if (component.componentType === "heading") continue;
            if (visibility[componentId] === false || enabled[componentId] === false) {
                continue;
            }
            if (!(componentId in values)) continue;
            responses.push({
                componentId,
                response: values[componentId],
            });
        }
        pages.push({
            pageNo: page.pageNo,
            responses,
        });
    }

    return pages;
}

function collectRequiredViolations(version, values, visibility, enabled) {
    const violations = [];
    for (const page of version?.pages || []) {
        for (const component of page?.components || []) {
            if (!component?.componentId) continue;
            if (component.componentType === "heading") continue;

            const componentId = component.componentId;
            if (visibility[componentId] === false || enabled[componentId] === false) {
                continue;
            }

            const isRequired =
                component.required === true ||
                component.validation?.required === true;
            if (!isRequired) continue;

            if (isEmpty(values[componentId])) {
                violations.push({
                    ruleId: "required",
                    targetId: componentId,
                    message: `${component.label || componentId} is required`,
                    stage: "submit",
                });
            }
        }
    }
    return violations;
}

export function evaluateFormLogicRuntime({
    version,
    pages = [],
    stage = "submit",
}) {
    const logic = normalizeLogicPayload(version?.logic || {});
    const values = flattenSubmissionPages(pages);
    const { componentIds } = buildComponentMap(version);

    const visibility = {};
    const enabled = {};
    for (const id of componentIds) {
        visibility[id] = true;
        enabled[id] = true;
    }

    const computedValues = {};
    const violations = [];
    const engineErrors = [];
    let nextPageId = null;

    // 1) Formula pass
    for (const formula of logic.formulas) {
        if (!formula.enabled || !formula.targetId || !formula.expression) continue;
        try {
            const result = evaluateFormulaExpression(formula.expression, values);
            values[formula.targetId] = result;
            computedValues[formula.targetId] = result;
        } catch (err) {
            engineErrors.push({
                ruleId: formula.ruleId,
                targetId: formula.targetId,
                message: err.message || "Failed to evaluate formula",
                stage,
            });
        }
    }

    // 2) Non-validation rules
    for (const rule of logic.rules) {
        if (!rule.enabled) continue;
        if (rule.ruleType === "validation") continue;

        let conditionPassed = false;
        try {
            conditionPassed = evaluateConditionTree(rule.condition, values);
        } catch (err) {
            engineErrors.push({
                ruleId: rule.ruleId,
                targetId: "",
                message: err.message || "Failed to evaluate rule condition",
                stage,
            });
            continue;
        }

        const actions = conditionPassed ? rule.thenActions : rule.elseActions;
        for (const action of actions) {
            if (!action?.targetId) continue;
            switch (action.type) {
                case "SHOW":
                    visibility[action.targetId] = true;
                    break;
                case "HIDE":
                    visibility[action.targetId] = false;
                    break;
                case "ENABLE":
                    enabled[action.targetId] = true;
                    break;
                case "DISABLE":
                    enabled[action.targetId] = false;
                    break;
                case "SET_VALUE":
                    values[action.targetId] = action.value;
                    computedValues[action.targetId] = action.value;
                    break;
                case "SKIP_PAGE":
                    if (
                        !nextPageId &&
                        rule.ruleType === "navigation" &&
                        conditionPassed
                    ) {
                        nextPageId = action.targetId;
                    }
                    break;
                default:
                    break;
            }
        }
    }

    // 3) Validation rules
    for (const rule of logic.rules) {
        if (!rule.enabled || rule.ruleType !== "validation") continue;

        let conditionPassed = false;
        try {
            conditionPassed = evaluateConditionTree(rule.condition, values);
        } catch (err) {
            engineErrors.push({
                ruleId: rule.ruleId,
                targetId: "",
                message: err.message || "Failed to evaluate validation rule",
                stage,
            });
            continue;
        }

        if (!conditionPassed) continue;
        const actions = rule.thenActions || [];
        if (actions.length === 0) {
            violations.push({
                ruleId: rule.ruleId,
                targetId: "",
                message: "Validation rule failed",
                stage,
            });
            continue;
        }

        for (const action of actions) {
            violations.push({
                ruleId: rule.ruleId,
                targetId: action?.targetId || "",
                message:
                    typeof action?.value === "string" && action.value.trim()
                        ? action.value
                        : "Validation rule failed",
                stage,
            });
        }
    }

    // 4) Required-field checks after visibility/enablement resolution
    violations.push(...collectRequiredViolations(version, values, visibility, enabled));

    // 5) Strip hidden/disabled values
    for (const id of componentIds) {
        if (visibility[id] === false || enabled[id] === false) {
            delete values[id];
        }
    }

    return {
        values,
        pages: buildSubmissionPagesFromValues(version, values, visibility, enabled),
        visibility,
        enabled,
        computedValues,
        nextPageId,
        violations,
        errors: engineErrors,
    };
}
