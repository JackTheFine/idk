const { EmbedBuilder } = require('discord.js');
const defaults = require('./defaults.json');
const discord = require("discord.js");
const { createTranscript } = require('discord-html-transcripts');
const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('@discordjs/builders');
const { ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('youreluckyily')
    .setDescription('Start randomized speed dating rounds')
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
        .setDescription('How many rounds to run')
        .setRequired(true)),

  async execute(interaction, client) {
    await interaction.reply({ content: "beginning, this will update when" });

    runSpeedDating(interaction, client).catch(err => {
      console.error("Speed dating crashed:", err);
    });
  }
};

async function runSpeedDating(interaction, client) {
  const roles = interaction.options.getString('roles').split(",");
  const timeMinutes = interaction.options.getInteger('time');
  const rounds = interaction.options.getInteger('rounds');
  const timer = (timeMinutes * 60000) - 60000;

  if (roles.length % 2 !== 0) {
    return interaction.editReply("you must provide an even number of roles.");
  }

  const usedPairs = new Set();
  const permanentChannels = new Map();

  function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  async function ensurePermanentChannels() {
    for (const roleId of roles) {
      if (permanentChannels.has(roleId)) continue;

      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) continue;

      const ch = await interaction.guild.channels.create({
        name: `speeddating-${role.name}`,
        type: discord.ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.roles.everyone, deny: [discord.PermissionFlagsBits.ViewChannel] },
          { id: roleId, allow: [discord.PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [discord.PermissionFlagsBits.ViewChannel] }
        ],
        parent: defaults.category2Parent,
      });

      permanentChannels.set(roleId, ch.id);
      await new Promise(r => setTimeout(r, 500));
    }
  }

  async function startTimer(channelid, r1, r2) {
    setTimeout(async () => {
      client.channels.cache.get(channelid)?.send("1 minute remaining");

      setTimeout(async () => {
        const ch = client.channels.cache.get(channelid);
        if (!ch) return;
        ch.send("completed, closing");
        await closeChannel(channelid, r1, r2);
      }, 60000);
    }, timer);
  }

  async function closeChannel(channelid, r1, r2) {
    const ch = client.channels.cache.get(channelid);
    if (!ch) return;

    const file = await createTranscript(ch, {
      returnBuffer: false,
      filename: `${ch.name}-SpeedDate.html`
    });

    const permCh1 = client.channels.cache.get(permanentChannels.get(r1));
    const permCh2 = client.channels.cache.get(permanentChannels.get(r2));
    if (!permCh1 && !permCh2) return;

    const uploadMsg1 = permCh1 ? await permCh1.send({ files: [file] }) : null;
    const transcriptUrl1 = uploadMsg1?.attachments.first()?.url;

    let transcriptUrl2 = transcriptUrl1;
    if (permCh2 && permCh2.id !== permCh1?.id) {
      const uploadMsg2 = await permCh2.send({ files: [file] });
      transcriptUrl2 = uploadMsg2.attachments.first()?.url;
    }

    const exampleEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('SpeedDate Ended')
      .setAuthor({ name: 'SDB' })
      .setDescription('SpeedDate Ended, use the buttons below to view/download transcript.')
      .setFooter({ text: 'SDB' });

    const msgButtons1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('View Transcript')
        .setURL(`http://htmlpreview.github.io/?${transcriptUrl1}`)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Download Transcript')
        .setURL(transcriptUrl1)
        .setStyle(ButtonStyle.Link)
    );

    const msgButtons2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('View Transcript')
        .setURL(`http://htmlpreview.github.io/?${transcriptUrl2}`)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Download Transcript')
        .setURL(transcriptUrl2)
        .setStyle(ButtonStyle.Link)
    );

    if (permCh1) await permCh1.send({ embeds: [exampleEmbed], components: [msgButtons1] });
    if (permCh2 && permCh2.id !== permCh1?.id)
      await permCh2.send({ embeds: [exampleEmbed], components: [msgButtons2] });

    await ch.delete().catch(() => {});
  }

  async function runRound(roundIndex) {
    let shuffled = shuffle([...roles]);
    let pairs = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      const r1 = shuffled[i];
      const r2 = shuffled[i + 1];
      const key = [r1, r2].sort().join("-");

      if (usedPairs.has(key)) {
        let attempts = 0;
        do {
          shuffled = shuffle([...roles]);
          attempts++;
        } while (usedPairs.has([shuffled[i], shuffled[i + 1]].sort().join("-")) && attempts < 10);
      }

      usedPairs.add(key);
      pairs.push([r1, r2]);
    }

    const limitedPairs = pairs.slice(0, 25);

    await Promise.all(
      limitedPairs.map(async ([r1, r2]) => {
        const role1 = interaction.guild.roles.cache.get(r1);
        const role2 = interaction.guild.roles.cache.get(r2);

        const channel = await interaction.guild.channels.create({
          name: `${role1.name}-X-${role2.name}`,
          type: discord.ChannelType.GuildText,
          permissionOverwrites: [
            { id: interaction.guild.roles.everyone, deny: [discord.PermissionFlagsBits.ViewChannel] },
            { id: interaction.user.id, allow: [discord.PermissionFlagsBits.ViewChannel] },
            { id: r1, allow: [discord.PermissionFlagsBits.ViewChannel] },
            { id: r2, allow: [discord.PermissionFlagsBits.ViewChannel] },
          ],
          parent: defaults.categoryParent,
        });

        channel.send(`${timeMinutes} Minutes, starting now! (Round ${roundIndex + 1})`);
        startTimer(channel.id, r1, r2);
        await new Promise(r => setTimeout(r, 500));
      })
    );
  }

  await ensurePermanentChannels();

  for (let i = 0; i < rounds; i++) {
    await runRound(i);
    await new Promise(resolve => setTimeout(resolve, timeMinutes * 60000));
  }

  const deleteRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('delete_channel')
      .setLabel('Delete Channel')
      .setStyle(ButtonStyle.Danger)
  );

  for (const chId of permanentChannels.values()) {
    const ch = client.channels.cache.get(chId);
    if (ch) {
      await ch.send({
        content: "all rounds are done! admins can delete this permanent channel when finished:",
        components: [deleteRow]
      });
      await new Promise(r => setTimeout(r, 300));
    }
  }

  await interaction.editReply("all rounds finished! cleanup messages sent to permanent channels.");
}
