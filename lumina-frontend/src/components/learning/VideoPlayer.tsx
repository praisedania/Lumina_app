'use client';

import React from 'react';
import { Play } from 'lucide-react';

export interface VideoPlayerProps {
  url: string | null | undefined;
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  if (!url) return null;

  // Extract YouTube ID
  const getYouTubeEmbedUrl = (videoUrl: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?rel=0`
      : null;
  };

  // Extract Vimeo ID
  const getVimeoEmbedUrl = (videoUrl: string): string | null => {
    const match = videoUrl.match(/(?:vimeo)\.com.*(?:videos|video\/|channels\/|)\/([\d]+)/i);
    return match && match[1] ? `https://player.vimeo.com/video/${match[1]}` : null;
  };

  const youtubeEmbed = getYouTubeEmbedUrl(url);
  if (youtubeEmbed) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
        <iframe
          src={youtubeEmbed}
          title="Lesson Video"
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const vimeoEmbed = getVimeoEmbedUrl(url);
  if (vimeoEmbed) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
        <iframe
          src={vimeoEmbed}
          title="Lesson Video"
          className="absolute inset-0 w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Fallback direct HTML5 video
  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
      <video
        src={url}
        controls
        controlsList="nodownload"
        className="w-full h-full object-contain"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
