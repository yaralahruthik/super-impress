import {
  getSchedulesDueForPublishing,
  markScheduleProcessing,
  resetStaleProcessingSchedules,
} from "../modules/posts/service";
import { publishQueue } from "./queue";

const POLL_INTERVAL_MS = 30_000;
let timer: ReturnType<typeof setInterval> | null = null;
let hasRecovered = false;

async function recoverStaleJobs(): Promise<void> {
  if (hasRecovered) {
    return;
  }
  hasRecovered = true;

  const resetCount = await resetStaleProcessingSchedules();
  if (resetCount > 0) {
    console.log(`[Scheduler] Reset ${resetCount} stale processing schedules`);
  }
}

async function pollAndEnqueue(): Promise<void> {
  try {
    await recoverStaleJobs();

    const dueSchedules = await getSchedulesDueForPublishing();
    for (const schedule of dueSchedules) {
      const claimed = await markScheduleProcessing(schedule.id);
      if (!claimed) {
        continue;
      }

      await publishQueue.add(
        "publish",
        {
          scheduleId: schedule.id,
          postId: schedule.postId,
          userId: schedule.userId,
          platform: schedule.platform,
          accountId: schedule.accountId,
        },
        { jobId: `schedule-${schedule.id}` }
      );

      console.log(
        `[Scheduler] Enqueued schedule ${schedule.id} for post ${schedule.postId}`
      );
    }
  } catch (error) {
    console.error("[Scheduler] Poll error:", error);
  }
}

export function startScheduler(): void {
  console.log("[Scheduler] Starting poll loop");
  pollAndEnqueue();
  timer = setInterval(pollAndEnqueue, POLL_INTERVAL_MS);
}

export function stopScheduler(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
    console.log("[Scheduler] Stopped");
  }
}
