type JobDataType = () => void;

export class QueueWork {
  jobList: Array<JobDataType> = [];
  isWorking = false;

  addJob(data: JobDataType) {
    this.jobList.push(data);
    if (!this.isWorking) {
      this.workJob();
    }
  }

  async workJob() {
    this.isWorking = true;
    while (this.jobList.length > 0) {
      const currentJob = this.jobList[0];
      await this.todo(currentJob);
      await this.sleep(1500);
      this.jobList.shift();
    }
    this.isWorking = false;
  }

  async todo(_task: JobDataType) {
    await _task();
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
