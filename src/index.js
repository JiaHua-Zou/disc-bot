require("dotenv").config();
const { Client } = require("discord.js");
const { Player } = require("discord-music-player");

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

  //split the first section of the string for the command type.
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift();

  let guildQueue = client.player.getQueue(message.guild.id);

  //queue up single songs
  if (command === "play") {
    //check if the user is in/the same voice chat.
    if (!message.member.voice.channelId)
      return message.reply({ content: "You must be in the a voice Channel!" });
    if (!message.member.voice.channelId == message.guild.me.voice.channelId)
      return message.reply({
        content: "You must be in the same voice Channel!",
      });

    //create the queue and join the VC
    let queue = client.player.createQueue(message.guild.id);
    await queue.join(message.member.voice.channel);

    console.log(`URL: ${args[0]}`);
    //check the URL link contains link(youtube) or playlist(spotify)
    //If URL is a playlist use the playlist function or use the play function.
    if (args[0].indexOf("list=") > -1 || args[0].indexOf("playlist/") > -1) {
      let song = await queue.playlist(args.join(" ")).catch((_) => {
        if (!guildQueue) queue.stop();
      });
      message.reply({ content: `Adding playlist: ${song}` });
    } else {
      let song = await queue.play(args.join(" ")).catch((_) => {
        if (!guildQueue) {
          queue.stop();
        }
      });
      message.reply({ content: `Adding song: ${song}` });
    }
  } else if (command === "playing") {
    //check the current song playing.
    message.reply({ content: `Now playing: ${guildQueue.nowPlaying}` });
    console.log(`Now playing: ${guildQueue.nowPlaying}`);
  } else if (command === "pause") {
    //pause or resume the current song
    guildQueue.setPaused(true);
  } else if (command === "resume") {
    guildQueue.setPaused(false);
  } else if (command === "skip") {
    //skip the current song playing.
    guildQueue.skip();
    message.reply({ content: `Skipping: ${guildQueue.nowPlaying}` });
  } else if (command === "clear") {
    //Clear the queue up songs.
    guildQueue.stop();
    message.reply({ content: `Songs queue has been clear!` });
  } else {
    //reply message of no found command.
    message.reply({
      content: "No Found command! Check my about me for commands!",
    });
  }

  /*TODO: still need fixing, crashes when call */
  // if (command === "getQueue") {
  //   message.reply({ content: guildQueue.playlist });
  //   console.log(guildQueue);
  // }
});

client.login(process.env.TOKEN);
