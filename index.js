require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType
} = require("discord.js");
const ms = require("ms");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

const giveaways = new Map();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const staffRole = process.env.STAFF_ROLE;

  // 🎟️ TICKET CREATE
  if (interaction.commandName === "ticket") {
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: process.env.TICKET_CATEGORY,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: staffRole,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    channel.send(`Ticket created for ${interaction.user}`);
    interaction.reply({ content: "Ticket created!", ephemeral: true });
  }

  // ❌ CLOSE
  if (interaction.commandName === "close") {
    if (!interaction.channel.name.startsWith("ticket"))
      return interaction.reply({ content: "Not a ticket!", ephemeral: true });

    await interaction.reply("Closing ticket...");
    setTimeout(() => interaction.channel.delete(), 3000);
  }

  // ✏️ RENAME
  if (interaction.commandName === "rename") {
    const name = interaction.options.getString("name");
    interaction.channel.setName(name);
    interaction.reply("Renamed!");
  }

  // 🛡️ BAN
  if (interaction.commandName === "ban") {
    if (!interaction.member.roles.cache.has(staffRole))
      return interaction.reply({ content: "No permission", ephemeral: true });

    const user = interaction.options.getUser("user");
    await interaction.guild.members.ban(user);
    interaction.reply(`Banned ${user.tag}`);
  }

  // 🛡️ KICK
  if (interaction.commandName === "kick") {
    if (!interaction.member.roles.cache.has(staffRole))
      return interaction.reply({ content: "No permission", ephemeral: true });

    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);
    await member.kick();
    interaction.reply(`Kicked ${user.tag}`);
  }

  // 🛡️ TIMEOUT
  if (interaction.commandName === "timeout") {
    const user = interaction.options.getUser("user");
    const time = interaction.options.getString("time");
    const member = await interaction.guild.members.fetch(user.id);

    await member.timeout(ms(time));
    interaction.reply(`Timed out for ${time}`);
  }

  // 🎉 GIVEAWAY
  if (interaction.commandName === "giveaway") {
    const duration = interaction.options.getString("duration");
    const prize = interaction.options.getString("prize");

    const msg = await interaction.reply({
      content: `🎉 Giveaway: ${prize}\nReact with 🎉`,
      fetchReply: true
    });

    await msg.react("🎉");

    giveaways.set(msg.id, {
      prize,
      end: Date.now() + ms(duration)
    });

    setTimeout(async () => {
      const message = await msg.fetch();
      const users = await message.reactions.cache.get("🎉").users.fetch();
      const winner = users.filter(u => !u.bot).random();

      interaction.channel.send(`Winner: ${winner}`);
    }, ms(duration));
  }

  // 👑 PROMOTE
  if (interaction.commandName === "promote") {
    const user = interaction.options.getUser("user");
    const role = interaction.options.getRole("role");

    const member = await interaction.guild.members.fetch(user.id);
    member.roles.add(role);

    interaction.reply("Promoted!");
  }

  // 👑 DEMOTE
  if (interaction.commandName === "demote") {
    const user = interaction.options.getUser("user");
    const role = interaction.options.getRole("role");

    const member = await interaction.guild.members.fetch(user.id);
    member.roles.remove(role);

    interaction.reply("Demoted!");
  }

  // 📢 ANNOUNCE
  if (interaction.commandName === "announce") {
    const msg = interaction.options.getString("message");
    const channel = interaction.guild.channels.cache.get(process.env.ANNOUNCE_CHANNEL);

    channel.send(`📢 ${msg}`);
    interaction.reply({ content: "Sent!", ephemeral: true });
  }
});

client.login(process.env.TOKEN);