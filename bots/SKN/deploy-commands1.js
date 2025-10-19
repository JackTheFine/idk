
const fs = require("fs");
const { REST, Routes } = require('discord.js');
const { token, clientId, guildId } = require('../../config.json');
const commands = [];

const commandFiles = fs.readdirSync('./bots/SKN/SKN').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./SKN/${file}`);
  commands.push(command.data.toJSON());

}

const rest1 = new REST({ version: '10' }).setToken(token);
try {
  //rest1.put(Routes.applicationCommands(clientId), { body: []})
  rest1.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  console.log('Successfully registered SKN application commands.');
} catch (error) {
  console.error(error);
}