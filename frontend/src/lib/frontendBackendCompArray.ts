import { ComponentIDs } from '@/form/components/base';

export const frontendToBackend: Record<string, string> = {
  [ComponentIDs.Header]: 'heading',
  [ComponentIDs.TextBox]: 'text-box',
  [ComponentIDs.SingleLineInput]: 'single-line-input',
  [ComponentIDs.Radio]: 'radio',
  [ComponentIDs.Checkbox]: 'checkbox',
  [ComponentIDs.Dropdown]: 'dropdown',
  [ComponentIDs.MultiLineInput]: 'multi-line-input',
  [ComponentIDs.Email]: 'email',
  [ComponentIDs.Phone]: 'phone',
  [ComponentIDs.Number]: 'number',
  [ComponentIDs.Decimal]: 'decimal',
  [ComponentIDs.URL]: 'url',
  [ComponentIDs.Date]: 'date',
  [ComponentIDs.Time]: 'time',
  [ComponentIDs.FileUpload]: 'file-upload',
  [ComponentIDs.ImageUpload]: 'image-upload',
  [ComponentIDs.SingleChoiceGrid]: 'single-choice-grid',
  [ComponentIDs.MultiChoiceGrid]: 'multi-choice-grid',
  [ComponentIDs.MatrixTable]: 'matrix-table',
  [ComponentIDs.RatingScale]: 'rating',
  [ComponentIDs.LinearScale]: 'linear-scale',
  [ComponentIDs.Slider]: 'slider',
  [ComponentIDs.AddressBlock]: 'address-block',
  [ComponentIDs.NameBlock]: 'name-block',
  [ComponentIDs.ColorPicker]: 'color-picker',
  [ComponentIDs.Signature]: 'signature',
  // [ComponentIDs.Payment]: 'payment',
  [ComponentIDs.Captcha]: 'captcha',
  // [ComponentIDs.SectionDivider]: 'section-divider',
  [ComponentIDs.LineDivider]: 'page-break',
  [ComponentIDs.ColumnLayout]: 'custom',
};

export const backendToFrontend: Record<string, string> = {};
for (const [fe, be] of Object.entries(frontendToBackend)) {
  if (!backendToFrontend[be]) backendToFrontend[be] = fe;
}
