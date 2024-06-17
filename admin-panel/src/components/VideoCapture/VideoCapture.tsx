'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useSockets } from '@/context';
import { EVENTS } from '@/lib';
import { v4 as uuidv4 } from 'uuid';

export const VideoCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { socket } = useSockets();
  const [isLive, setIsLive] = useState<boolean>(false);
  const isLiveRef = useRef<boolean>(false);
  const liveStreamVideoId = useRef<string | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream: MediaStream) => {
        if (videoElement) {
          videoElement.srcObject = stream;

          videoElement.onloadedmetadata = () => {
            videoElement.play().catch((error) => console.error('Error playing video:', error));
          };

          const mediaRecorderOptions = {
            mimeType: 'video/webm; codecs=vp8',
            videoBitsPerSecond: 5000000,
          };
          mediaRecorderRef.current = new MediaRecorder(stream, mediaRecorderOptions);
          mediaRecorderRef.current.ondataavailable = handleDataAvailable;
          mediaRecorderRef.current.start(100);
        }
      })
      .catch((error) => console.error('Error accessing media devices:', error));

    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (videoElement && videoElement.srcObject) {
        (videoElement.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      const streamBlob = event.data;

      if (isLiveRef.current && liveStreamVideoId.current) {
        const reader = new FileReader();
        reader.onload = () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          socket.emit(EVENTS.LIVE_STREAM, {
            chunk: arrayBuffer,
            liveStreamVideoId: liveStreamVideoId.current,
          });
        };
        reader.readAsArrayBuffer(streamBlob);
      }
    }
  };

  const goLive = () => {
    setIsLive(true);
  };

  const stopStreamVideo = () => {
    setIsLive(false);
    socket.emit(EVENTS.STORE_LIVE_STREAM, { liveStreamVideoId: liveStreamVideoId.current });
  };

  useEffect(() => {
    isLiveRef.current = isLive;
    if (isLive) {
      liveStreamVideoId.current = uuidv4();
    } else {
      mediaRecorderRef.current?.stop();
    }
  }, [isLive]);

  return (
    <div className="p-10">
      <video ref={videoRef} width="640" height="480" />
      {isLive ? (
        <button
          onClick={stopStreamVideo}
          className="bg-red-500 mt-2 text-white font-bold py-2 px-4 rounded">
          Stop
        </button>
      ) : (
        <button
          onClick={goLive}
          className="bg-blue-500 mt-2 text-white font-bold py-2 px-4 rounded">
          GO LIVE
        </button>
      )}
    </div>
  );
};
