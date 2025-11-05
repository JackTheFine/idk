
const fs = require("fs");
const { REST, Routes } = require('discord.js');
const { token1, clientId1, guildId1 } = require('../../config.json');
const commands = [];

const commandFiles = fs.readdirSync('./bots/SKN/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());

}

const rest1 = new REST({ version: '10' }).setToken(token1);
try {
  rest1.put(Routes.applicationCommands(clientId1), { body: commands })
  //rest1.put(Routes.applicationGuildCommands(clientId1, guildId1), { body: commands })
  console.log('Successfully registered SKN application commands.');
} catch (error) {
  console.error(error);
}