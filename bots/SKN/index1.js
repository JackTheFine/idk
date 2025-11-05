const { Client, Events, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('node:fs');
const { token1 } = require('../../config.json');
require("./deploy-commands1");

const client = new Client({ 
  intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers ] 
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`../../commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, c => {
  console.log(`Ready! (logged into ${c.user.tag})`);
  client.user.setPresence({
    activities: [{ name: `evilmusic.mp3`, type: ActivityType.Listening }],
    status: 'idle',
  });
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  try {
    if (command) {
      await command.execute(interaction, client, interaction.options._hoistedOptions);
    }
  } catch (error) {
    console.error(error);
    return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

const wordReplies = {
  "can i have spots": "toy",
  "im not toy": "toy",
  "plsss": "toy",
  "u are toy": "no YOU",
  "cnat": "https://media.discordapp.net/stickers/1432864162182074449.webp?size=320&quality=lossless",
  "<@1247062292181291011>": "twin he doesnt care",
  "<@1434999293248405624>": "stop bothering them twin",
  "<@1399897074232983662>": "they have better things to do twin"
};

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;
  const msg = message.content.toLowerCase();
  const found = Object.keys(wordReplies).find(word => msg.includes(word));
  if (found) {
    await message.reply(wordReplies[found]);
  }
});

client.login(token1);
