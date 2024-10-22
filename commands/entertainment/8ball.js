const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Responds to a yes/no question with a random answer.")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The yes/no question to ask the 8ball")
        .setRequired(true)
    ),
  async execute(interaction) {
    const answers = [
      "Yes.",
      "No.",
      "Maybe.",
      "Definitely.",
      "Absolutely not.",
      "Ask again later.",
      "It is certain.",
      "Very doubtful.",
      "Without a doubt.",
      "Cannot predict now.",
      "Most likely.",
      "Don't count on it.",
      "Yes, definitely.",
      "My sources say no.",
      "Outlook good.",
      "Outlook not so good.",
      "Yes, in due time.",
      "My reply is no.",
      "You may rely on it.",
      "Concentrate and ask again.",
    ];

    const question = interaction.options.getString("question");
    const answer = answers[Math.floor(Math.random() * answers.length)];

    await interaction.reply(
      `🎱 **Question:** ${question}\n**Answer:** ${answer}`
    );
  },
};
