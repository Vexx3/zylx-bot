const {
  SlashCommandBuilder,
  EmbedBuilder,
  Colors,
  time,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Provides information about a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get information about")
        .setRequired(false)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("user") || interaction.user;
    const member = interaction.guild.members.cache.get(target.id);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: target.username,
        iconURL: target.displayAvatarURL(),
      })
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "Username", value: target.tag, inline: true },
        { name: "User ID", value: target.id, inline: true },
        {
          name: "Joined Server",
          value: `${time(member.joinedAt, "F")} (${time(
            member.joinedAt,
            "R"
          )})`,
        },
        {
          name: "Account Created",
          value: `${time(target.createdAt, "F")} (${time(
            target.createdAt,
            "R"
          )})`,
          inline: true,
        },
        {
          name: "Roles",
          value: member.roles.cache.map((role) => `<@&${role.id}>`).join(", "),
        }
      )
      .setColor(Colors.Blue)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
