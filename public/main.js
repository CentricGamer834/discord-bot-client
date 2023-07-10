const discord = require("discord.js");
const client = new discord.Client({ intents: ["GUILD_MESSAGES", "GUILD_VOICE_STATES", "GUILDS"] });

const log_DIV = document.getElementById("log");
const login_form = document.getElementById("login_form");
const email_input = document.getElementById("email");
const pass_input = document.getElementById("token");

const home_btn = document.getElementById("home_btn");
const guild_list = document.getElementById("guilds");
const search_bar = document.getElementById("search_bar");
const channel_list = document.getElementById("channels");
const user_panel = document.getElementById("user_panel");
const message_list = document.getElementById("messages");

const message_form = document.getElementById("message_form");
const message_input = document.getElementById("message_content");


const channelIcons = {
	voice: "<path fill=\"currentColor\" fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM14 5.00195V7.00195C16.757 7.00195 19 9.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 8.14295 17.86 5.00195 14 5.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z\"></path>",
	text: `<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z"></path>`,
	category: `<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M16.59 8.59004L12 13.17L7.41 8.59004L6 10L12 16L18 10L16.59 8.59004Z"></path>`
};


let currentChannel, currentGuild, isHome;

const store = {
	get: item => localStorage.getItem(item),
	set: (item, value) => localStorage.setItem(item, value),
	remove: item => localStorage.removeItem(item)
},
	renderedElements = {
		channels: {},
		messages: {},
		guilds: {}
	},
	logger = {
		log(message) {
			log_DIV.innerHTML = message;
			console.log(message);
		},
		error(message) {
			log_DIV.innerHTML = message;
			console.error(message);
		}
	};


pass_input.value = store.get("token");
login_form.onsubmit = async event => {
	event.preventDefault();

	const
		email = email_input.value,
		password = pass_input.value;

	let TOKEN;

	if (email.length > 5 && password.length > 8) {
		TOKEN = await fetch("https://discord.com/api/v9/auth/login", {
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				login: email,
				password
			}),
			method: "POST"
		})
			.then(resp => resp.json())
			.then(data => data.token)
			.catch(error => logger.error("Failed fetching token: " + error));
	} else if (password.length > 50) {
		TOKEN = password;
	} else return logger.error("No email and password or token was provided!");


	if (!TOKEN?.match(/(mfa\.[\w-]{84}|[\w-]{24}\.[\w-]{6}\.[\w-]{27})/)) return logger.error("The token provided is invalid!");
	logger.log("Token valid. Logging in...");

	store.set("token", TOKEN);

	client.login(TOKEN)
		.then(() => logger.log("Client logged in."))
		.catch(logger.error);
};

function formatDate(parsableDate) {
	const date = new Date(parsableDate);

	let formatted = "",
		minutes = date.getMinutes(),
		seconds = date.getSeconds(),
		hours = date.getHours();

	if (minutes < 10) minutes = "0" + minutes;
	if (seconds < 10) seconds = "0" + seconds;
	formatted += hours + ":" + minutes + ":" + seconds + " ";

	if (hours > 11) {
		formatted += "PM"
	} else {
		formatted += "AM"
	}

	return formatted;
}

