const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('askingforspots')
    .setDescription('someone asking for spots')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to DM')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: false })
    const user = interaction.options.getUser('user');
    await user.send('YOURE ASKING FOR SPOTS HUH');
    await user.send('TOY');
    await user.send('TOY');
    await user.send('TOY');
    await user.send('TOY');
    await user.send('YOURE TOY');
    await user.send('k bye twin');
    await interaction.editReply({ content: `${user.tag} has been dealt with.`});
  }
};
