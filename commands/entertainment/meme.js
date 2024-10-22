const { SlashCommandBuilder, EmbedBuilder, Colors } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Fetches a random meme from a meme subreddit."),
  async execute(interaction) {
    try {
      const response = await axios.get(
        "https://www.reddit.com/r/memes/random/.json"
      );
      const [post] = response.data[0].data.children;
      const meme = post.data;

      const embed = new EmbedBuilder()
        .setTitle(meme.title)
        .setImage(meme.url)
        .setURL(`https://reddit.com${meme.permalink}`)
        .setColor(Colors.Blue)
        .setFooter({ text: `👍 ${meme.ups} | 💬 ${meme.num_comments}` });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Failed to fetch a meme. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
