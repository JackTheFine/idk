const { EmbedBuilder } = require('discord.js')
const discord = require("discord.js")
const { createTranscript } = require('discord-html-transcripts')
const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('@discordjs/builders');
const { ButtonStyle } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('youreluckyily')
    .setDescription('syoureluckyily')
	.addIntegerOption(option =>
      option.setName('time')
        .setDescription('Round Time in mins')
        .setRequired(true))
  .addStringOption(option =>
    option.setName('roles')
        .setDescription('Enter the roles you want to select (comma-separated IDs)')
        .setRequired(true))
	.addIntegerOption(option =>
      option.setName('rounds')
        .setDescription('rounds')
        .setRequired(true)),

  async execute(interaction, client) {
    const roles = interaction.options.getString('roles').split(",");
    if (roles.length % 2 != 0) {
      return interaction.reply("bro")
    }
    const numroles = roles.length
    const timer =  (interaction.options.getInteger('time')*60000)-60000;
    async function starttimer(channelid) {
  await setTimeout(function(){
    client.channels.cache.get(channelid).send("1 minute remaining")
    setTimeout(function(){
    client.channels.cache.get(channelid).send("completed,closing")
    closechannel(channelid)
  }, 60000)
  }, timer)
async function closechannel(channelid) {
          const file = await createTranscript(client.channels.cache.get(channelid), {
            returnBuffer: false,
            filename: `${client.channels.cache.get(channelid).name}-SpeedDate.html`
          })
          const msg = await client.channels.cache.get('1419134177650937908').send({ files: [file] })
          const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('SpeedDate Ended')
    .setAuthor({ name: 'SDB' })
    .setDescription('SpeedDate Ended, use the buttons below to view/download transcript.')
    .setFooter({ text: 'SDB' });
    const view = new ButtonBuilder()
    .setLabel('View Transcript')
    .setURL(`http://htmlpreview.github.io/?${msg.attachments.first()?.url}`)
    .setStyle(ButtonStyle.Link);
    const download = new ButtonBuilder()
    .setLabel('Download Transcript')
    .setURL(`${msg.attachments.first()?.url}`)
    .setStyle(ButtonStyle.Link);
     const row3 = new ActionRowBuilder()
    .addComponents(view, download);
          client.channels.cache.get('1419134177650937908').send({ embeds: [exampleEmbed], components: [row3] })
          client.channels.cache.get(channelid).delete()
}
	}
  interaction.deferReply({ ephemeral: true})
        interaction.guild.channels.create({
          name: `${(interaction.guild.roles.cache.get(roles[0])).name}-X-${(interaction.guild.roles.cache.get(roles[1])).name}`,
          type: discord.ChannelType.GuildText,
          permissionOverwrites: [
                  {id: interaction.guild.roles.everyone,
                  deny: [discord.PermissionFlagsBits.ViewChannel]},
                  {id: interaction.user.id,
                  allow: [discord.PermissionFlagsBits.ViewChannel]}
                ],
          parent: "1419131905630146591",
      }).then(async channel => {
        channel.send(`${interaction.options.getInteger('time')} Minutes, starting now!`)
        starttimer(channel.id);
        await interaction.editReply("done")
      })
  }
}