const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { fetch } = require("undici");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("towerinfo")
    .setDescription("Get information about a specific JToH Tower.")
    .addStringOption((option) =>
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
      const length = extractInfo(data, "Length");
      const creator = extractCreators(data, "Creator(s)");
      const imageUrl = extractImage(data);
      const description = extractDescription(data);

      if (!length | !difficulty | !creator | !imageUrl) {
        await interaction.reply({
          content:
            "Could not retrieve tower information. Please check the tower name and try again.",
          ephemeral: true,
        });
        return;
      }

      const towerEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`Information about ${towerName}`)
        .setImage(imageUrl)
        .addFields(
          { name: "Length", value: length },
          { name: "Difficulty", value: difficulty },
          { name: "Creator(s)", value: creator },
          { name: "Description", value: description }
        )
        .setFooter({ text: "Source: Juke's Towers of Hell Wiki." });

      await interaction.reply({ embeds: [towerEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content:
          "There was an error fetching the tower information. Please try again later.",
        ephemeral: true,
      });
    }
  },
};

function extractInfo(html, label, isLength = false) {
  if (isLength) {
    const regex = new RegExp(
      `<h3 class="pi-data-label pi-secondary-font">${label}</h3>\\s*<div class="pi-data-value pi-font">(.*?)</div>`,
      "s"
    );
    const match = html.match(regex);
    return match
      ? match[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim()
      : null;
  } else {
    const regex = new RegExp(
      `<h3 class="pi-data-label pi-secondary-font">${label}</h3>\\s*<div class="pi-data-value pi-font">(.*?)</div>`,
      "s"
    );
    const match = html.match(regex);

    if (match) {
      const cleanText = match[1]
        .replace(/<.*?>/g, "")
        .replace(/\s+/g, " ")
        .trim();

      return cleanText;
    }
    return null;
  }
}


function extractCreators(html) {
  const regex = /<h3 class="pi-data-label pi-secondary-font">Creator\(s\)<\/h3>\s*<div class="pi-data-value pi-font">.*?<b>(.*?)<\/b>/s;
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function extractImage(html) {
  let regex = /<figure class="pi-item pi-image">.*?<img src="(.*?)"/s;
  let match = html.match(regex);

  if (!match) {
    regex = /<figure class="pi-item pi-image".*?<a href="(.*?)"/s;
    match = html.match(regex);
  }

  return match ? match[1].trim() : null;
}

function extractDescription(html) {
  const regex = /<p>(.*?)<\/p>/s;
  const match = html.match(regex);

  if (match) {
    // Remove any remaining HTML tags and return clean text
    let description = match[1]
      .replace(/<.*?>/g, "") // Remove all HTML tags
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .trim();
    return description;
  }
  return null;
}
