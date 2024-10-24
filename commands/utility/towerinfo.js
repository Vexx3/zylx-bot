const { SlashCommandBuilder } = require("discord.js");
const { fetch } = require("undici");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("towerinfo")
    .setDescription("Get information about a specific JToH Tower.")
    .addStringOption(option => 
      option
        .setName("tower")
        .setDescription("The name of the tower you want information about.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const towerName = interaction.options.getString("tower");
    const formattedTowerName = towerName.replace(/ /g, "_");
    const url = `https://jtoh.fandom.com/wiki/${formattedTowerName}`;

    try {
      const response = await fetch(url);
      const data = await response.text();

      const difficulty = extractInfo(data, "Difficulty");
      const length = extractInfo(data, "Length", true);
      const creator = extractInfo(data, "Creator(s)");

      if (!length | !difficulty | !creator) {
        await interaction.reply({ content: "Could not retrieve tower information. Please check the tower name and try again.", ephemeral: true });
        return;
      }

      const towerDetails = `**Tower Name:** ${towerName}\n**Length:** ${length}\n**Creator(s):** ${creator}`;

      await interaction.reply(towerDetails);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "There was an error fetching the tower information. Please try again later.", ephemeral: true });
    }
  },
};

function extractInfo(html, label, isLength = false) {
  if (isLength) {
    const regex = new RegExp(`<h3 class="pi-data-label pi-secondary-font">${label}</h3>\\s*<div class="pi-data-value pi-font">(.*?)</div>`, 's');
    const match = html.match(regex);
    return match ? match[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim() : null;
  } else {
    const regex = new RegExp(`<h3 class="pi-data-label pi-secondary-font">${label}</h3>\\s*<div class="pi-data-value pi-font">(.*?)</div>`, 's');
    const match = html.match(regex);
    return match ? match[1].trim() : null;
  }
}
