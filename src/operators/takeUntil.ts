import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {noop} from '../util/noop';

export function takeUntil<T>(notifier: Observable<any>) {
  return this.lift(new TakeUntilOperator(notifier));
}

class TakeUntilOperator<T, R> implements Operator<T, R> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new TakeUntilSubscriber(subscriber, this.notifier);
  }
}

class TakeUntilSubscriber<T> extends Subscriber<T> {
  private notificationSubscriber: TakeUntilInnerSubscriber<any> = null;

  constructor(destination: Subscriber<T>,
              private notifier: Observable<any>) {
    super(destination);
    this.notificationSubscriber = new TakeUntilInnerSubscriber(destination);
    this.add(notifier.subscribe(this.notificationSubscriber));
  }

  _complete(): void {
    this.destination.complete();
    this.notificationSubscriber.unsubscribe();
  }
}

class TakeUntilInnerSubscriber<T> extends Subscriber<T> {
  constructor(protected destination: Subscriber<T>) {
    super(null);
  }

  _next(unused: T): void {
    this.destination.complete();
  }

  _error(err: any): void {
    this.destination.error(err);
  }

  _complete(): void {
    noop();
  }
}