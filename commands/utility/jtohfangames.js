const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

const gameList = {
  15030142936: "ACS",
  6487926520: "TGTA",
  7078746617: "NNoA",
  16396216844: "GTZ",
  13842586087: "SToP",
  12451919385: "epn",
  13996952176: "OToP",
  10822512138: "BToC",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jtohfangames")
    .setDescription("Get info on a jtoh fangame.")
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("Select a game")
        .setRequired(true)
        .setAutocomplete(true),
    ),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = Object.values(gameList);
    const filtered = choices.filter((choice) =>
      choice.toLowerCase().includes(focusedValue.toLowerCase()),
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice })),
    );
  },

  async execute(interaction) {
    const selectedGame = interaction.options.getString("game");
    const gameID = Object.keys(gameList).find(
      (key) => gameList[key] === selectedGame,
    );

    if (!gameID) {
      return interaction.reply({ content: "Game not found", ephemeral: true });
    }

    try {
      const universeResponse = await axios.get(
        `https://apis.roblox.com/universes/v1/places/${gameID}/universe`,
      );
      const universeId = universeResponse.data.universeId;

      if (!universeId) {
        return interaction.reply({
          content: "Failed to get universe ID for the game.",
          ephemeral: true,
        });
      }

      const gameResponse = await axios.get(
        `https://games.roblox.com/v1/games?universeIds=${universeId}`,
      );
      const gameInfo = gameResponse.data.data[0];

      if (!gameInfo) {
        return interaction.reply({
          content: "Failed to fetch game info!",
          ephemeral: true,
        });
      }

      const iconResponse = await axios.get(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=png&isCircular=false`);
      const iconUrl = iconResponse.data.data[0].imageUrl;

      const gameEmbed = new EmbedBuilder()
        .setTitle(gameInfo.name)
        .setAuthor({ name: gameInfo.creator.name })
        .setDescription(gameInfo.description || "No description available.")
        .addFields(
          {
            name: "Visits",
            value: gameInfo.visits.toLocaleString(),
            inline: true,
          },
          {
            name: "Favorites",
            value: gameInfo.favoritedCount.toLocaleString(),
            inline: true,
          },
        )
        .setImage(iconUrl)
        .setColor("Random");

      await interaction.reply({ embeds: [gameEmbed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "There was an error fetching the game info.",
        ephemeral: true,
      });
    }
  },
};
