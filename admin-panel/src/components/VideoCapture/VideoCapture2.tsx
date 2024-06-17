'use client';

import { socket } from '@/context';
import { EVENTS } from '@/lib';
import React, { useEffect, useRef, useState } from 'react';
import { NIL, v4 as uuidv4 } from 'uuid';

export const VideoCapture2: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const liveStreamVideoId = useRef<string | null>(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: 'video/webm; codecs=vp8',
        });

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0 && liveStreamVideoId.current) {
            socket.emit(EVENTS.LIVE_STREAM, {
              chunk: event.data,
              liveStreamVideoId: liveStreamVideoId.current,
            });
          }
        };
      } catch (error) {
        console.error('Error accessing media devices.', error);
      }
    };

    startVideo();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();

        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    if (mediaRecorderRef.current) {
      liveStreamVideoId.current = uuidv4();
      mediaRecorderRef.current.start(100);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      socket.emit(EVENTS.STORE_LIVE_STREAM, { liveStreamVideoId: liveStreamVideoId.current });
      mediaRecorderRef.current.stop();
      liveStreamVideoId.current = null;
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: 'auto' }} />
      <div>
        {isRecording ? (
          <button onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button onClick={startRecording}>Start Recording</button>
        )}
      </div>
    </div>
  );
};
