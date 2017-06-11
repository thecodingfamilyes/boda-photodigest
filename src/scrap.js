import AWS from 'aws-sdk';
import Twitter from './twitter.js';
import Instagram from './instagram.js';
import streamUpload from 's3-upload-stream';
import request from 'request';
import pipeStreams from 'pipe-streams-to-promise';
import md5 from 'md5';

const s3Stream = streamUpload(new AWS.S3());

export default async function Scrap(event, context, callback) {
    if (!event.testing) {
        let photos = [];
        console.log('initializing scrapping for ', process.env.HASHTAG);

        try {
            console.log('fetching from twitter');
            let tweets = await Twitter.get('search/tweets', {
                q: '#' + process.env.HASHTAG,
                count: 100
            });

            tweets = tweets.data.statuses || [];

            if (tweets.length) {
                console.log(tweets.length + ' tweets found');

                tweets.forEach((tweet) => {
                    if (tweet.entities.media.length) {
                        tweet.entities.media.forEach((m) => {
                            if (m.type == 'photo') {
                                photos.push(m.media_url_https);
                            }
                        });
                    }
                });
            } else {
                console.log('no tweets found');
            }

            console.log('fetching instagram');
            const Inst = new Instagram();
            let instaposts = await Inst.searchBy('hashtag', process.env.HASHTAG);

            if (instaposts.entry_data.TagPage.length) {
                instaposts.entry_data.TagPage.forEach((tp) => {
                    if (tp.tag.media.nodes && tp.tag.media.nodes.length) {
                        console.log(tp.tag.media.nodes.length + ' instagram posts found');
                        tp.tag.media.nodes.forEach((node) => {
                            if (!node.is_video) {
                                photos.push(node.display_src);
                            }
                        });
                    }
                });
            }
        } catch (err) {
            console.error(err);
        }

        if (photos.length) {
            console.log('uploading '+ photos.length + ' photos to s3');
            const bucket = process.env.S3_BUCKET;

            photos.forEach(async (photo) => {
                let upload = s3Stream.upload({
                    Bucket: bucket,
                    Key: 'large/' + md5(photo) + '.jpg',
                    ACL: "public-read",
                    ContentType: 'image/jpeg'
                });

                console.log('uploading ' + photo);

                try {
                    await pipeStreams([request(photo), upload]);
                    console.log('photo successfully uploaded');
                } catch (err) {
                    console.error('failed to upload photo to s3', err);
                }
            });
        }
    }

	callback(null, 'scrapping finished');
}
