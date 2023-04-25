const express = require('express');
const app = express();
const dotenv = require('dotenv');
const axios = require('axios');
const environnement = dotenv.config().parsed;

let accessToken = null;

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // allow requests from any origin
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/playlists', async (req, res) => {
    const user_id = 'l2medd2pcxwqv50xnvwm2zm6u';
    try {
        const response = await axios.get(
            `https://api.spotify.com/v1/users/${user_id}/playlists?offset=0&limit=50`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        const data = response.data.items.map((playlist) => {
            return {
                id: playlist.id,
                name: playlist.name.split('GuessIt -')[1].trim(),
                img_url: playlist.images[0],
            };
        });
        console.log(data);
        res.setHeader('content-type', 'application/json');
        res.send(data);
    } catch (error) {
        console.error("c'est la sauce", error);
    }
});

async function getToken() {
    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            {
                auth: {
                    username: environnement.CLIENT_ID,
                    password: environnement.CLIENT_SECRET,
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        throw error;
    }
}

app.listen(environnement.PORT, () => {
    console.clear();
    console.log(`Server listening on ${environnement.PORT}`);
    getToken()
        .then((token) => (accessToken = token))
        .catch((err) => {
            throw err;
        });
});
