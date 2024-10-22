const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flips a virtual coin and returns either Heads or Tails."),
  async execute(interaction) {
    const outcomes = ["Heads", "Tails"];
    const result = outcomes[Math.floor(Math.random() * outcomes.length)];

    await interaction.reply(`🪙 The coin landed on **${result}**!`);
  },
};
