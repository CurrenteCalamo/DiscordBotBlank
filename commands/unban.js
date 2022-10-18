const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const Banned = require('../models/Banned')

module.exports = {
	data: new SlashCommandBuilder().setName('unban').setDescription('Разбанить '),
	async execute(interaction) {
		const users = await Banned.find({ term: { $lte: Date.now() } })
		await Banned.update(
			{ term: { $lte: Date.now() } },
			{ $unset: { term: 1 } },
			{ multi: true },
		)
		users.forEach(async (element) => {
			const member = await interaction.guild.members.cache.get(element.userId)
			const roleToRemove = await interaction.guild.roles.cache.get(
				element.roleId,
			)
			await member.roles.remove(roleToRemove)

			const Embed = new MessageEmbed()
				.setTitle(
					`${roleToRemove.name} на серевере ${roleToRemove.guild.name} был снят!`,
				)
				.setDescription(
					`<@${member.user.id}>, **Постарайтесь** больше не **нарушать** правил **сообщества!**`,
				)
				.setThumbnail(`${member.displayAvatarURL({ dynamic: true })}`)

			member.send({ embeds: [Embed] })

			await interaction.guild.channels.cache
				.get('1018258553103978516')
				.send({ embeds: [Embed] })
		})

		return await interaction.reply({
			content: `<@${interaction.user.id}>, **Было** разбанено **${users.length}** пользователей!`,
			ephemeral: true,
		})
	},
}
