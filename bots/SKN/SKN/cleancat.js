const { SlashCommandBuilder, ChannelType } = require('discord.js');

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

    await interaction.deferReply({ ephemeral: true });

    if (!category || category.type !== ChannelType.GuildCategory) {
      return interaction.editReply('no');
    }

    const channels = interaction.guild.channels.cache.filter(c => c.parentId === categoryId);

    if (channels.size === 0) {
      return interaction.editReply(`no cahnnels **${category.name}**.`);
    }

    let deleted = 0;
    for (const [id, channel] of channels) {
      try {
        await channel.delete(`responsible: ${interaction.user.tag}`);
        deleted++;
      } catch (err) {
        console.error(`error deleting ${channel.name}:`, err);
      }
    }

    await interaction.editReply(`del **${deleted}** channels in **${category.name}**.`);
  },
};
