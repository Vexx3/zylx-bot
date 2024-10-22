const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription(
      "Rolls a die and returns a random number between 1 and the specified maximum value."
    )
    .addIntegerOption((option) =>
      option
        .setName("max")
        .setDescription("The maximum value of the die roll")
        .setRequired(true)
    ),
  async execute(interaction) {
    const max = interaction.options.getInteger("max");
    const roll = Math.floor(Math.random() * max) + 1;

    await interaction.reply(`🎲 You rolled a ${roll}. (1-${max})`);
  },
};
