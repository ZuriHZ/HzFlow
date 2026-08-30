import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
import React from "react";

function getYouTubeEmbedUrl(url: string): string {
    try {
        const ytRegex =
            /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\\w-]{11})/;
        const match = url.match(ytRegex);
        if (match && match[1]) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
        return url;
    } catch {
        return url;
    }
}

const videoConfig = {
    videoLight: "https://youtu.be/RSL6KqWKFvo",
    videoDark: "https://www.youtube.com/watch?v=fGyTN5UjnL4",
    imageLight: "https://i.ytimg.com/vi/RSL6KqWKFvo/hq720.jpg",
    imageDark: "https://i.ytimg.com/vi/fGyTN5UjnL4/hq720.jpg",
};

export function HeroVideoDialogDemo() {
    return (
        <div className="relative w-full">
            <HeroVideoDialog
                className="block"
                animationStyle="from-center"
                videoSrc={getYouTubeEmbedUrl(videoConfig.videoDark)}
                thumbnailSrc={videoConfig.imageDark}
                thumbnailAlt="Hero Video"
            />
        </div>
    );
}
