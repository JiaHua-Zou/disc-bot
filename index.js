require("dotenv").config();
const { Client, Intents } = require("discord.js");
const { Player } = require("discord-music-player");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const prefix = "-";
const client = new Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"],
});
const player = new Player(client, {
  leaveOnEmpty: true,
});
client.player = player;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Ready to play music!`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix)) return;
  console.log(`command: ${message}`);

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift();
  let guildQueue = client.player.getQueue(message.guild.id);

  //queue up single songs
  if (command === "play") {
    if (!message.member.voice.channelId)
      return message.reply({ content: "You must be in the a voice Channel!" });
    if (!message.member.voice.channelId == message.guild.me.voice.channelId)
      return message.reply({
        content: "You must be in the same voice Channel!",
      });

    let queue = client.player.createQueue(message.guild.id);
    await queue.join(message.member.voice.channel);
    let song = await queue.play(args.join(" ")).catch((_) => {
      if (!guildQueue) {
        queue.stop();
      }
    });

    message.reply({ content: `Add: ${song}` });
  }

  //queue up playlist songs
  if (command === "playlist") {
    if (!message.member.voice.channelId)
      return message.reply({ content: "You must be in the a voice Channel!" });
    if (!message.member.voice.channelId == message.guild.me.voice.channelId)
      return message.reply({
        content: "You must be in the same voice Channel!",
      });

    let queue = client.player.createQueue(message.guild.id);
    await queue.join(message.member.voice.channel);
    let song = await queue.playlist(args.join(" ")).catch((_) => {
      if (!guildQueue) queue.stop();
    });
    message.reply({ content: `playing the playlist!` });
  }

  if (command === "skip") {
    guildQueue.skip();
    message.reply({ content: "Skipped" });
  }
  if (command === "getQueue") {
    message.reply({ content: guildQueue });
    console.log(guildQueue);
  }
  if (command === "Playing") {
    message.reply({ content: `Now playing: ${guildQueue.nowPlaying}` });
    console.log(`Now playing: ${guildQueue.nowPlaying}`);
  }
  
  if (command === "pause") {
    guildQueue.setPaused(true);
  }
  if (command === "resume") {
    guildQueue.setPaused(false);
  }
});

client.login(process.env.TOKEN);
