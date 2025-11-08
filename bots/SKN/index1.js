const { Client, Events, GatewayIntentBits, Collection, ActivityType, WebhookClient } = require('discord.js');
const fs = require('node:fs');
const { token1, wh } = require('../../config.json');
require("./deploy-commands1");
const path = require('path');
const webhookClient = new WebhookClient({ url: wh });
const responsesPath = path.join(__dirname, '../../responses.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers ]});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./bots/SKN/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, c => {
  console.log(`Ready! (logged into ${c.user.tag})`);
  client.user.setPresence({
    activities: [{ name: `for cops`, type: ActivityType.Watching }],
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

let wordReplies = {};
function loadResponses() {
  try {
    const data = fs.readFileSync(responsesPath, 'utf8');
    wordReplies = JSON.parse(data);
    console.log(`got ${Object.keys(wordReplies).length} `);
  } catch (err) {
    console.error("ur fucked;", err);
    wordReplies = {};
  }
}

loadResponses();

fs.watchFile(responsesPath, (curr, prev) => {
  console.log('reload');
  loadResponses();
});

const userMessageTimestamps = new Map();
const cooldownUsers = new Set();

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();
  const found = Object.keys(wordReplies).find(word => msg.includes(word));

  if (!found) return;

  const userId = message.author.id;
  const now = Date.now();

  if (cooldownUsers.has(userId)) return;

  if (!userMessageTimestamps.has(userId)) {
    userMessageTimestamps.set(userId, []);
  }

  const timestamps = userMessageTimestamps.get(userId);
  timestamps.push(now);
  const recent = timestamps.filter(ts => now - ts < 10_000);
  userMessageTimestamps.set(userId, recent);

  if (recent.length >= 3) {
    cooldownUsers.add(userId);
    console.log(`User ${message.author.tag} is on cooldown.`);

    try {
      await message.author.send("rate limit, ur cooked");
    } catch (err) {
      console.log(`Couldn't DM ${message.author.tag}`);
    }

    setTimeout(() => cooldownUsers.delete(userId), 60_000);
    return;
  }
  webhookClient.send({
	content: `${message.author.globalName} did ${message.content.toLowerCase()}`,
	username: 'amberisabully',
});
  await message.reply(wordReplies[found]);
});


client.login(token1);
