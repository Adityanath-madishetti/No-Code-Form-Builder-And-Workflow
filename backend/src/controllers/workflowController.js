import {
    setWorkflowService,
    getWorkflowService,
    transitionSubmissionService,
    listAvailableTransitionsService,
} from "../services/workflowService.js";

export const setWorkflow = async (req, res, next) => {
    try {
        const workflow = await setWorkflowService(req.params.formId, req.body, req.user);
        const isDisabling = req.body.enabled === false;
        res.status(200).json({
            message: isDisabling ? "Workflow disabled" : "Workflow saved",
            workflow,
        });
    } catch (err) {
        next(err);
    }
};

export const getWorkflow = async (req, res, next) => {
    try {
        const workflow = await getWorkflowService(req.params.formId, req.user);
        res.status(200).json({ workflow });
    } catch (err) {
        next(err);
    }
};

export const transitionSubmission = async (req, res, next) => {
    try {
        const { formId, submissionId } = req.params;
        const { transitionId, role } = req.body;
        
        const result = await transitionSubmissionService(
            formId, 
            submissionId, 
            transitionId, 
            role, 
            req.user
        );

        res.status(200).json({
            message: `Transitioned to "${result.currentState}"`,
            submission: result,
        });
    } catch (err) {
        next(err);
    }
};

export const listAvailableTransitions = async (req, res, next) => {
    try {
        const { formId, submissionId } = req.params;
        const result = await listAvailableTransitionsService(
            formId,
            submissionId,
            req.query.role,
            req.user
        );

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};
