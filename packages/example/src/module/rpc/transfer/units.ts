export const waitVideoReady = <T extends HTMLVideoElement>(video: T) =>
  new Promise<T>((resolve) => {
    const check = () => {
      if (
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        resolve(video)
      }
    }

    check()

    video.addEventListener('loadeddata', check, { once: true })
    video.addEventListener('canplay', check, { once: true })
  })