function formatMessage(content) {
	return content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/<code(?:\s[^>]*)?>[\s\S]*?<\/code>|`{3}([\S\s]*?)`{3}|`([^`]*)`|~~([\S\s]*?)~~|\*{2}([\s\S]*?)\*{2}(?!\*)|\*([^*]*)\*|__([\s\S]*?)__/g, (match, a, b, c, d, e, f) => f ? `<u>${f}</u>` : e ? `<i>${e}</i>` : d ? `<b>${d}</b>` : c ? `<s>${c}</s>` : b ? `<code class="inline">${b}</code>` : a ? `<code>${a}</code>` : match).replace(/<(?::\w+:|@!*&*|#)[0-9]+>/g, m => "<span class=\"mention\" onclick=\"(() => {logger.log})\">" + m + "</span>")
}

async function goToChannel(channelId) {
	/** @type {discord.Channel} */
	const channel = client.channels.get(channelId);
	logger.log("Switching to channel " + channel.name);

	let lastMessage;

	message_list.innerHTML = "";

	function renderMessages(messages) {
		lastMessage = messages.pop().id;

		messages.forEach((message, index) => {
			const author = client.users.get(message.author.id);
			if (!author) return;

			const messageItem = document.createElement("div");
			messageItem.className = "message";

			const previousMessage = messages[index - 1];

			if (message.author.id !== previousMessage.author.id) {
				messageItem.className += " group_start";

				const user_avatar = new Image();
				user_avatar.className = "avatar";
				user_avatar.src = author.avatarURL;

				const userstamp = document.createElement("div");
				userstamp.className = "userstamp";

				const user_name = document.createElement("span");
				user_name.className = "username";
				user_name.innerText = author.tag;

				const time_stamp = document.createElement("span");
				time_stamp.className = "timestamp";
				time_stamp.innerText = "at " + formatDate(message.timestamp);

				userstamp.append(user_name, time_stamp);
				messageItem.append(user_avatar, userstamp);
			}

			const content = document.createElement("div");
			content.className = "content";
			content.innerHTML = formatMessage(message.content);

			messageItem.appendChild(content);
			message_list.prepend(messageItem);
		});
	}

	var loadMessages = async function loadMessages(before) {
		try {
			const response = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages?limit=100${before ? `&before=${before}` : ""}`, {
				headers: { authorization: client.token },
				method: "GET"
			});

			if (!response.ok) throw new Error("Failed fetching messages! Status: " + response.status);

			renderMessages(await response.json());
		} catch (error) {
			logger.error(error.message);
		}
	}

	if (channel.type === "voice") {
		const channel = message.member.voice.channel;
		if (!channel) return message.channel.send('Join a VC first!');

		const createNewChunk = () => {
			const pathToFile = __dirname + `/../recordings/${Date.now()}.pcm`;
			return fs.createWriteStream(pathToFile);
		};

		console.log(`Sliding into ${channel.name} ...`);
		channel.join()
			.then(connection => {
				console.log(`Joined ${channel.name}!\n\nREADY TO RECORD\n`);

				const receiver = connection.receiver;
				connection.on("speaking", (user, speaking) => {
					if (speaking) {
						console.log(`${user.username} started speaking`);

						const audioStream = receiver.createStream(user, { mode: "pcm" });
						audioStream.pipe(createNewChunk());
						audioStream.on('end', () => { console.log(`${user.username} stopped speaking`); });
					}
				});
			})
			.catch(err => { throw err; });

		return;
	}

	await loadMessages();

	message_list.scrollTop = message_list.scrollHeight;
	// message_list.onscroll = () => {
	// 	if (message_list.scrollTop >= 40) loadMessages(lastMessage);
	// };

	message_form.onsubmit = event => {
		event.preventDefault();

		const content = message_input.value;
		if (channel.id !== currentChannel || content.length < 1) return;

		channel.send(content)
			.then(logger.log)
			.catch(logger.error)
	}

	currentChannel = channelId;
}

function goToGuild(guildId) {
	const guild = client.guilds.get(guildId);
	home_btn.classList.remove("selected");

	channel_list.innerHTML = "";
	message_list.innerHTML = "";
	search_bar.innerHTML = "";

	const sbar_gname = document.createElement("div");
	sbar_gname.innerText = guild.name;

	search_bar.append(sbar_gname);

	guild.channels.sort((a, b) => b.position - a.position)
		.forEach(channel => {
			const channelItem = document.createElement("a");
			channelItem.className = "channel server " + channel.type;

			const channelIcon = document.createElement("svg");
			channelIcon.className = "icon";
			channelIcon.setAttribute("height", "24");
			channelIcon.setAttribute("width", "24");
			channelIcon.setAttribute("viewBox", "0 0 24 24");
			channelIcon.innerHTML = channelIcons[channel.type];

			const channelName = document.createElement("div");
			channelName.className = "name";
			channelName.innerText = channel.name;

			channelItem.onclick = () => goToChannel(channel.id);

			channelItem.append(channelIcon, channelName);
			channel_list.appendChild(channelItem);
		});

	isHome = false;
	currentGuild = guild.id;
}

