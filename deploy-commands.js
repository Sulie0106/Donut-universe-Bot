require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [

  // 🎟️ Tickets
  new SlashCommandBuilder().setName("ticket").setDescription("Open a ticket"),
  new SlashCommandBuilder().setName("close").setDescription("Close ticket"),
  new SlashCommandBuilder()
    .setName("rename")
    .setDescription("Rename ticket")
    .addStringOption(o => o.setName("name").setRequired(true)),

  // 🛡️ Moderation
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user")
    .addUserOption(o => o.setName("user").setRequired(true)),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user")
    .addUserOption(o => o.setName("user").setRequired(true)),

  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout user")
    .addUserOption(o => o.setName("user").setRequired(true))
    .addStringOption(o => o.setName("time").setRequired(true)),

  // 🎉 Giveaway
  new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Start giveaway")
    .addStringOption(o => o.setName("duration").setRequired(true))
    .addStringOption(o => o.setName("prize").setRequired(true)),

  // 👑 Staff
  new SlashCommandBuilder()
    .setName("promote")
    .setDescription("Give role")
    .addUserOption(o => o.setName("user").setRequired(true))
    .addRoleOption(o => o.setName("role").setRequired(true)),

  new SlashCommandBuilder()
    .setName("demote")
    .setDescription("Remove role")
    .addUserOption(o => o.setName("user").setRequired(true))
    .addRoleOption(o => o.setName("role").setRequired(true)),

  // 📢 Announce
  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Make announcement")
    .addStringOption(o => o.setName("message").setRequired(true)),
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  console.log("Commands deployed!");
})();