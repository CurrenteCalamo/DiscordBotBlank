const { token, db } = require('./config.json')
const fs = require('fs')
const {
	Client,
	Collection,
	Intents,
	MessageActionRow,
	MessageEmbed,
	Modal,
	TextInputComponent,
	MessageButton,
} = require('discord.js')
const mongoose = require('mongoose')
const { getPrivateRoom } = require('./components')
const User = require('./models/User')
const Guild = require('./models/Guild')

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MESSAGE_TYPING,
		Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGE_TYPING,
	],
	partials: ['CHANNEL'],
})

const connectDB = async () => {
	try {
		mongoose.connect(db, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		console.log('MongoDB connected!')
	} catch (error) {
		console.log(error.message)
		process.exit(1)
	}
}
connectDB()

async function setGuild() {
	await Guild.create({ guildId: '969992579468914751' })
	await Guild.updateOne(
		{ guildId: '969992579468914751' },
		{
			$set: {
				'private_voices.mode': true,
				'private_voices.categoryId': '972491122981077012',
				'private_voices.channelId': '1018630527198167061',
				'private_voices.textId': '1018584919603171348',
			},
		},
	)
	console.log(await Guild.find())
}
// setGuild()

client.commands = new Collection()
const commandFiles = fs
	.readdirSync('./commands')
	.filter((file) => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.data.name, command)
}

