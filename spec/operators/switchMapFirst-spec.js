/* globals describe, it, expect, hot, cold, expectObservable, expectSubscriptions */
var Rx = require('../../dist/cjs/Rx');
var Promise = require('promise');

var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

describe('Observable.prototype.switchMapFirst()', function () {
  it('should handle outer throw', function () {
    var x = cold('--a--b--c--|');
    var xsubs = [];
    var e1 = Observable.throw('damn');
    var expected = '#';
    expectObservable(e1.switchMapFirst(function () { return x; })).toBe(expected, null, 'damn');
    expectSubscriptions(x.subscriptions).toBe(xsubs);
  });

  it('should handle outer empty', function () {
    var x = cold('--a--b--c--|');
    var xsubs = [];
    var e1 = Observable.empty();
    var expected = '|';
    expectObservable(e1.switchMapFirst(function () { return x; })).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
  });

  it('should handle outer never', function () {
    var x = cold('--a--b--c--|');
    var xsubs = [];
    var e1 = Observable.never();
    var expected = '-';
    expectObservable(e1.switchMapFirst(function () { return x; })).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
  });

  it('should switch with a selector function', function () {
    var x = cold(     '--a--b--c--|                              ');
    var xsubs =    '   ^          !                              ';
    var y = cold(               '--d--e--f--|                    ');
    var ysubs = [];
    var z = cold(                                 '--g--h--i--|  ');
    var zsubs =    '                               ^          !  ';
    var e1 =   hot('---x---------y-----------------z-------------|');
    var expected = '-----a--b--c---------------------g--h--i-----|';

    var observableLookup = { x: x, y: y, z: z };

    expectObservable(e1.switchMapFirst(function (value) {
      return observableLookup[value];
    })).toBe(expected);

    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
  });

  it('should switch inner cold observables, outer is unsubscribed early', function () {
    var x = cold(     '--a--b--c--|                              ');
    var xsubs =    '   ^          !                              ';
    var y = cold(               '--d--e--f--|                    ');
    var ysubs = [];
    var z = cold(                                 '--g--h--i--|  ');
    var zsubs =    '                               ^  !          ';
    var e1 =   hot('---x---------y-----------------z-------------|');
    var unsub =    '                                  !          ';
    var expected = '-----a--b--c---------------------g';

    var observableLookup = { x: x, y: y, z: z };

    expectObservable(e1.switchMapFirst(function (value) {
      return observableLookup[value];
    }), unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
  });

  it('should switch inner cold observables, inner never completes', function () {
    var x = cold(     '--a--b--c--|                              ');
    var xsubs =    '   ^          !                              ';
    var y = cold(               '--d--e--f--|                    ');
    var ysubs = [];
    var z = cold(                                 '--g--h--i-----');
    var zsubs =    '                               ^             ';
    var e1 =   hot('---x---------y-----------------z---------|   ');
    var expected = '-----a--b--c---------------------g--h--i-----';

    var observableLookup = { x: x, y: y, z: z };

    expectObservable(e1.switchMapFirst(function (value) {
      return observableLookup[value];
    })).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
  });

  it('should handle a synchronous switch an stay on the first inner observable', function () {
    var x =   cold(         '--a--b--c--d--e--|   ');
    var xsubs =    '         ^                !   ';
    var y =   cold(         '---f---g---h---i--|  ');
    var ysubs = [];
    var e1 =   hot('---------(xy)----------------|');
    var expected = '-----------a--b--c--d--e-----|';

    var observableLookup = { x: x, y: y };

    expectObservable(e1.switchMapFirst(function (value) {
      return observableLookup[value];
    })).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should switch inner cold observables, one inner throws', function () {
    var x =   cold(         '--a--b--c--d--#--e--|');
    var xsubs =    '         ^             !      ';
    var y =   cold(                   '---f---g---h---i--');
    var ysubs = [];
    var e1 =   hot('---------x---------y---------|');
    var expected = '-----------a--b--c--d--#';

    var observableLookup = { x: x, y: y };

    expectObservable(e1.switchMapFirst(function (value) {
      return observableLookup[value];
    })).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should switch inner hot observables', function () {
    var x =    hot('-----a--b--c--d--e--|');
    var xsubs =    '         ^          !';
    var y =    hot('--p-o-o-p-------f---g---h---i--|');
    var ysubs =  [];
    var z =    hot('---z-o-o-m-------------j---k---l---m--|');
    var zsubs =    '                    ^                 !';
    var e1 =   hot('---------x----y-----z--------|');
    var expected = '-----------c--d--e-----j---k---l---m--|';

    var observableLookup = { x: x, y: y, z: z };

    expectObservable(e1.switchMapFirst(function (value) {
      return observableLookup[value];
    })).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
  });

  it('should switch inner empty and empty', function () {
    var x = cold('|');
    var y = cold('|');
    var xsubs =    '         (^!)';
    var ysubs =    '                   (^!)';
    var e1 =   hot('---------x---------y---------|');
    var expected = '-----------------------------|';

    var observableLookup = { x: x, y: y };

    expectObservable(e1.switchMapFirst(function (value) {
      return observableLookup[value];
    })).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should switch inner empty and never', function () {
    var x = cold('|');
    var y = cold('-');
    var xsubs =    '         (^!)                  ';
    var ysubs =    '                   ^           ';
    var e1 =   hot('---------x---------y---------|');
    var expected = '----------------------------------';

    var observableLookup = { x: x, y: y };

    expectObservable(e1.switchMapFirst(function (value) {
      return observableLookup[value];
    })).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should never switch inner never', function () {
    var x = cold('-');
    var y = cold('#', null, 'sad');
    var xsubs =    '         ^                     ';
    var ysubs = [];
    var e1 =   hot('---------x---------y----------|');
    var expected = '-------------------------------';

    var observableLookup = { x: x, y: y };

    expectObservable(e1.switchMapFirst(function (value) {
      return observableLookup[value];
    })).toBe(expected, undefined, 'sad');
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should switch inner empty and throw', function () {
    var x = cold('|');
    var y = cold('#', null, 'sad');
    var xsubs =    '         (^!)                  ';
    var ysubs =    '                   (^!)        ';
    var e1 =   hot('---------x---------y---------|');
    var expected = '-------------------#';

    var observableLookup = { x: x, y: y };

    expectObservable(e1.switchMapFirst(function (value) {
      return observableLookup[value];
    })).toBe(expected, undefined, 'sad');
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle outer error', function () {
    var x =   cold(         '--a--b--c--d--e--|');
    var xsubs =    '         ^         !';
    var e1 =   hot('---------x---------#', undefined, new Error('boo-hoo'));
    var expected = '-----------a--b--c-#';

    var observableLookup = { x: x };

    expectObservable(e1.switchMapFirst(function (value) {
      return observableLookup[value];
    })).toBe(expected, undefined, new Error('boo-hoo'));
    expectSubscriptions(x.subscriptions).toBe(xsubs);
  });

  it('should switch with resultSelector goodness', function () {
    var x =   cold(  '--a--b--c--d--e-|');
    var xsubs =    '  ^               !';
    var y =   cold(            '---f---g---h---i--|');
    var ysubs = [];
    var z =   cold(                   '---k---l---m---n--|');
    var zsubs =    '                   ^                 !';
    var e1 =   hot('--x---------y------z-|');
    var expected = '----a--b--c--d--e-----k---l---m---n--|';

    var observableLookup = { x: x, y: y, z: z };

    var expectedValues = {
      a: ['x', 'a', 0, 0],
      b: ['x', 'b', 0, 1],
      c: ['x', 'c', 0, 2],
      d: ['x', 'd', 0, 3],
      e: ['x', 'e', 0, 4],
      k: ['z', 'k', 1, 0],
      l: ['z', 'l', 1, 1],
      m: ['z', 'm', 1, 2],
      n: ['z', 'n', 1, 3],
    };

    expectObservable(e1.switchMapFirst(function (value) {
      return observableLookup[value];
    }, function (innerValue, outerValue, innerIndex, outerIndex) {
      return [innerValue, outerValue, innerIndex, outerIndex];
    })).toBe(expected, expectedValues);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
  });
});
