export const CHECKLIST = [
  { key: 'brand_id',      label: 'Brand',           check: c => !!(c.brand_id || c.brand_name) },
  { key: 'platform',      label: 'Platform',         check: c => !!c.platform },
  { key: 'promote',       label: 'Product/Collection', check: c => !!(c.collection || c.product_name) },
  { key: 'audience_name', label: 'Audience',         check: c => !!c.audience_name },
  { key: 'copy',          label: 'Copy',             check: c => c.copy?.trim().length > 10 },
  { key: 'image_data',    label: 'Creative',         check: c => !!c.image_data },
  { key: 'date',          label: 'Date',             check: c => !!c.date },
]
