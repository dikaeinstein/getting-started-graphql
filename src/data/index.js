const videoA = {
  id: "a",
  title: "Create a graphql schema",
  duration: 120,
  watched: true
};

const videoB = {
  id: "b",
  title: "ReactJS CLI",
  duration: 240,
  watched: false
};

const videos = [videoA, videoB];

const getVideoById = id => new Promise((resolve) => {
  const [video] = videos.filter((video) => {
    return video.id === id;
  });

  return resolve(video);
});

const getVideos = () => new Promise(resolve => resolve(videos));

const createVideo = ({title, duration, watched}) => {
  const video = {
    id: Buffer.from(title).toString('base64'),
    title,
    duration,
    watched,
  };

  videos.push(video); // Add new video to in-memory videos array

  return video;
};

const getObjectById = (type, id) => {
  const types = {
    video: getVideoById,
  };
  return types[type.toLowerCase()](id);
};

module.exports = { getVideoById, getVideos, createVideo, getObjectById };
