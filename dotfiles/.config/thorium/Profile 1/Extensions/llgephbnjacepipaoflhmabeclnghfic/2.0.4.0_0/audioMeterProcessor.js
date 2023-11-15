class AudioMeterProcessor extends AudioWorkletProcessor {

  constructor() {
    super();
    this.volume = 0;
    this.updateIntervalInMs = 25;
    this.smoothingFactor = 0.8;
    this.nextUpdateFrame = this.updateIntervalInMs;

  }

  get intervalInFrames() {
    // sampleRate is available in the AudioWorkletGlobalScope
    return this.updateIntervalInMs / 1000 * sampleRate; // eslint-disable-line no-undef
  }

  process(inputs) {
    const input = inputs[0];

    // Note that the input will be down-mixed to mono; however, if no inputs are
    // connected then zero channels will be passed in.
    if (input.length > 0) {
      const samples = input[0];
      let sum = 0;

      // Calculated the squared-sum.
      for (let i = 0; i < samples.length; ++i)
        sum += samples[i] * samples[i];

      // Calculate the RMS level and update the volume.
      let rms = Math.sqrt(sum / samples.length);

      if (rms === 0) {
        // Immediately set the volume to 0 when signal is zero. This is needed for
        // not posting a positive volume when the signal is zero but there is still a volume
        // from the last conntected input.
        this.volume = 0;
      } else {
        this.volume = Math.max(rms, this.volume * this.smoothingFactor);
      }


      // Update and sync the volume property with the main thread.
      this.nextUpdateFrame -= samples.length;
      if (this.nextUpdateFrame < 0) {
        this.nextUpdateFrame += this.intervalInFrames;
        this.port.postMessage({ volume: this.volume });
      }
    }
    return true;
  }

}

// you also need to register your class so that it can be intanciated from the main thread
registerProcessor('audio-meter-processor', AudioMeterProcessor);