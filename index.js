<<<<<<< HEAD

const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
=======

const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const crypto = require("crypto");

// ======================================
// EXPRESS API
// ======================================

const app = express();
const PORT = process.env.PORT || 3000;

let latestKey = null;

// Homepage
app.get("/", (req, res) => {
    res.send("Discord Key API is online!");
});

// Get latest key
app.get("/key", (req, res) => {
    if (!latestKey) {
        return res.status(404).json({
            success: false,
            error: "No key generated yet"
        });
    }

    res.json({
        success: true,
        key: latestKey
    });
});

// Start API for Render
const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`API running on port ${PORT}`);
});

server.on("error", (error) => {
    console.error("API error:", error);
});

// ======================================
// KEY GENERATOR
// ======================================
>>>>>>> 6d9a0e2 (Add Express API dependency)

let latestKey = null;

// Roblox API
app.get("/", (req, res) => {
    res.send("Discord Key API is online!");
});

app.get("/key", (req, res) => {
    if (!latestKey) {
        return res.status(404).json({
            success: false,
            error: "No key generated yet"
        });
    }

    res.json({
        success: true,
        key: latestKey
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`API running on port ${PORT}`);
});

// Generate a secure random key
function generateKey(length = 30) {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let key = "";

    for (let i = 0; i < length; i++) {
<<<<<<< HEAD
        key += chars[crypto.randomInt(chars.length)];
=======
        key += chars.charAt(crypto.randomInt(chars.length));
>>>>>>> 6d9a0e2 (Add Express API dependency)
    }

    return key;
}

<<<<<<< HEAD
// Discord bot
=======
// ======================================
// DISCORD BOT
// ======================================

>>>>>>> 6d9a0e2 (Add Express API dependency)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("clientReady", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
        let channel = null;

<<<<<<< HEAD
        for (const guild of client.guilds.cache.values()) {
            const channels = await guild.channels.fetch();

            channel = channels.find(c =>
                c &&
                c.name === "key" &&
                c.isTextBased() &&
                typeof c.send === "function"
=======
        // Find #key channel
        for (const guild of client.guilds.cache.values()) {
            const channels = await guild.channels.fetch();

            channel = channels.find(
                c =>
                    c &&
                    c.name === "key" &&
                    c.isTextBased() &&
                    typeof c.send === "function"
>>>>>>> 6d9a0e2 (Add Express API dependency)
            );

            if (channel) break;
        }

        if (!channel) {
            console.error("Could not find #key channel!");
            return;
        }

<<<<<<< HEAD
        let previousMessage = null;

        async function sendKey() {
            try {
                const newKey = generateKey(30);
                const message = await channel.send(newKey);

=======
        console.log(`Found channel: #${channel.name}`);

        let previousMessage = null;

        // Generate and send key
        async function sendKey() {
            try {
                const newKey = generateKey(30);

                const message = await channel.send(newKey);

                // Update API
>>>>>>> 6d9a0e2 (Add Express API dependency)
                latestKey = newKey;

                console.log("Generated Key:", latestKey);

<<<<<<< HEAD
=======
                // Delete previous key message
>>>>>>> 6d9a0e2 (Add Express API dependency)
                if (previousMessage) {
                    try {
                        await previousMessage.delete();
                    } catch (error) {
                        console.log("Could not delete previous key.");
                    }
                }

                previousMessage = message;
<<<<<<< HEAD
=======

>>>>>>> 6d9a0e2 (Add Express API dependency)
            } catch (error) {
                console.error("Key generation failed:", error);
            }
        }

<<<<<<< HEAD
        await sendKey();

=======
        // Generate first key immediately
        await sendKey();

        // Generate new key every 6 hours
>>>>>>> 6d9a0e2 (Add Express API dependency)
        setInterval(sendKey, 6 * 60 * 60 * 1000);

        console.log("6-hour key generation enabled.");

    } catch (error) {
        console.error("Discord setup error:", error);
    }
});

<<<<<<< HEAD
=======
// ======================================
// DISCORD LOGIN
// ======================================

>>>>>>> 6d9a0e2 (Add Express API dependency)
if (!process.env.TOKEN) {
    console.error("Missing TOKEN environment variable!");
} else {
    client.login(process.env.TOKEN).catch(error => {
        console.error("Discord login failed:", error);
    });
}
