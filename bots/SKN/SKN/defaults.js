const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Path to defaults.json
const defaultsPath = path.join(__dirname, 'defaults.json');

function loadDefaults() {
  return JSON.parse(fs.readFileSync(defaultsPath, 'utf8'));
}

function saveDefaults(data) {
  fs.writeFileSync(defaultsPath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('defaults')
    .setDescription('View or update default IDs')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('view')
        .setDescription('View current default IDs'))
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set a default value')
        .addStringOption(option =>
          option.setName('key')
            .setDescription('The default key (e.g. categoryParent, logChannel)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('value')
            .setDescription('The new value (ID)')
            .setRequired(true))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    let defaults = loadDefaults();

    if (sub === 'view') {
      let msg = '**Current Defaults:**\n';
      for (const [k, v] of Object.entries(defaults)) {
        msg += `\`${k}\`: ${v}\n`;
      }
      return interaction.reply({ content: msg, ephemeral: true });
    }

    if (sub === 'set') {
      const key = interaction.options.getString('key');
      const value = interaction.options.getString('value');

      if (!(key in defaults)) {
        return interaction.reply({ content: ` Invalid key. Valid keys: ${Object.keys(defaults).join(', ')}`, ephemeral: true });
      }

      defaults[key] = value;
      saveDefaults(defaults);

      return interaction.reply({ content: ` Updated \`${key}\` to \`${value}\`.`, ephemeral: true });
    }
  }
};
