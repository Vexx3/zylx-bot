const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("convert")
    .setDescription(
      "Convert between USD and Robux with optional tax and custom rates.",
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount to convert")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("conversion")
        .setDescription("Conversion type (USD to Robux or Robux to USD)")
        .setRequired(true)
        .addChoices(
          { name: "USD to Robux", value: "usd_to_robux" },
          { name: "Robux to USD", value: "robux_to_usd" },
        ),
    )
    .addBooleanOption((option) =>
      option
        .setName("tax")
        .setDescription("Apply 30% tax to nullify sales tax")
        .setRequired(false),
    )
    .addNumberOption((option) =>
      option
        .setName("rate")
        .setDescription(
          "Custom conversion rate (default: 0.0035 USD per Robux)",
        )
        .setRequired(false),
    ),
  async execute(interaction) {
    const amount = interaction.options.getNumber("amount");
    const conversionType = interaction.options.getString("conversion");
    const applyTax = interaction.options.getBoolean("tax") || false;
    const customRate = interaction.options.getNumber("rate") || 0.0035;

    let result;
    let rateDescription;

    if (conversionType === "usd_to_robux") {
      result = Math.floor((amount / customRate));
      let taxText = "";
      if (applyTax) {
        result = Math.floor(result * 0.7);
        taxText = "+ 30%";
      }
      rateDescription = `$ ${amount} ÷ ${customRate} (rate) ${taxText} (tax) = **R$ ${result}**`;
    } else if (conversionType === "robux_to_usd") {
      result = Math.floor(amount * customRate);
      let taxText = "";
      if (applyTax) {
        result = Math.floor((result *= 1.3));
        taxText = "+ 30%";
      }
      rateDescription = `R$ ${amount} x ${customRate} (rate) ${taxText} (tax) = **$ ${result}**`;
    }

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setDescription(rateDescription)
      .setFooter({
        text: "The DevEx exchange rate is $.0035/R$. The sales tax is %30",
      });
    await interaction.reply({ embeds: [embed] });
  },
};
