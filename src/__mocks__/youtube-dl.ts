import { createReadStream } from "fs";
import { PassThrough } from "stream";

const youtubeDl: any = (url: string, params: string[], options: any) => {
    if (url.indexOf("error") !== -1) {
        const stream = new PassThrough();
        setTimeout(() => stream.emit("error", new Error("Something went wrong.")), 100);
        return stream;
    }
    if (url.indexOf("garbage") !== -1) {
        return createReadStream(`${__dirname}/../__fixtures__/garbage`);
    }
    return createReadStream(`${__dirname}/../__fixtures__/test.mp3`);
};

const getInfo = (url: string, params: any[], callback: any) => {
    if (url.indexOf("broken") !== -1) {
        setTimeout(() => {
            callback(new Error("Something went wrong."));
        }, 100);
    } else  {
        setTimeout(() => {
            callback(undefined, {
                id: "some-video-id",
                title: "Some video",
                url,
                thumbnail: "http://example.com/thumbnail.jpg",
                description: "This is some video from youtube.",
                _filename: "/tmp/some-video.flv",
                format_id: 999,
            });
        }, 100);
    }
};

youtubeDl.getInfo = getInfo;

export = youtubeDl;
