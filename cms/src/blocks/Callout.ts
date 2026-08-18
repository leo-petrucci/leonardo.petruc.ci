import type { Block } from 'payload'

export const Callout: Block = {
  slug: 'callout',
  fields: [
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'info',
      options: ['info', 'success', 'warning'],
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
  ],
}
