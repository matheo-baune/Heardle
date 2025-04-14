const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');


const dotenv = require('dotenv');
app.locals.environnement = dotenv.config().parsed
const environnement = app.locals.environnement;
let access_token = null
module.exports = app

app.use(cors());

app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const response = await axios.get(url);
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error fetching the URL ' + error.message);
  }
})

const Global = require('./global_function')

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


let all_tracks = null;
let daily_track = null;
let nbRightGuesses = 0;

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // allow requests from any origin
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/playlists/:id/tracks', async (req, res) => {
    const playlist_id = req.params.id
    const tracks = Global.getTracksByPlaylistId(playlist_id, all_tracks);
    if (tracks.length > 0) {
        res.send(tracks)
    } else {
        res.status(500).send('No Tracks found, try again later')
    }
});


app.get('/all', async (req, res) => {
    res.setHeader('content-type', 'application/json');
    res.send(all_tracks);
});

/**
 * @swagger
 * tags:
 *   name: Playlists
 *   description: Endpoints pour récupérer les playlists d'un utilisateur Spotify
 * /playlists:
 *   get:
 *     tags: [Playlists]
 *     summary: Récupère les playlists d'un utilisateur Spotify.
 *     description: Renvoie une liste de toutes les playlists de l'utilisateur avec leur ID, nom et URL de l'image de couverture.
 *     responses:
 *       '200':
 *         description: Succès. Retourne une liste de playlists.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID de la playlist.
 *                   name:
 *                     type: string
 *                     description: Nom de la playlist.
 *                   img_url:
 *                     type: string
 *                     description: URL de l'image de couverture de la playlist.
 *       '401':
 *         description: Erreur d'authentification. Le jeton d'accès Spotify est manquant ou invalide.
 *       '500':
 *         description: Erreur interne du serveur. Une erreur s'est produite lors de la récupération des playlists.
 */

app.get('/playlists', async (req, res) => {
    res.setHeader('content-type', 'application/json');
    res.send(await Global.getPlaylists(access_token));
});

app.get('/playlists/:id/randomTrack', async (req, res) => {
    const playlist_id = req.params.id
    try {
        const track = await Global.getRandomPlaylistTrack(playlist_id, all_tracks)
        res.send(track)
    } catch (e) {
        res.status(500).send()
    }
})

app.get('/randomize', (req, res) =>{
    Global.randomizeIndexDaily(all_tracks.length-1)
    res.send(all_tracks[Global.getDailyIndex()])
})

app.get('/daily', async (req, res) => {
    if(all_tracks?.length>0){
        try {
            const index = Global.getDailyIndex()
            res.status(200).send(all_tracks[index])
        } catch (e) {
            console.error(e)
            res.status(500).send()
        }
    }else{
        res.status(500).send('No Tracks found, try again later')
    }
})

app.get('/daily/:playlid_id', async (req, res) => {
    const playlist_id = req.params.playlid_id
    try {
        const track_id = Global.getThemeDaily(playlist_id)
        console.log(track_id);
        const track = await Global.getTrackByID(track_id, access_token)
        res.send(track)
    } catch (e) {
        res.status(500).send()
    }
});

app.get('/tracks/:id', async (req, res) =>{
    try {
        res.send(await Global.getTrackByID(req.params.id,access_token))
    }catch (e){
        res.status(500)
        throw e
    }
})

app.get('/addRightGuess', async (req, res) => {
    nbRightGuesses += 1
    res.send({nbRightGuesses})
})

app.get('/rightGuesses', async (req, res) => {
    res.send({nbRightGuesses})
});

const PORT = environnement.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server listening on ${PORT}`);
    //Get Token for Spotify API and reload it each 55min before expired
    access_token = await Global.getToken().catch(err => console.error(err))
    Global.getAllTracks(access_token).then((tracks) => {
        all_tracks = tracks
        Global.randomizeIndexDaily(all_tracks.length)
    })


    setInterval(async () => access_token = await Global.getToken(), 55 * 60 * 1000); // 55min * 60s * 1000ms = 55 min

    setInterval(() => {
        nbRightGuesses = 0;
        Global.randomizeIndexDaily(all_tracks.length)
    }, 24 * 60 * 60 * 1000); // 24h * 60min * 60s * 1000ms = 1 jour



});

