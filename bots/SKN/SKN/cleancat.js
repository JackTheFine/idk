const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cleancat')
    .setDescription('removes channels in cat')
    .addStringOption(option =>
      option
        .setName('categoryid')
        .setDescription('yes')
        .setRequired(true)
    ),

  async execute(interaction) {
    const categoryId = interaction.options.getString('categoryid');
    const category = interaction.guild.channels.cache.get(categoryId);

    if (!category || category.type !== 4) {
      return interaction.reply({
        content: 'no',
        ephemeral: true
      });
    }

    const channels = interaction.guild.channels.cache.filter(c => c.parentId === categoryId);

    if (channels.size === 0) {
      return interaction.reply({
        content: `no cahnnels **${category.name}**.`,
        ephemeral: true
      });
    }

    for (const [id, channel] of channels) {
      try {
        await channel.delete(`responsible: ${interaction.user.tag}`);
      } catch (err) {
        console.error(`error deleting ${channel.name}:`, err);
      }
    }

    await interaction.reply({
      content: `del **${channels.size}** channels in **${category.name}**.`,
      ephemeral: false
    });
  },
};
