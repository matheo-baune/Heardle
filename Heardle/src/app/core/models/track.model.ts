export interface Track {
  id:number;
  artists_name: string[];
  track_name: string;
  embed_url: string;
  img_album: {
    height:number,
    width:number,
    url:string
  }
}
