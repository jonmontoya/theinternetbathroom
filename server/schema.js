module.exports =  {
	handshakeSchema: {
		id: '/Handshake',
		type: 'object',
		properties: {
			location: {type: 'string'}
		},
		required: ['location']
	},

	strokeSchema: {
		id: '/Stroke',
		type: 'object',
		properties: {
			color: {
				type: 'string'
			},
			stroke: {
				type: 'array',
				minItems: 2,
				maxItems: 2,
				items: {
					type: 'array',
					minItems: 2,
					maxItems: 2,
					items: {type: 'number'}
				}
			}
		},
		required: ['color', 'stroke']
	}
};