client.on('interactionCreate', async (interaction) => {
	if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName)

		if (!command) return

		try {
			await command.execute(interaction, client)
		} catch (error) {
			console.error(error)
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			})
		}
		return
	}
	if (interaction.isButton()) {
		if (interaction.customId === 'detete') return
		let data = await Guild.findOne({ guildId: interaction.guild.id })
		let user_olddata = await User.findOne({ userId: interaction.user.id })
		if (!user_olddata) {
			await User.create({ userId: interaction.user.id })
		}
		let user_data = await User.findOne({ userId: interaction.user.id })
		if (data?.private_voices?.mode === true) {
			if (
				interaction.member?.voice.channel &&
				interaction.channel.id === data?.private_voices?.textId &&
				interaction.channel.id === data.private_voices.textId &&
				interaction.member?.voice.channel.id ===
					user_data?.private_voices?.voiceId &&
				interaction.member.voice.channel.id === user_data.private_voices.voiceId
			) {
				if (interaction.customId === 'rename') {
					const modal = new Modal()
						.setCustomId('myModal')
						.setTitle('Изменение названия канала')
					const Input = new TextInputComponent()
						.setCustomId('Input')
						.setPlaceholder('Слушаем музыку')
						.setLabel('Введите новое название')
						.setStyle('SHORT')
						.setMinLength(1)
						.setMaxLength(24)
					firstActionRow = new MessageActionRow().addComponents(Input)
					modal.addComponents(firstActionRow)
					await interaction.showModal(modal)
				}
				if (interaction.customId === 'lock') {
					let user_data = await User.findOne({ userId: interaction.user.id })
					if (user_data?.private_voices?.lock === false) {
						let textId = await client.channels.fetch(
							data?.private_voices?.textId,
						)
						await User.updateOne(
							{ userId: interaction.user.id },
							{
								$set: {
									'private_voices.lock': true,
								},
							},
						)
						await interaction
							.reply({
								embeds: [new MessageEmbed().setDescription(`🔓 Канал открыт`)],
								ephemeral: true,
							})
							.catch(() => null)
						await interaction.member.voice.channel
							.edit({
								parent: data?.private_voices?.categoryId,
								permissionOverwrites: [
									{
										id: interaction.guild.roles.everyone,
										allow: ['CONNECT'],
									},
								],
							})
							.catch(() => null)
					} else if (user_data?.private_voices?.lock === true) {
						await User.updateOne(
							{ userId: interaction.user.id },
							{
								$set: {
									'private_voices.lock': false,
								},
							},
						)
						await interaction
							.reply({
								embeds: [new MessageEmbed().setDescription(`🔒 Канал закрыт`)],
								ephemeral: true,
							})
							.catch(() => null)
						await interaction.member.voice.channel
							.edit({
								parent: data?.private_voices?.categoryId,
								permissionOverwrites: [
									{
										id: interaction.guild.roles.everyone,
										deny: ['CONNECT'],
									},
								],
							})
							.catch(() => null)
					}
				}
				if (interaction.customId === 'bit') {
					const modal = new Modal()
						.setCustomId('bit')
						.setTitle('Изменение битрейта канала')
					const Input = new TextInputComponent()
						.setCustomId('InputBit')
						.setPlaceholder('8 - 96 kbps')
						.setLabel('Введите новый битрейт')
						.setStyle('SHORT')
						.setMinLength(1)
						.setMaxLength(2)
					firstActionRow = new MessageActionRow().addComponents(Input)
					modal.addComponents(firstActionRow)
					await interaction.showModal(modal)
				}
				if (interaction.customId === 'limit') {
					const modal = new Modal()
						.setCustomId('limit')
						.setTitle('Изменение лимита пользователей')
					const Input = new TextInputComponent()
						.setCustomId('InputLimit')
						.setPlaceholder('0 - 99')
						.setLabel('Введите новый лимит пользователей')
						.setStyle('SHORT')
						.setMinLength(1)
						.setMaxLength(2)
					firstActionRow = new MessageActionRow().addComponents(Input)
					modal.addComponents(firstActionRow)
					await interaction.showModal(modal)
				}
				if (interaction.customId === 'kick') {
					const modal = new Modal()
						.setCustomId('kick')
						.setTitle('Изменение лимита пользователей')
					const Input = new TextInputComponent()
						.setCustomId('InputKick')
						.setPlaceholder('ID-пользователя')
						.setLabel('Введите ID-пользователя')
						.setStyle('SHORT')
						.setMinLength(1)
						.setMaxLength(20)
					firstActionRow = new MessageActionRow().addComponents(Input)
					modal.addComponents(firstActionRow)
					await interaction.showModal(modal)
				}
			} else {
				if (interaction.customId === 'delete') return
				await interaction.deferUpdate().catch(() => null)
				return await interaction.followUp({
					content: `У вас нет приватного канала.`,
					ephemeral: true,
				})
			}
		}
	}
	if (interaction.isModalSubmit()) {
		if (interaction.customId === 'myModal') {
			const input = interaction.fields.getTextInputValue('Input')
			interaction.reply({
				embeds: [
					new MessageEmbed().setDescription(`Новое имя канала \`${input}\``),
				],
				ephemeral: true,
			})
			await interaction.member.voice.channel.setName(input).catch(() => null)
		}
		if (interaction.customId === 'bit') {
			let input = interaction.fields.getTextInputValue('InputBit')
			if (isNaN(input))
				return interaction.reply({
					embeds: [
						new MessageEmbed().setDescription(`Вы ввели некорректное число.`),
					],
					ephemeral: true,
				})
			if (input > 96) input = 96
			if (input < 8) input = 8
			interaction.reply({
				embeds: [
					new MessageEmbed().setDescription(
						`Установлен новый битрейт \`${input}\``,
					),
				],
				ephemeral: true,
			})
			await interaction.member.voice.channel
				.setBitrate(input + `_000`)
				.catch(() => null)
		}
		if (interaction.customId === 'limit') {
			let input = interaction.fields.getTextInputValue('InputLimit')
			if (isNaN(input))
				return interaction.reply({
					embeds: [
						new MessageEmbed().setDescription(`Вы ввели некорректное число.`),
					],
					ephemeral: true,
				})
			interaction.reply({
				embeds: [
					new MessageEmbed().setDescription(
						`Лимит пользователей установлен \`${input}\``,
					),
				],
				ephemeral: true,
			})
			await interaction.member.voice.channel
				.setUserLimit(input)
				.catch(() => null)
		}
		if (interaction.customId === 'kick') {
			let user_data = await User.findOne({ userId: interaction.user.id })
			let input = interaction.fields.getTextInputValue('InputKick')
			interaction.guild.members.fetch(input).then(
				(x) => {
					if (x.voice.channel.id !== user_data.private_voices.voiceId)
						return interaction.reply({
							embeds: [
								new MessageEmbed().setDescription(
									`Указанный участник не находится в голосовом канале.`,
								),
							],
							ephemeral: true,
						})
					interaction.reply({
						embeds: [
							new MessageEmbed().setDescription(
								`**${x.user.tag}**, выгнан с голосового канала.`,
							),
						],
						ephemeral: true,
					})
					x.voice.disconnect()
				},
				(y) => {
					interaction.reply({
						embeds: [
							new MessageEmbed().setDescription(`Вы ввели некорректный ID.`),
						],
						ephemeral: true,
					})
				},
			)
			await interaction.member.voice.channel
				.setUserLimit(input)
				.catch(() => null)
		}
	}
	if (!interaction.isCommand()) return
	if (!interaction.guild) return

	const cmd = client.commands.get(interaction.commandName)
	if (!cmd) return

	interaction.guild.owner = await interaction.guild.fetchOwner()
	interaction.default = async (message, foo) =>
		await interaction.reply({
			embeds: [
				new MessageEmbed({
					description: message,
				}),
			],
			ephemeral: foo,
		})

	if (cmd.permissions && !Config.developers.includes(interaction.user.id)) {
		let invalidPerms = []
		for (const perm of cmd.permissions) {
			if (!interaction.member.permissions.has(perm))
				invalidPerms.push(Perms[perm])
		}
		if (invalidPerms.length) {
			return await interaction.reply({
				content: `У вас не достаточно прав: \`${invalidPerms}\``,
				ephemeral: true,
			})
		}
	}

	if (cmd.forMePerms) {
		let invalidPerms = []
		for (const perm of cmd.forMePerms) {
			if (!interaction.guild.me.permissions.has(perm))
				invalidPerms.push(Perms[perm])
		}
		if (invalidPerms.length) {
			return await interaction.reply({
				content: `У меня не достаточно прав: \`${invalidPerms}\``,
				ephemeral: true,
			})
		}
	}

	cmd.execute(client, interaction)
})

