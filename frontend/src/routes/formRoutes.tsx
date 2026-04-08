import FormEditor from "../pages/FormEditor/FormEditor";
import FormPreview from "../pages/FormFill/FormPreview";
import FormReview from "../pages/FormReview/FormReview";

export const formRoutes = [
  {
    path: "form-builder/:formId",
    element: <FormEditor />,
  },
  {
    path: "forms/:formId/preview",
    element: <FormPreview />,
  },
  {
    path: "reviews/:formId",
    element: <FormReview />,
  },
];