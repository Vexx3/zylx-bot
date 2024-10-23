const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TimestampStyles,
} = require("discord.js");
const axios = require("axios");

const gameList = {
  12884807858: "Flam's Rooms of Stupidity: Remade",
  15030142936: "An0nymous' Cool Steeples",
  4884399625: "The Challenge Towers",
  10212412556: "The Neat Districts",
  6915126593: "Voki's Towers of Insanity",
  7062805182: "Cris' Rooms of Rushed",
  6985116641: "Vibewater's Redundant Edifices",
  6640564884: "Cris's Towers of Madness",
  10822512138: "Bacon's Towers of Categories",
  10283991824: "Caleb's Soul Crushing Domain",
  14941540826: "TowerRush!",
  9619455447: "Acry's Crazy Columns",
  12451919385: "egg's painful neats",
  14377924053: "The Classic Tower Archive",
  7184682048: "Kirk's Towers of Nonsense",
  15464996550: "Tango's Towers of Cursed",
  12244318727: "Detective's Towers of Doom",
  6209129635: "Yoi's Towers of Hell",
  17655390153: "Kiddie's Towers of Hell: Reborn",
  18386437234: "lask's towers of dread.",
  8426160717: "Kosta's Mini Tower Mayhem!",
  18174616215: "NEATs 4 Anarchists",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jtohfangames")
    .setDescription("Get info on a jtoh fangame.")
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription('Select a game or type "random" for a random game')
        .setRequired(false)
        .setAutocomplete(true),
    )
    .addBooleanOption((option) =>
      option
        .setName("random")
        .setDescription("Get a random fangame instead of selecting one.")
        .setRequired(false),
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
    const isRandom = interaction.options.getBoolean("random");
    let gameId;

    if (isRandom) {
      const gameKeys = Object.keys(gameList);
      gameID = gameKeys[Math.floor(Math.random() * gameKeys.length)];
    } else {
      const selectedGame = interaction.options.getString("game");
      gameID = Object.keys(gameList).find(
        (key) => gameList[key] === selectedGame,
      );
    }

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

      const iconResponse = await axios.get(
        `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=png&isCircular=false`,
      );
      const iconUrl = iconResponse.data.data[0].imageUrl;

      const votesResponse = await axios.get(
        `https://games.roblox.com/v1/games/votes?universeIds=${universeId}`,
      );
      const upvotes = votesResponse.data.data[0].upVotes || 0;
      const downvotes = votesResponse.data.data[0].downVotes || 0;

      const totalVotes = upvotes + downvotes;
      const rating =
        totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;

      const creatorType = gameInfo.creator.type;
      const creatorId = gameInfo.creator.id;
      const creatorUrl =
        creatorType === "Group"
          ? `https://www.roblox.com/groups/${creatorId}`
          : `https://www.roblox.com/users/${creatorId}/profile`;

      const createdAt = `<t:${Math.floor(new Date(gameInfo.created).getTime() / 1000)}:R>`;
      const updatedAt = `<t:${Math.floor(new Date(gameInfo.updated).getTime() / 1000)}:R>`;

      const gameEmbed = new EmbedBuilder()
        .setTitle(gameInfo.name)
        .setAuthor({ name: gameInfo.creator.name, url: creatorUrl })
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
          {
            name: "Upvotes",
            value: upvotes.toLocaleString(),
            inline: true,
          },
          {
            name: "Downvotes",
            value: downvotes.toLocaleString(),
            inline: true,
          },
          {
            name: "Rating",
            value: `${rating}%`,
            inline: true,
          },
          {
            name: "Created At",
            value: createdAt,
            inline: true,
          },
          {
            name: "Last Updated",
            value: updatedAt,
            inline: true,
          },
        )
        .setImage(iconUrl)
        .setColor("Random");

      const gameButton = new ButtonBuilder()
        .setLabel("Play Game")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://www.roblox.com/games/${gameID}`);

      const actionRow = new ActionRowBuilder().addComponents(gameButton);

      await interaction.reply({ embeds: [gameEmbed], components: [actionRow] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "There was an error fetching the game info.",
        ephemeral: true,
      });
    }
  },
};
