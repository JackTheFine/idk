const { EmbedBuilder } = require('discord.js')
const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('@discordjs/builders');
const { ButtonStyle } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('hello'),

  async execute(interaction, client) {
    interaction.reply("pong!")
  }
}