export type ContactFieldType = 'text' | 'email' | 'tel' | 'select' | 'textarea';

export interface ContactFieldOption {
  value: string;
  label: string;
}

export interface ContactField {
  name: string;
  label: string;
  type: ContactFieldType;
  required?: boolean;
  placeholder?: string;
  autocomplete?: string;
  minlength?: number;
  /** When true, the field spans both columns of the responsive grid. */
  fullWidth?: boolean;
  /** Number of rows for a textarea field. */
  rows?: number;
  /** Options for a select field. */
  options?: ContactFieldOption[];
}

/**
 * Fields rendered by the contact form. Add a new entry here and it will be
 * rendered and captured by Netlify automatically.
 */
export const contactFields: ContactField[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    autocomplete: 'name',
    placeholder: 'Jane Doe',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    autocomplete: 'email',
    placeholder: 'jane@example.com',
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'tel',
    required: false,
    autocomplete: 'tel',
    placeholder: '(555) 555-5555',
  },
  {
    name: 'company',
    label: 'Company',
    type: 'text',
    required: false,
    autocomplete: 'organization',
    placeholder: 'Company name',
  },
  {
    name: 'service',
    label: 'How can we help?',
    type: 'select',
    required: true,
    fullWidth: true,
    options: [
      { value: '', label: 'Select an option' },
      { value: 'General Inquiry', label: 'General Inquiry' },
      { value: 'Construction Management', label: 'Construction Management' },
      { value: 'Real Estate Development', label: 'Real Estate Development' },
      { value: "Owner's Representation", label: "Owner's Representation" },
      { value: 'Remediation / Environmental', label: 'Remediation / Environmental' },
      { value: 'Other', label: 'Other' },
    ],
  },
  {
    name: 'subject',
    label: 'Subject',
    type: 'text',
    required: true,
    fullWidth: true,
    placeholder: 'What is this regarding?',
  },
  {
    name: 'message',
    label: 'Message',
    type: 'textarea',
    required: true,
    fullWidth: true,
    minlength: 10,
    rows: 6,
    placeholder: 'Tell us a little about your project or question…',
  },
];
