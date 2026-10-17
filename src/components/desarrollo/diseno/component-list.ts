// The components documented on /desarrollo/diseno, in order. Kept outside the client gallery so the
// server page can build its table of contents from it.
export const documentedComponents = [
  { id: 'button', name: 'Button' },
  { id: 'search-bar', name: 'SearchBar' },
  { id: 'campos', name: 'Input, Textarea y Select' },
  { id: 'form-field', name: 'Campo de formulario' },
  { id: 'checkbox', name: 'Checkbox' },
  { id: 'segmentado', name: 'Control segmentado' },
  { id: 'tabs', name: 'Tabs HUD' },
  { id: 'mark-toggle', name: 'MarkToggle' },
  { id: 'badge', name: 'Badge' },
  { id: 'page-title', name: 'PageTitle' },
  { id: 'ruled-grid', name: 'RuledGrid' },
  { id: 'event-row', name: 'EventRow' },
  { id: 'menu', name: 'Menús y selects' },
  { id: 'dialog', name: 'Dialog' },
  { id: 'toast', name: 'Toasts' },
] as const;

export type DocumentedComponentId = (typeof documentedComponents)[number]['id'];
