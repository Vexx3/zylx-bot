const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField,
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
        .setLabel("Upvote")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("👍"),

      new ButtonBuilder()
        .setCustomId("downvote")
        .setLabel("Downvote")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("👎")
    );

    const isMod = interaction.member.permissions.has(
      PermissionsBitField.Flags.ManageMessages
    );

    const modRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("approve")
        .setLabel("Approve")
        .setStyle(ButtonStyle.Success)
        .setEmoji("✅")
        .setDisabled(isMod ? false : true),
      new ButtonBuilder()
        .setCustomId("reject")
        .setLabel("Reject")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🗑️")
        .setDisabled(isMod ? false : true)
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
        (i.customId === "approve" || i.customId === "reject") &&
        i.member.permissions.has(PermissionsBitField.Flags.ManageMessages)
      ) {
        status =
          i.customId === "approve"
            ? `✅ Approved by <@${userId}>`
            : `🗑️ Rejected by <@${userId}>`;
        embed.setColor(i.customId === "approve" ? Colors.Green : Colors.Red);
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
