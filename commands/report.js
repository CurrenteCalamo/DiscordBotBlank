const { SlashCommandBuilder } = require('@discordjs/builders')
const User = require('../models/User')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('report')
		.setDescription('Жалоба на участника сервера')
		.addUserOption((option) =>
			option.setName('target').setDescription('Пользователь').setRequired(true),
		)
		.addStringOption((option) =>
			option.setName('message').setDescription('Комментарий').setRequired(true),
		)
		.addAttachmentOption((option) =>
			option.setName('attachment').setDescription('Best meme?'),
		),
	async execute(interaction) {
		const user = interaction.options.getUser('target')
		const message = interaction.options.getString('message')
		const attachment = interaction.options.getAttachment('attachment')

		if (user && message) {
			const content =
				`<@${interaction.member.id}>, Oтправил **жалобу** на **пользователя** <@${user.id}> ` +
				message
			await interaction.guild.channels.cache
				.get('1008015439756001390')
				.send({ content, files: [attachment.url] })

			await interaction.member.send({
				content:
					'Тут вы **можете** написать **развернутый** комментарий. **Пожалуйста**, предоставьте как можно **больше** подробностей, в идеале видео или скриншот сообщения, о котором вы сообщаете.',
				ephemeral: true,
			})
			let user = await User.findOne({ userId: interaction.user.id })
			if (!user) {
				await interaction.member.send({
					content:
						'Тут вы **можете** написать **развернутый** комментарий. **Пожалуйста**, предоставьте как можно **больше** подробностей, в идеале видео или скриншот сообщения, о котором вы сообщаете.',
					ephemeral: true,
				})
				user = await User.create({ userId: interaction.user.id })
			}
			return await interaction.reply({
				content: `<@${interaction.user.id}>, **Жалоба** на пользователя <@${user.id}> **отправлена!**`,
				ephemeral: true,
			})
		} else {
			return await interaction.reply({
				content: `<@${interaction.user.id}>, **Пожалуйста** заполните все **поля!**`,
				ephemeral: true,
			})
		}
	},
}
