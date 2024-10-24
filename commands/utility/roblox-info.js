const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { request } = require("undici");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("robloxinfo")
    .setDescription("Fetches Roblox user information")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("The Roblox username to fetch info for")
        .setRequired(false),
    )
    .addUserOption((option) =>
      option
        .setName("discord")
        .setDescription("The Discord user to check for Roblox connection")
        .setRequired(false),
    ),

  async execute(interaction) {
    const username = interaction.options.getString("username");
    const targetUser = interaction.options.getUser("discord");
    const guildId = interaction.guild.id;

    if (!targetUser && !username) {
      await interaction.reply(
        "Please provide either a Roblox username or target Discord user.",
      );
      return;
    }

    let robloxId;

    if (targetUser) {
      const userId = targetUser.id;
      const bloxlinkUrl = `https://api.blox.link/v4/public/guilds/${guildId}/discord-to-roblox/${userId}`;

      try {
        const response = await request(bloxlinkUrl, {
          method: "GET",
          headers: {
            Authorization: process.env.bloxlink_api,
          },
        });

        const data = await response.body.json();

        if (data.robloxID) {
          robloxId = data.robloxID;
        } else {
          await interaction.reply(
            `The user ${targetUser.tag} does not have a connected Roblox account.`,
          );
          return;
        }
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content:
            "There was an error fetching the Roblox info for the Discord user.",
        });
        return;
      }
    }

    if (username) {
      const userUrl = `https://users.roblox.com/v1/usernames/users`;
      const requestBody = {
        usernames: [username],
        excludeBannedUsers: true,
      };

      try {
        const userResponse = await request(userUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const userData = await userResponse.body.json();

        if (!userData.data || userData.data.length === 0) {
          await interaction.reply(`User ${username} does not exist on Roblox.`);
          return;
        }

        robloxId = userData.data[0].id;
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content:
            "There was an error fetching the Roblox info for the username.",
          ephemeral: true,
        });
        return;
      }
    }

    const infoUrl = `https://users.roblox.com/v1/users/${robloxId}`;
    const avatarUrl = `https://thumbnails.roblox.com/v1/users/avatar?userIds=${robloxId}&size=720x720&format=Png&isCircular=false`;

    try {
      const [infoResponse, avatarResponse] = await Promise.all([
        request(infoUrl),
        request(avatarUrl),
      ]);

      const infoData = await infoResponse.body.json();
      const avatarData = await avatarResponse.body.json();

      const avatarImage = avatarData.data[0].imageUrl;

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(infoData.displayName)
        .setThumbnail(avatarImage)
        .addFields(
          { name: "Username", value: infoData.name, inline: true },
          { name: "ID", value: String(infoData.id), inline: true },
          {
            name: "Account Created",
            value: `<t:${Math.floor(new Date(infoData.created).getTime() / 1000)}:F>`,
            inline: true,
          },
          {
            name: "Description",
            value: infoData.description || "No description",
          },
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error fetching the Roblox user information.",
        ephemeral: true,
      });
    }
  },
};
