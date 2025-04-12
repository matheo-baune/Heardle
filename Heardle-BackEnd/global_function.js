const app = require('./server.js');
const environnement = app.locals.environnement;
const axios = require('axios');

let index_daily = 0;
let indexes_themes = [];
let playlist_indexes = [];


function randomizeIndexDaily(indexMax){
    index_daily = Math.floor(Math.random() * indexMax)
    let indexes_themes_keys = Object.keys(playlist_indexes);
    indexes_themes_keys.forEach((key) => {
        indexes_themes[key] = Math.floor(Math.random() * playlist_indexes[key].length);
    });
}

function getDailyIndex(){
    return index_daily;
}

function getThemeDaily(playlist_id){
    const index = indexes_themes[playlist_id];
    return playlist_indexes[playlist_id][index];
}

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

async function getPlaylists(access_token) {
    let data = []
    //Account of playlist
    const user_id = 'l2medd2pcxwqv50xnvwm2zm6u';
    try {
        let response = await axios.get(
            `https://api.spotify.com/v1/users/${user_id}/playlists?offset=0&limit=50`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );
        data = response.data.items.map((playlist) => {
            // console.log(playlist.name)
            return {
                id: playlist.id,
                name: playlist.name,
                img_url: playlist.images[0],
            };
        });
        return data;
    } catch (error) {
        console.error(error);
        return data;
    }
}


async function getPlaylistTracks(playlist_id, offset, token) {
    // console.log(`Fetching tracks for playlist ID: ${playlist_id} with offset: ${offset}`);
    const response = await axios({
        url: `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?offset=${offset}`,
        method: 'get',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const tracks = [];
    response.data.items.forEach(elt => {
        let artists = [];
        elt.track.artists.forEach(artist => {
            artists.push(artist.name);
        });

        if (playlist_indexes[playlist_id] === undefined) {
            playlist_indexes[playlist_id] = [];
        }
        playlist_indexes[playlist_id].push(elt.track.id);

        tracks.push({
            id: elt.track.id,
            artists_name: artists,
            track_name: elt.track.name,
            embed_url: elt.track.external_urls.spotify,
            playlist_id: playlist_id,
            img_album: elt.track.album.images[0],
        });
    });

    return {
        tracks: tracks,
        next: response.data.next,
        offset: response.data.offset,
        limit: response.data.limit
    };
}

async function getAllPlaylistTracks(playlist_id, token) {
    let tracks = [];
    let response = await getPlaylistTracks(playlist_id, 0, token);

    tracks = tracks.concat(response.tracks);

    while (response.next !== null) {
        response = await getPlaylistTracks(playlist_id, response.offset + response.limit, token);
        tracks = tracks.concat(response.tracks);
    }

    return tracks;
}


async function getAllTracks(token) {
    try {
        let response = await axios.get(
            `http://heardle-backend:3000/playlists`
        );

        let all_tracks = []
        let id_playlists = response.data.map(playlist => playlist.id)
        for (const id_current_playlist of id_playlists) {
            //Récupération de toutes les musiques d'une playlist
            let tracks = await getAllPlaylistTracks(id_current_playlist, token)
            all_tracks = all_tracks.concat(tracks)
        }
        console.log("End of fetching all tracks")
        return Array.from(
            all_tracks.reduce((seen, track) => {
                if (!seen.has(track.track_name)) {
                    seen.add(track.track_name);
                }
                return seen;
            }, new Set()),
            track_name => all_tracks.find(track => track.track_name === track_name)
        ).sort((a, b) => a.track_name.localeCompare(b.track_name));;
    } catch (error) {
        throw error;
    }
}

async function getTrackByID(track_id, token){
    let response_track = await axios.get(`https://api.spotify.com/v1/tracks/${track_id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    console.log(`https://api.spotify.com/v1/tracks/${track_id}`)
    console.log(response_track.data)
    response_track = response_track.data
    let album_id = response_track.album.uri.split(':')[2]
    console.log(`https://api.spotify.com/v1/albums/${album_id}`)
    console.log(album_id)

    let response_album = await axios.get(`https://api.spotify.com/v1/albums/${album_id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    console.log(response_album.data)
    response_album = response_album.data

    return {
        id: track_id,
        artists_name: response_track.artists.map(artist => artist.name),
        track_name: response_track.name,
        embed_url: response_track?.external_urls.spotify,
        img_album : response_album.images[0],
    }
}

async function getRandomPlaylistTrack(playlist_id, all_tracks) {
    all_tracks = all_tracks.filter(track => track.playlist_id === playlist_id)
    let randomIndex = Math.floor(Math.random() * all_tracks.length);
    let randomTrack = all_tracks[randomIndex];
    return randomTrack;
}

module.exports = {
    getToken,
    getPlaylists,
    getPlaylistTracks,
    getAllPlaylistTracks,
    getAllTracks,
    randomizeIndexDaily,
    getDailyIndex,
    getTrackByID,
    getRandomPlaylistTrack,
    getThemeDaily
};
