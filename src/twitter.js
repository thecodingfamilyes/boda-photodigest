import twit from 'twit';

const Twitter = new twit({
    consumer_key: process.env.TWITTER_APP_CONSUMER_KEY || 'foo',
    consumer_secret: process.env.TWITTER_APP_SECRET || 'foo',
    app_only_auth: true,
    timeout_ms: 1000
});

export default Twitter;
