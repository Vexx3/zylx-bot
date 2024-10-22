const { SlashCommandBuilder, EmbedBuilder, Colors } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Displays the avatar of a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get the avatar of")
        .setRequired(false)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("user") || interaction.user;

    const embed = new EmbedBuilder()
      .setTitle(`${target.username}'s Avatar`)
      .setImage(target.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor(Colors.Blue);

    await interaction.reply({ embeds: [embed] });
  },
};
