const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('signin')
		.setDescription('Регистрация пользователя')
		.addUserOption((option) =>
			option.setName('target').setDescription('Пользователь'),
		)
		.addRoleOption((option) =>
			option.setName('role').setDescription('Выберите роль'),
		),
	async execute(interaction) {
		const user = interaction.options.getUser('target')
		const role = interaction.options.getRole('role')

		const occupied = [
			'1012795708853714954',
			'1012795622052614264',
			'969992579892531232',
		]

		if (!(user && occupied.find((i) => i == role.id))) {
			return await interaction.reply({
				content: `<@${interaction.user.id}>, **Что-то** пошло **не** так!`,
				ephemeral: true,
			})
		}
		const member = await interaction.guild.members.cache.get(user.id)
		if (!member._roles.find((i) => i == '969992579892531231')) {
			return await interaction.reply({
				content: `<@${interaction.user.id}>, **Что-то** пошло **не** так!`,
				ephemeral: true,
			})
		}
		const roleToRemove = await interaction.guild.roles.cache.get(
			'969992579892531231',
		)
		const roleToGive = await interaction.guild.roles.cache.get(role.id)

		await member.roles.add(roleToGive)
		await member.roles.remove(roleToRemove)

		const Embed = new MessageEmbed()
			.setTitle(`Пользователь ${user.username}`)
			.addFields(
				{
					name: 'Модератор:',
					value: `<@${interaction.member.id}>`,
					inline: true,
				},
				{
					name: 'Пользователь:',
					value: `<@${user.id}>`,
					inline: true,
				},
				{
					name: 'Роль:',
					value: `<@&${role.id}>`,
					inline: true,
				},
			)
			.setThumbnail(`${user.displayAvatarURL({ dynamic: false })}`)

		await interaction.guild.channels.cache
			.get('1012367311610581135')
			.send({ embeds: [Embed] })

		return await interaction.reply({
			content: `<@${interaction.user.id}>, **Вы** выдали **роль** <@&${role.id}> **пользователю** <@${user.id}>`,
			ephemeral: true,
		})
	},
}
