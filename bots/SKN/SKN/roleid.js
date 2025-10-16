const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleid')
    .setDescription('Get the ID of a role')
    .addRoleOption(option =>
      option
        .setName('target')
        .setDescription('The role you want to get the ID of')
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole('target');
    await interaction.reply({content: `The role ID of **${role.name}** is: \`${role.id}\``});
  },
};
