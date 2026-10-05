import { Service } from '@angular/core';
import { EventLogBuffer } from '../../shared/event-log/event-log';

/** Root-level log that outlives the feature services it records. */
@Service()
export class LifecycleLogStore extends EventLogBuffer {
  constructor() {
    super(60);
  }
}