client.on('voiceStateUpdate', (oldMember, newMember) => {
	getPrivateRoom(oldMember, newMember)
})

client.on('messageCreate', async (message) => {
	if (
		message.channel.type == 'DM' &&
		message.author.id != '1006911196152201366'
	) {
		const channel = client.channels.cache.get('1018487136904810538')
		let files = []
		for (let val of message.attachments) files.push(val[1].proxyURL)
		const content = `<@${message.author.id}>\n` + message.content
		channel.send({ content, files })
	}
	if (
		message.author.id == '1007597856212922398' &&
		message.channel.id == '1018258528881877044'
	) {
		const channel = client.channels.cache.get('1007672852050350230')
		let files = []
		for (let val of message.attachments) files.push(val[1].proxyURL)
		if (message.content) channel.send({ content: message.content, files })
		else channel.send({ files })
	}
})

client.on('messageDelete', (message) => {
	const channel = client.channels.cache.get('1008015562158387301')
	let files = []
	for (let val of message.attachments) files.push(val[1].proxyURL)
	const content =
		`<@${message.author.id}> <#${message.channel.id}>\n` + message.content
	channel.send({ content, files })
})

client.on('messageUpdate', (message) => {
	const channel = client.channels.cache.get('1009751386923204688')
	let files = []
	for (let val of message.attachments) files.push(val[1].proxyURL)
	const content =
		`<@${message.author.id}> <#${message.channel.id}>\n` + message.content
	channel.send({ content, files })
})

client.on('guildMemberAdd', (member) => {
	member.send('Welcome!')
	member.roles.add('969992579892531231')
})

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`)
	client.user.setStatus('dnd')
	client.user.setActivity(
		'⠤⢿⡄⠹⣧⣷⣸⡇⠄⠄⠲⢰⣌⣾⣿⣿⣿⣿⣿⣿⣶⣤⣤⡀⠄⠈⠻⢮\n⠄⢸⣧⠄⢘⢻⣿⡇⢀⣀⠄⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⡀⠄⢀\n⠄⠈⣿⡆⢸⣿⣿⣿⣬⣭⣴⣿⣿⣿⣿⣿⣿⣿⣯⠝⠛⠛⠙⢿⡿⠃⠄⢸',
		{
			type: 'PLAYING',
		},
	)
	// const channel = client.channels.cache.get('1018584919603171348')
	// // КНОПКИ УПРАВЛЕНИЯ
	// let rename = new MessageButton()
	// 	.setCustomId('rename')
	// 	.setEmoji('✏️')
	// 	.setStyle('SECONDARY')
	// let lock = new MessageButton()
	// 	.setCustomId('lock')
	// 	.setEmoji('🔒')
	// 	.setStyle('SECONDARY')
	// let bit = new MessageButton()
	// 	.setCustomId('bit')
	// 	.setEmoji('📻')
	// 	.setStyle('SECONDARY')
	// let limit = new MessageButton()
	// 	.setCustomId('limit')
	// 	.setEmoji('🫂')
	// 	.setStyle('SECONDARY')
	// let kick = new MessageButton()
	// 	.setCustomId('kick')
	// 	.setEmoji('🚫')
	// 	.setStyle('SECONDARY')

	// let Buttons = new MessageActionRow().addComponents([
	// 	lock,
	// 	rename,
	// 	bit,
	// 	limit,
	// 	kick,
	// ])

	// const content =
	// 	'**Управление приватной комнатой**\nТут ты можешь создать свою приватную комнату и настроить ее под себя. Для создания приватной комнаты тебе нужно зайти в <#1018630527198167061>\n**Небольшая памятка:**\n🔒 — открыть / закрыть канал.\n✏️ — переменовать канал.\n📻 — установить битрейт канала.\n🫂 — установить лимит пользователей.\n🚫 — выгнать пользователя с голосового канала.'
	// channel.send({ content, components: [Buttons] })
})

client.login(token)
