const NodeMediaServer = require('node-media-server');

const config = {
  http: {
    port: 8000,
    allow_origin: '*',
    mediaroot: './media',
  },
  rtmp: {
    port: 1936,
    chunk_size: 60000,
    gop_cache: true,
    ping: 10,
    ping_timeout: 60,
  },
  trans: {
    ffmpeg: '/opt/homebrew/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        hlsKeep: true,
      },
    ],
  },
};

const nms = new NodeMediaServer(config);

nms.on('rtmp_stream_chunk', async (id, StreamPath, chunk) => {
  console.log(
    '[NodeEvent on rtmp_stream_chunk]',
    `id=${id} StreamPath=${StreamPath} chunk length=${chunk.length}`,
  );
});

nms.run();
