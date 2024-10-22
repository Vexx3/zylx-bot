const { SlashCommandBuilder, EmbedBuilder, Colors } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Shows how long the bot has been running."),
  async execute(interaction) {
    const totalSeconds = process.uptime();
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = Math.floor(totalSeconds % 60);

    const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const embed = new EmbedBuilder()
      .setTitle("Bot Uptime")
      .setDescription(`The bot has been running for ${uptime}.`)
      .setColor(Colors.Blue);

    await interaction.reply({ embeds: [embed] });
  },
};
