const {
  SlashCommandBuilder,
  EmbedBuilder,
  Colors,
  time,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Provides information about the server."),
  async execute(interaction) {
    const { guild } = interaction;
    const owner = await guild.fetchOwner();

    const embed = new EmbedBuilder()
      .setTitle(guild.name)
      .setAuthor({
        name: guild.name,
        iconURL: guild.iconURL({ dynamic: true }),
      })
      .addFields(
        { name: "Server Name", value: guild.name, inline: true },
        { name: "Server ID", value: guild.id, inline: true },
        { name: "Owner", value: `${owner.user.tag}`, inline: true },
        { name: "Member Count", value: `${guild.memberCount}`, inline: true },
        {
          name: "Creation Date",
          value: `${time(guild.createdAt, "F")} (${time(
            guild.createdAt,
            "R"
          )})`,
          inline: true,
        }
      )
      .setColor(Colors.Blue);

    await interaction.reply({ embeds: [embed] });
  },
};
