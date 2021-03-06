import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {bindCallback} from '../util/bindCallback';

export function _finally<T>(finallySelector: () => void, thisArg?: any) {
  return this.lift(new FinallyOperator(thisArg ?
    <() => void> bindCallback(finallySelector, thisArg, 2) :
    finallySelector));
}

class FinallyOperator<T, R> implements Operator<T, R> {

  finallySelector: () => void;

  constructor(finallySelector: () => void) {
    this.finallySelector = finallySelector;
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new FinallySubscriber(subscriber, this.finallySelector);
  }
}

class FinallySubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<T>, finallySelector: () => void) {
    super(destination);
    this.add(new Subscription(finallySelector));
  }
}
