const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Colors,
} = require("discord.js");

module.exports = {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Submit a suggestion.")
    .addStringOption((option) =>
      option
        .setName("suggestion")
        .setDescription("The suggestion text.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const suggestionText = interaction.options.getString("suggestion", true);

    const embed = new EmbedBuilder()
      .setTitle("Suggestion")
      .setDescription(suggestionText)
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .addFields(
        { name: "Status", value: "⏳ Pending" },
        { name: "Upvotes", value: "0 (0%)", inline: true },
        { name: "Downvotes", value: "0 (0%)", inline: true }
      )
      .setColor(Colors.Yellow);

    const voteRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("upvote")
        .setLabel("👍 Upvote")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("downvote")
        .setLabel("👎 Downvote")
        .setStyle(ButtonStyle.Primary)
    );

    const modRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("approve")
        .setLabel("✅ Approve")
        .setStyle(ButtonStyle.Success)
        .setDisabled(!interaction.member.permissions.has("MANAGE_MESSAGES")),
      new ButtonBuilder()
        .setCustomId("reject")
        .setLabel("🗑️ Reject")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(!interaction.member.permissions.has("MANAGE_MESSAGES"))
    );

    const message = await interaction.reply({
      embeds: [embed],
      components: [voteRow, modRow],
      fetchReply: true,
    });

    const filter = (i) =>
      ["upvote", "downvote", "approve", "reject"].includes(i.customId) &&
      i.message.id === message.id;
    const collector = message.createMessageComponentCollector({
      filter,
      time: 86400000,
    });

    let upvotes = 0;
    let downvotes = 0;
    let status = "⏳ Pending";
    const userVotes = new Map();

    collector.on("collect", async (i) => {
      const userId = i.user.id;
      const previousVote = userVotes.get(userId);

      if (i.customId === "upvote") {
        if (previousVote === "downvote") {
          downvotes--;
        }
        if (previousVote !== "upvote") {
          upvotes++;
          userVotes.set(userId, "upvote");
        }
      } else if (i.customId === "downvote") {
        if (previousVote === "upvote") {
          upvotes--;
        }
        if (previousVote !== "downvote") {
          downvotes++;
          userVotes.set(userId, "downvote");
        }
      } else if (
        i.customId === "approve" &&
        i.member.permissions.has("MANAGE_MESSAGES")
      ) {
        status = `✅ Approved by <@${userId}>`;
        embed.setColor(Colors.Green);
        voteRow.components.forEach((button) => button.setDisabled(true));
        modRow.components.forEach((button) => button.setDisabled(true));
      } else if (
        i.customId === "reject" &&
        i.member.permissions.has("MANAGE_MESSAGES")
      ) {
        status = `🗑️ Rejected by <@${userId}>`;
        embed.setColor(Colors.Red);
        voteRow.components.forEach((button) => button.setDisabled(true));
        modRow.components.forEach((button) => button.setDisabled(true));
      }

      const totalVotes = upvotes + downvotes;
      const upvotePercentage = totalVotes
        ? ((upvotes / totalVotes) * 100).toFixed(2)
        : 0;
      const downvotePercentage = totalVotes
        ? ((downvotes / totalVotes) * 100).toFixed(2)
        : 0;

      embed.setFields(
        { name: "Status", value: status },
        {
          name: "👍 Upvotes",
          value: `${upvotes} (${upvotePercentage}%)`,
          inline: true,
        },
        {
          name: "👎 Downvotes",
          value: `${downvotes} (${downvotePercentage}%)`,
          inline: true,
        }
      );

      await i.update({ embeds: [embed], components: [voteRow, modRow] });
    });

    collector.on("end", () => {
      voteRow.components.forEach((button) => button.setDisabled(true));
      modRow.components.forEach((button) => button.setDisabled(true));
      interaction.editReply({ components: [voteRow, modRow] });
    });
  },
};
