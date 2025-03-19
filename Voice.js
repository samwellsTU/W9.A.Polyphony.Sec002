export default class Voice {
  constructor(ctx, freq, out) {
    //things that need to happen on initialization
    this.context = ctx;
    this.frequency = freq;
    this.output = out;

    //defining ADSR Params
    this.attack = 0.2;
    this.decay = 0.5;
    this.sustain = 0.125;
    this.release = 0.5;
  }
  start() {
    //ADD IN ADS part of ADSR to start

    //things that need to happen when we start a note
    let now = this.context.currentTime;
    //made our osc
    this.osc = this.context.createOscillator();
    this.osc.frequency.setValueAtTime(this.frequency, now);
    this.osc.onended = this.dispose.bind(this);

    //made our osc
    this.osc2 = this.context.createOscillator();
    this.osc2.frequency.setValueAtTime((this.frequency * 7) / 3, now);
    this.osc2.type = "sawtooth";
    // this.osc2.onended = this.dispose.bind(this);

    //make a gain node for Amp Envelope
    this.ampEnv = this.context.createGain();
    //initialize envelope
    this.ampEnv.gain.setValueAtTime(0, now);

    //make connections
    this.osc.connect(this.ampEnv);
    this.osc2.connect(this.ampEnv);
    this.ampEnv.connect(this.output);

    //start osc
    this.osc.start();
    this.osc2.start();

    //attack stage
    this.ampEnv.gain.linearRampToValueAtTime(1, now + this.attack);
    //decay
    this.ampEnv.gain.linearRampToValueAtTime(
      this.sustain,
      now + this.attack + this.decay
    );
  }
  stop() {
    //add in R part of ADSR to stop
    let now = this.context.currentTime;

    //cancel exisitng ramps
    this.ampEnv.gain.cancelScheduledValues(now);

    //set current value
    this.ampEnv.gain.setValueAtTime(this.ampEnv.gain.value, now);

    //release
    this.ampEnv.gain.linearRampToValueAtTime(0, now + this.release);

    this.osc.stop(now + this.release + 0.01);
    this.osc2.stop(now + this.release + 0.01);
    //things that need to happen to stop the note
  }
  dispose() {
    //what should happen when you are done with all the audio stuff
    this.osc.disconnect();
    this.ampEnv.disconnect();

    this.osc = null;
    this.ampEnv = null;
  }
}
