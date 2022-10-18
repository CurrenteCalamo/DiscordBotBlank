const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const Banned = require('../models/Banned')

function getTimeStr(time) {
	let days = Math.floor((time / (1000 * 60 * 60 * 24)) % 30)
	let hours = Math.floor((time / (1000 * 60 * 60)) % 24)
	let minutes = Math.floor((time / (1000 * 60)) % 60)

	if (hours == 0) return `${minutes} минут`
	if (days == 0) return ` ${hours} часов, ${minutes} минут`
	else return `${days} дней, ${hours} часов, ${minutes} минут`
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Заблокировать пользователя')
		.addUserOption((option) =>
			option
				.setName('target')
				.setDescription('Пользователь, которого нужно заблокировать'),
		)
		.addIntegerOption((option) =>
			option
				.setMinValue(30)
				.setName('amount')
				.setDescription('Длительность в минутах'),
		)
		.addStringOption((option) =>
			option.setName('message').setDescription('Комментарий'),
		)
		.addStringOption((option) =>
			option.setName('cause').setDescription('Причина'),
		)
		.addRoleOption((option) =>
			option.setName('role').setDescription('Выберите роль'),
		),
	async execute(interaction) {
		const message = interaction.options.getString('message')
		const cause = interaction.options.getString('cause')
		const user = interaction.options.getUser('target')
		const role = interaction.options.getRole('role')
		const amount = interaction.options.getInteger('amount')

		if (message && cause && user && role && amount) {
			let tmpUser = await Banned.findOne({ userId: user.id })
			if (!tmpUser) {
				tmpUser = await Banned.create({
					userId: user.id,
					term: Date.now() + amount * 60 * 1000,
					roleId: role.id,
					count: 1,
				})
			} else {
				tmpUser.term = Date.now() + amount * 60 * 1000
				tmpUser.count += 1
				tmpUser.roleId = role.id
				tmpUser.save()
			}

			const member = await interaction.guild.members.cache.get(user.id)
			const roleToGive = await interaction.guild.roles.cache.get(role.id)
			console.log(roleToGive.members.map((m) => m.user.id).length)
			await member.roles.add(roleToGive)

			const Embed = new MessageEmbed()
				.setTitle(
					`${user.username} вам был выдан ${role.name} на серевере ${role.guild.name}`,
				)
				.setThumbnail(`${user.displayAvatarURL({ dynamic: true })}`)
				.setDescription(`**Комментарий** <@${interaction.user.id}> ` + message)
				.addFields(
					{
						name: 'Причина:',
						value: `\`\`\`${cause}\`\`\``,
						inline: true,
					},
					{
						name: 'Длительность:',
						value: `\`\`\`${getTimeStr(amount * 60 * 1000)}\`\`\``,
						inline: true,
					},
					{
						name: 'Предупреждений',
						value: `\`\`\`- ${tmpUser.count}-е\`\`\``,
						inline: true,
					},
				)
			member.send({ embeds: [Embed] })
			await interaction.guild.channels.cache
				.get('1018258620565172314')
				.send({ embeds: [Embed] })

			return await interaction.reply({
				content: `<@${interaction.user.id}>, **Выдан** ${
					role.name
				} **пользователю** <@${user.id}> **на** ${getTimeStr(
					amount * 60 * 1000,
				)}`,
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
