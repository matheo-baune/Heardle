const app = require('./server.js');
const environnement = app.locals.environnement;
const axios = require('axios');

let index_daily = 0;


function randomizeIndexDaily(indexMax){
    index_daily = Math.floor(Math.random() * indexMax)
}

function getDailyIndex(){
    return index_daily;
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
            return {
                id: playlist.id,
                name: playlist.name.split('GuessIt -')[1].trim(),
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
    const response = await axios({
        url: `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?offset=${offset}`,
        method: 'get',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return {
        tracks: response.data.items.filter(elt => elt.track.preview_url).map(elt => {
            let artists = elt.track.artists.map(artist => artist.name)
            return {id:elt.track.id,artists_name: artists, track_name: elt.track.name, preview_url: elt.track.preview_url}
        }),
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
            `http://localhost:8080/playlists`
        );

        let all_tracks = []
        let id_playlists = response.data.map(playlist => playlist.id)
        for (const id_current_playlist of id_playlists) {
            //Récupération de toutes les musiques d'une playlist
            let tracks = await getAllPlaylistTracks(id_current_playlist, token)
            all_tracks = all_tracks.concat(tracks)
        }
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
    response_track = response_track.data
    let album_id = response_track.album.uri.split(':')[2]

    let response_album = await axios.get(`https://api.spotify.com/v1/albums/${album_id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    response_album = response_album.data

    return {
        artists_name: response_track.artists.map(artist => artist.name),
        img_album : response_album.images[0],
        track_name: response_track.name,
        preview_url: response_track?.preview_url
    }
}

module.exports = {
    getToken,
    getPlaylists,
    getPlaylistTracks,
    getAllPlaylistTracks,
    getAllTracks,
    randomizeIndexDaily,
    getDailyIndex,
    getTrackByID
};