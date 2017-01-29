module.exports = {
  pixelSchema: {
    id: '/PixelData',
    type: 'array',
    properties: {
      color: {
        type: 'string',
      },
      pixels: {
        type: 'array',
        minItems: 1,
        maxItems: 1000,
        items: {
          type: 'array',
          minItems: 3,
          maxItems: 3,
          items: [{ type: 'number' }, { type: 'number' }, { type: 'array' }],
        },
      },
      required: ['color', 'stroke'],
    },
  },
};
