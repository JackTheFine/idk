const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userid')
    .setDescription('Get the ID of a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user you want to get the ID of')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('target');
    await interaction.reply({ content: `The user ID of **${user.tag}** is: \`${user.id}\``});
  },
};
