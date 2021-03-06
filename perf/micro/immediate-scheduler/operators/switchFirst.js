var RxOld = require('rx');
var RxNew = require('../../../../index');

var source = Array.apply(null, { length: 25 });

module.exports = function (suite) {
  var oldMergeAllWithImmediateScheduler = RxOld.Observable.fromArray(
    source.map(function () { return RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate); }),
    RxOld.Scheduler.immediate
  )
    .switchFirst();
  var newMergeAllWithImmediateScheduler = RxNew.Observable.fromArray(
    source.map(function () { return RxNew.Observable.range(0, 25); })
  )
    .switchFirst();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old switchFirst with immediate scheduler', function () {
      oldMergeAllWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new switchFirst with immediate scheduler', function () {
      newMergeAllWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
