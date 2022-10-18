const { Schema, model } = require('mongoose')

const bannedSchema = new Schema({
	userId: {
		type: String,
		required: true,
	},
	term: {
		type: Number,
		default: false,
	},
	roleId: {
		type: String,
		default: false,
	},
	count: {
		type: Number,
		default: 0,
	},
	reported: Boolean,
})

module.exports = model('BannedUser', bannedSchema)
