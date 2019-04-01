// We could turn this into singleton ECS component to make it
// easily injectable. Probably not needed needed now
export interface FrameTimings {
  // previous -> this frame
  deltaTimeMs: number;

  // time elapsed since app start
  absoluteTimeMs: number;

  // id of current frame counting from app start
  aboluteFrameId: number;
}


export class TimingSystem {

  public readonly frameTimings: FrameTimings = {
    deltaTimeMs: 0,
    absoluteTimeMs: 0,
    aboluteFrameId: 0,
  };

  update (timeMs: number) {
    const {absoluteTimeMs} = this.frameTimings;

    this.frameTimings.deltaTimeMs = timeMs - absoluteTimeMs;
    this.frameTimings.absoluteTimeMs = timeMs;
    ++this.frameTimings.aboluteFrameId;
  }

}
