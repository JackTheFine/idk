const { EmbedBuilder } = require('discord.js')
const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('@discordjs/builders');
const { ButtonStyle } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('isabully')
    .setDescription('hello')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    interaction.channel.send(`${user} is a bully chain :point_down:`)
    interaction.reply({ ephemeral: true, content: ":3"})
  }
}