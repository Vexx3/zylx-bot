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
        .setRequired(true)
    ),
  async execute(interaction) {
    const username = interaction.options.getString("username");
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

      const userId = userData.data[0].id;
      const infoUrl = `https://users.roblox.com/v1/users/${userId}`;
      const avatarUrl = `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=720x720&format=Png&isCircular=false`;

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
          { name: "Name", value: infoData.name, inline: true },
          {
            name: "Bio",
            value: infoData.description || "No bio",
            inline: true,
          },
          {
            name: "Joined Date",
            value: new Date(infoData.created).toLocaleDateString(),
            inline: true,
          }
        )
        .setImage(avatarImage)
        .setTimestamp()
        .setFooter({ text: "Roblox User Info", iconURL: avatarImage });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply(
        "There was an error fetching the Roblox user information."
      );
    }
  },
};
