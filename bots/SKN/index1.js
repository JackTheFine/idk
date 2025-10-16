
const { Client, Events, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, Collection, EmbedBuilder, ActivityType } = require('discord.js');
const fs = require('node:fs');
const { createTranscript } = require('discord-html-transcripts')
const discord = require("discord.js")
const { ButtonStyle } = require("discord.js")
const { token } = require('../../config.json');
require("./deploy-commands1")

const client1 = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers] });

client1.commands = new Collection();
const commandFiles = fs.readdirSync('./bots/SKN/SKN').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./SKN/${file}`);
  client1.commands.set(command.data.name, command);
}

client1.once(Events.ClientReady, () => {
  console.log(`Ready! (logged into ${client1.user.tag})`);
  client1.user.setPresence({activities: [{ name: `e`, type: ActivityType.Watching}], status: 'idle'})
});

client1.on(Events.InteractionCreate, async interaction => {
  if (interaction.isCommand()) {

  const command = client1.commands.get(interaction.commandName);


  try {
    if (command) {
      await command.execute(interaction, client1, interaction.options._hoistedOptions);
    }
  } catch (error) {
    console.error(error);
    return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  } 
} 
});
client1.on(Events.InteractionCreate, async btnInt => {
  if (!btnInt.isButton()) return;

  if (btnInt.customId === 'delete_channel') {
    if (!btnInt.member.permissions.has(discord.PermissionFlagsBits.Administrator)) {
      return btnInt.reply({ content: "Only admins can delete channels", ephemeral: true });
    }

    await btnInt.reply({ content: "removing", ephemeral: true });
    await btnInt.channel.delete().catch(() => {});
  }
});

client1.login(token)