import React from "react";
import HeroVideoDialog from "../magicui/hero-video-dialog";

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
    videoDark: "https://youtu.be/cWppAbqm9I8",
    imageLight: "https://i.ytimg.com/vi/RSL6KqWKFvo/hq720.jpg",
    imageDark: "https://i.ytimg.com/vi/mq2dq_KeV0M/hq720.jpg",
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
