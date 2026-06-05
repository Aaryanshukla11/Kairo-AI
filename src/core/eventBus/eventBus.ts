import { globalKairoEventBus, KairoEventBus } from './runtime/kairoEventBus';

export { KairoEventBus as EventBus };
export const eventBusInstance = globalKairoEventBus;
