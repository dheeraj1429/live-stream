"use client";

import React, { useRef, useEffect } from "react";

export const VideoCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const urlRef = useRef<string | null>(null);
  const recodedVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoElement) {
          videoElement.srcObject = stream;

          videoElement.onloadedmetadata = () => {
            videoElement.play().catch((error) => console.error("Error playing video:", error));
          };

          mediaRecorderRef.current = new MediaRecorder(stream);
          mediaRecorderRef.current.onstop = handleRecordingStopped;
          mediaRecorderRef.current.ondataavailable = handleDataAvailable;

          mediaRecorderRef.current.start(1000);
        }
      })
      .catch((error) => console.error("Error accessing media devices:", error));

    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        chunksRef.current = [];
      }
      if (videoElement && videoElement.srcObject) {
        (videoElement.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      chunksRef.current.push(event.data);
      if (!urlRef.current) {
        const combinedBlob = new Blob(chunksRef.current, { type: "video/webm" });
        urlRef.current = URL.createObjectURL(combinedBlob);
        if (recodedVideoRef.current) {
          recodedVideoRef.current.src = urlRef.current;
          recodedVideoRef.current.play();
        }
      }
    }
  };

  const handleRecordingStopped = () => {
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    console.log("Recorded video:", url);
  };

  return (
    <div>
      <video ref={videoRef} width="640" height="480" />
      <div>
        <h2>Recorded Video</h2>
        <video controls ref={recodedVideoRef}>
          <source src={urlRef.current || ""} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};