client.on("ready", () => {
	window.client = client;

	logger.log("Client ready at " + client.readyAt + "(" + client.user.tag + ")");

	const dispImg = new Image();
	dispImg.className = "avatar";
	dispImg.src = client.user.avatarURL;

	const dispName = document.createElement("div");
	dispName.className = "name";
	dispName.innerText = client.user.tag;

	user_panel.innerHTML = "";
	user_panel.append(dispImg, dispName);

	client.guilds.forEach(guild => {
		const guildItem = document.createElement("a");
		guildItem.className = "guild";

		const guildPill = document.createElement("div");
		guildPill.className = "pill";

		const pillSpacer = document.createElement("span");
		pillSpacer.className = "spacer";

		let guildIcon;

		if (guild.iconURL) {
			guildIcon = new Image();
			guildIcon.alt = guild.nameAcronym;
			guildIcon.src = guild.iconURL;
		} else {
			guildIcon = document.createElement("div");
			guildIcon.innerText = guild.nameAcronym;
		}

		guildIcon.className = "icon";

		guildIcon.onclick = () => goToGuild(guild.id);

		guildPill.appendChild(pillSpacer);
		guildItem.append(guildPill, guildIcon);
		guild_list.appendChild(guildItem);

		renderedElements.guilds[guild] = guildItem;
	});

	home_btn.onclick = () => {
		if (isHome) return;

		logger.log("Switching to home");

		home_btn.classList.add("selected");

		search_bar.innerHTML = "";
		channel_list.innerHTML = "";
		message_list.innerHTML = "";

		client.channels
			.filter(channel => channel.type === "dm" || channel.type === "group")
			.forEach(channel => {
				const channelItem = document.createElement("a");
				channelItem.className = "channel private";

				const channelIcon = new Image();
				channelIcon.className = "icon";
				channelIcon.src = channel.iconURL || client.user.defaultAvatarURL;

				const statContainer = document.createElement("div");
				statContainer.className = "status_container";

				const channelName = document.createElement("div");
				channelName.className = "name";

				const statusText = document.createElement("div");
				statusText.className = "status";

				if (channel.type === "group") {
					channelName.innerText = channel.name || channel.recipients.map(recipient => client.users.get(recipient.id).username);
					statusText.innerText = channel.recipients.length + " Members";
				} else if (channel.type === "dm") {
					const dmWith = client.users.get(channel.recipient.id);

					if (!dmWith) return;

					channelIcon.src = dmWith.avatarURL;
					channelName.innerText = dmWith.username;
					statusText.innerText = dmWith.presence.status;
				}

				if (channel.type !== "category")
					channelItem.onclick = () => goToChannel(channel.id);

				statContainer.append(channelName, statusText);
				channelItem.append(channelIcon, statContainer);
				channel_list.prepend(channelItem);
			});

		isHome = !isHome;
	};

	home_btn.click();
});

client.on("message", message => {
	logger.log("[MESSAGE_CREATED] New message from " + message.author.tag + " in " + message.channel.name || message.channel.recipients[0].username || message.guild + " null <a href=\"#\" onclick=\"" + (() => goToChannel(message.channel.id)) + "\">" + message.channel.name + "</a>");

	if (message.channel.id === currentChannel) {
		goToChannel(currentChannel);
	} else new Audio("message.mp3").play();
});

client.on("messageDelete", message => {
	logger.log("[MESSAGE_DELETED] Message deleted in channel " + message.channel.name);

	renderedElements.messages[message].classList.add("deleted");
});

client.on("messageUpdate", message => {
	logger.log("[MESSAGE_UPDATED] Messaged modified in channel");

	console.log(renderedElements.messages[message]);
});

client.on("guildCreate", guild => {
	logger.log("[GUILD_CREATED] Guild created! Name: " + guild.name);

	const guildItem = document.createElement("a");
	guildItem.className = "guild";

	const guildPill = document.createElement("div");
	guildPill.className = "pill";

	const pillSpacer = document.createElement("span");
	pillSpacer.className = "spacer";

	let guildIcon;

	if (guild.iconURL) {
		guildIcon = new Image();
		guildIcon.alt = guild.nameAcronym;
		guildIcon.src = guild.iconURL;
	} else {
		guildIcon = document.createElement("div");
		guildIcon.innerText = guild.nameAcronym;
	}

	guildIcon.className = "icon";

	guildIcon.onclick = () => goToGuild(guild.id);

	guildPill.appendChild(pillSpacer);
	guildItem.append(guildPill, guildIcon);
	guild_list.appendChild(guildItem);

	renderedElements.guilds[guild] = guildItem;
});

client.on("guildDelete", guild => {
	logger.log("[GUILD_DELETED] Guild deleted! Name: " + guild.name);

	renderedElements.guilds[guild].remove();
});