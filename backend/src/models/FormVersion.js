import mongoose from "mongoose";

const { Schema } = mongoose;

/* ──────────────── COMPONENT ──────────────── */

const ComponentSchema = new Schema(
    {
        componentId: {
            type: String,
            required: true,
        },

        componentType: {
            type: String,
            required: true,
            enum: [
                // ── Text / Input ──
                "single-line-text",
                "multi-line-text",
                "email",
                "phone",
                "number",
                "decimal",
                "url",

                // ── Date / Time ──
                "date",
                "time",

                // ── Selection ──
                "dropdown",
                "radio",
                "checkbox",
                "single-choice-grid",
                "multi-choice-grid",
                "matrix-table",

                // ── Scale / Rating ──
                "rating",
                "linear-scale",
                "slider",

                // ── File / Media ──
                "file-upload",
                "image-upload",

                // ── Composite / Blocks ──
                "address-block",
                "name-block",

                // ── Special ──
                "color-picker",
                "signature",
                "captcha",
                "payment",

                // ── Layout ──
                "section-divider",
                "page-break",

                // ── Extensibility ──
                "custom",
            ],
        },

        // Only used when componentType === "custom"
        customKey: {
            type: String,
        },

        label: {
            type: String,
            default: "",
        },

        description: {
            type: String,
            default: "",
        },

        required: {
            type: Boolean,
            default: false,
        },

        // Aligns with frontend's ComponentMetadata.group
        group: {
            type: String,
            enum: ["layout", "input", "selection"],
            default: "input",
        },

        // Component-specific configuration (varies by type)
        // See implementation_plan.md for per-type props documentation
        props: {
            type: Schema.Types.Mixed,
            default: {},
        },

        // Component-specific validation rules (varies by type)
        // See implementation_plan.md for per-type validation documentation
        validation: {
            type: Schema.Types.Mixed,
            default: {},
        },

        // Quiz-mode scoring
        scoring: {
            points: {
                type: Number,
                default: 0,
            },
            correctAnswer: {
                type: Schema.Types.Mixed,
            },
            isAutoGraded: {
                type: Boolean,
                default: false,
            },
        },

        // Display order within the page
        order: {
            type: Number,
            default: 0,
        },
    },
    { _id: false }
);

/* ──────────────── PAGE ──────────────── */

const PageSchema = new Schema(
    {
        pageId: {
            type: String,
            required: true,
        },

        pageNo: {
            type: Number,
            required: true,
        },

        title: {
            type: String,
            trim: true,
            default: "",
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        components: {
            type: [ComponentSchema],
            default: [],
        },
    },
    { _id: false }
);

/* ──────────────── LOGIC RULES ──────────────── */

const LogicRuleSchema = new Schema(
    {
        ruleId: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            enum: ["visibility", "skip", "calculation", "require"],
        },

        // Which component or page is affected
        target: {
            type: String,
            required: true,
        },

        condition: {
            field: String,
            operator: {
                type: String,
                enum: [
                    "equals",
                    "not_equals",
                    "contains",
                    "not_contains",
                    "greater_than",
                    "less_than",
                    "is_empty",
                    "is_not_empty",
                ],
            },
            value: Schema.Types.Mixed,
        },

        // For "calculation" type
        action: {
            type: Schema.Types.Mixed,
        },
    },
    { _id: false }
);

/* ──────────────── WORKFLOW ──────────────── */

const TransitionSchema = new Schema(
    {
        from: String,
        to: String,
        role: String,
        condition: String,
    },
    { _id: false }
);

const WorkflowSchema = new Schema(
    {
        enabled: {
            type: Boolean,
            default: false,
        },

        states: [String],

        transitions: [TransitionSchema],
    },
    { _id: false }
);

/* ──────────────── ACCESS CONTROL ──────────────── */

const AccessSchema = new Schema(
    {
        visibility: {
            type: String,
            enum: ["public", "private", "link-only"],
            default: "private",
        },

        editors: [String],

        viewers: [String],

        roles: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    { _id: false }
);

/* ──────────────── SETTINGS ──────────────── */

const SettingsSchema = new Schema(
    {
        allowMultipleSubmissions: {
            type: Boolean,
            default: false,
        },

        requireLogin: {
            type: Boolean,
            default: false,
        },

        collectEmail: {
            type: Boolean,
            default: false,
        },

        saveDraft: {
            type: Boolean,
            default: false,
        },

        showProgressBar: {
            type: Boolean,
            default: false,
        },

        submissionLimit: {
            type: Number,
        },

        closeDate: {
            type: Date,
        },

        confirmationMessage: {
            type: String,
            default: "Thank you for your response!",
        },

        notifyOnSubmission: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

/* ──────────────── THEME ──────────────── */

const ThemeSchema = new Schema(
    {
        themeId: {
            type: String,
            required: true,
        },

        primaryColor: {
            type: String,
        },

        backgroundColor: {
            type: String,
        },

        fontFamily: {
            type: String,
        },
    },
    { _id: false }
);

/* ──────────────── META ──────────────── */

const MetaSchema = new Schema(
    {
        createdBy: {
            type: String,
            required: true,
        },

        name: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            default: "",
        },

        theme: {
            type: ThemeSchema,
        },

        isDraft: {
            type: Boolean,
            default: true,
        },

        isMultiPage: {
            type: Boolean,
            default: false,
        },

        isQuiz: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

/* ──────────────── VERSION HISTORY ──────────────── */

const VersionHistorySchema = new Schema(
    {
        version: Number,

        createdBy: String,

        createdAt: {
            type: Date,
            default: Date.now,
        },

        message: String,
    },
    { _id: false }
);

/* ════════════════ FORM VERSION (root) ════════════════ */

const FormVersionSchema = new Schema(
    {
        formId: {
            type: String,
            required: true,
        },

        version: {
            type: Number,
            default: 1,
        },

        versionHistory: [VersionHistorySchema],

        meta: {
            type: MetaSchema,
            required: true,
        },

        settings: {
            type: SettingsSchema,
            required: true,
        },

        pages: [PageSchema],

        logic: {
            rules: [LogicRuleSchema],
        },

        workflow: {
            type: WorkflowSchema,
        },

        access: {
            type: AccessSchema,
        },
    },
    { timestamps: true }
);

// Compound index: one unique version per form
FormVersionSchema.index({ formId: 1, version: -1 }, { unique: true });

export default mongoose.model("FormVersion", FormVersionSchema);
