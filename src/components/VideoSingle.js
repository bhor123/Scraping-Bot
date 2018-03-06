import React from 'react';
import axios from 'axios';
import moment from 'moment';
import VideoCard from './VideoCard';
import Comment from './Comment';
import Loader from './Loader';

class VideoSingle extends React.Component {
  constructor(props) {
    super(props);

    this.videoId = props.videoId;
    this.apiVideos = `https://www.googleapis.com/youtube/v3/videos`;
    this.apiSearch = `https://www.googleapis.com/youtube/v3/search`;
    this.apiComments = `https://www.googleapis.com/youtube/v3/commentThreads`;
    this.apiKey = `AIzaSyBeimXtjgzfQcogY-fP8_CHPybmLpFaieo`;
    this.videoUrl = `${this.apiVideos}?key=${this.apiKey}&id=${
      this.videoId
    }&part=contentDetails,player,snippet,statistics`;

    this.commentsUrl = `${this.apiComments}?key=${this.apiKey}&videoId=${
      this.videoId
    }&part=id,snippet`;

    this.state = {
      id: this.videoId,
      videosUrl: this.videoUrl,
      video: {},
      channelVideosUrl: ``,
      channelVideos: [],
      comments: [],
    };

    this.getVideo = this.getVideo.bind(this);
    this.onVideoLoad = this.onVideoLoad.bind(this);
  }

  componentDidMount() {
    this.getVideo();
  }

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  getVideo() {
    axios
      .get(this.videoUrl)
      .then(response => {
        if (response.status !== 200) {
          throw new Error('Uh oh, something went wrong');
        }

        const video = response.data.items[0];
        this.setState({
          video: video,
          channelVideosUrl: `${this.apiSearch}?key=${this.apiKey}&channelId=${
            video.snippet.channelId
          }&part=snippet,id&order=date`,
        });
      })
      .then(response => {
        this.onVideoLoad();
      });
  }

  getChannelVideos() {
    return axios.get(this.state.channelVideosUrl);
  }

  getComments() {
    return axios.get(this.commentsUrl);
  }

  onVideoLoad() {
    const _this = this;
    axios.all([_this.getChannelVideos(), _this.getComments()]).then(
      axios.spread((videos, comments) => {
        if (videos.status !== 200 || comments.status !== 200) {
          throw new Error('Uh oh, something went wrong');
        }
        _this.setState({
          channelVideos: videos.data.items,
          comments: comments.data.items,
        });
      })
    );
  }

  render() {
    const { player, snippet, statistics } = this.state.video;

    return snippet ? (
      <div className="VideoSingle">
        <div className="VideoSingle__main">
          <div
            className="VideoSingle__player"
            dangerouslySetInnerHTML={{
              __html: player.embedHtml,
            }}
          />
          <div className="VideoSingle__details">
            <h1 className="VideoSingle__title">{snippet.title}</h1>
            <div className="VideoSingle__detail-wrapper">
              <div className="VideoSingle__channel">{snippet.channelTitle}</div>
              <div className="VideoSingle__views">
                {this.numberWithCommas(statistics.viewCount)} Views
              </div>
            </div>
            <div className="VideoSingle__published">
              Published on {moment(snippet.publishedAt).format('MMMM D, YYYY')}
            </div>
            <p className="VideoSingle__description">{snippet.description}</p>
          </div>
          {this.state.comments.length ? (
            <div className="VideoSingle__comments">
              <h3>Comments</h3>
              {this.state.comments.map((item, index) => (
                <Comment key={index} video={item} />
              ))}
            </div>
          ) : (
            <Loader />
          )}
        </div>

        {this.state.channelVideos.length ? (
          <div className="VideoSingle__channelvids">
            <h2>Other videos from this channel</h2>
            {this.state.channelVideos.map((item, index) => (
              <VideoCard key={index} video={item} />
            ))}
          </div>
        ) : (
          <Loader />
        )}
      </div>
    ) : (
      <Loader />
    );
  }
}

export default VideoSingle;
