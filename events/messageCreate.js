const { Events } = require("discord.js");

const roasts = [
  "You're like a software update: whenever I see you, I think 'not now.'",
  "You bring everyone so much joy… when you leave the room.",
  "You're proof that even evolution makes mistakes.",
  "If I wanted to hear from someone like you, I’d unplug my router.",
  "Your secrets are always safe with me. I never even listen when you talk.",
  "You have the personality of a dial-up internet connection.",
  "Somewhere out there is a tree tirelessly producing oxygen for you. You owe it an apology.",
  "I’d challenge you to a battle of wits, but I see you're unarmed.",
  "You’re the reason we have warning labels on everything.",
  "You have a face for radio and a voice for silent films.",
];

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    const targetChannels = [
      "1219117187260747789",
      "1219117830641811506",
      "1234498856067137596",
      "1223364419010957332",
    ];

    if (targetChannels.includes(message.channelId)) {
      if (Math.random() < 0.01) {
        const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
        await message.reply(randomRoast);
      }
    }
  },
};
