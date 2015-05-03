
# WebM Live Streaming RFC, version 1.0
WebM Live Streaming(alias wls) intends VOD/LIVE streaming video/audio with WebM using pure web technology.


## WLS MPD(media-presentaion-description) format specification
* Use json as MPD file format, that avoid extra MPD parser like m3u, dash, etc.
* Support live/vod streaming, including movie, tv, mobile-captured audio/video.
* Including control profile in MPD file with video/audio content profile.
* Support all available WebM media format: webm,mp4,aac,etc.
* Support convert HLS/DASH/etc to WLS, and vesa each-other.
* Support Server push updated network bandwidth and statistic information to Client dynamically.
* WLS MPD median content profile supports the different screen size and bandwidth devices: SD, HD, UD, etc. 
* WLS client will select the correct media content profile according to their screen size and bandwidth, even User-preference.
* WLS MPD exchange between Server and Client can use REST/HTTP/WebSocket, etc, that's angonistic to underlayr transport.
* WLS media content is plain static file, which can be got by plain HTTP/GET.
* WLS media content file normally will play 2 to 10 seconds. 
* WLS client support media content file cache locally.
* Support SubTitle.
* and more ...


## WLS MPD reference definition
* 1. surfix: .json, or .wls, both are JSON stringify file.
* 2. MPD file type: String: wls
* 3. MPD file version: String: x.y.z
* 4. MPD control profile: JSON object:
*  4.a content type: vod/live/tv/; video/audio/subtitle/
*  4.b supported media content profile index: {content-profile-a: index-a, content-profile-b: index-b}
*  4.c 
* 5. MPD content profile: JSON object:
*  

* and more ...


## WLS server reference implementation
* Web server, which can serve static file. Like Node.js, Apache, Nginx, etc.
* WLS MPD generator, which can wrap media content file in WLS MPD content profile with User-defined control profile.
* WLS media content file generator, including VOD, mobile-captured video/audio. Like, ffmpeg, gstreamer, etc.

* and more ...


## WLS client reference implementation
* Web client, which can get MPD file and media content static file over REST/HTTP/WebSocket. Like WebBrowser, etc.
* WLS MPD parser, which can parse MPD json file, and extract media content profile and control profile.
* WLS media player, which can play the individual median content file, like WebBrowser, Android/Expo/MediaPlayer, etc.
* WLS user-control bar, which user can play/pause, adjust volumn, annotation, etc.

* and more ...


### MIT license, copyright@tom zhou, iwebpp@gmail.com
