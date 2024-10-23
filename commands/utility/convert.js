const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("convert")
    .setDescription(
      "Convert between USD and Robux with optional tax and custom rates."
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount to convert")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("conversion")
        .setDescription("Conversion type (USD to Robux or Robux to USD)")
        .setRequired(true)
        .addChoices(
          { name: "USD to Robux", value: "usd_to_robux" },
          { name: "Robux to USD", value: "robux_to_usd" }
        )
    )
    .addBooleanOption((option) =>
      option
        .setName("tax")
        .setDescription("Apply 30% tax to nullify sales tax")
        .setRequired(false)
    )
    .addNumberOption((option) =>
      option
        .setName("rate")
        .setDescription(
          "Custom conversion rate (default: 0.0035 USD per Robux)"
        )
        .setRequired(false)
    ),
  async execute(interaction) {
    const amount = interaction.options.getNumber("amount");
    const conversionType = interaction.options.getString("conversion");
    const applyTax = interaction.options.getBoolean("tax") || false;
    const customRate = interaction.options.getNumber("rate") || 0.0035;

    let result;
    let rateDescription;

    if (conversionType === "usd_to_robux") {
      result = amount / customRate;
      if (applyTax) {
        result *= 0.7;
      }
      rateDescription = `${amount} USD is approximately ${Math.round(
        result
      )} Robux at a rate of ${customRate} USD per Robux.`;
    } else if (conversionType === "robux_to_usd") {
      result = amount * customRate;
      if (applyTax) {
        result *= 0.7;
      }
      rateDescription = `${amount} Robux is approximately $${result.toFixed(
        2
      )} USD at a rate of ${customRate} USD per Robux.`;
    }

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Conversion Result")
      .setDescription(rateDescription)
      .addFields(
        { name: "Amount", value: `${amount}`, inline: true },
        {
          name: "Conversion Type",
          value: conversionType.replace("_", " ").toUpperCase(),
          inline: true,
        },
        {
          name: "Applied Tax",
          value: applyTax ? "Yes (+30%)" : "No",
          inline: true,
        },
        { name: "Custom Rate", value: `${customRate} USD/Robux`, inline: true }
      )
      .setFooter({ text: "Robux Convert" })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
