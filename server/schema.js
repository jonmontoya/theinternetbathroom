module.exports =  {
	handshakeSchema: {
		id: '/Handshake',
		type: 'object',
		properties: {
			location: {type: 'string'}
		},
		required: ['location']
	},

	pixelSchema: {
		id: '/Pixel',
		type: 'object',
		properties: {
			color: {
				type: 'string'
			},
			pixel: {
				type: 'array',
				minItems: 2,
				maxItems: 2,
				items: {type: 'number'},
			}
		},
		required: ['color', 'pixel']
	}
};
