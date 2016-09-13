import Ember from 'ember';
import checkModelForDirty from 'ember-cli-dirty-confirm/utils/check-model-for-dirty';
import { module, test } from 'qunit';
import sinon from 'sinon';

var ABORT = 0;
var ROLLBACK = 1;
var BUBBLE = 2;

let sandbox;
let confirmStub;

module('checkModelForDirty', {
  beforeEach() {
    sandbox = sinon.sandbox.create();

    confirmStub = sandbox.stub(window, 'confirm');
  },
  afterEach() {
    sandbox.restore();
  }
});

test('!isDirty and !isSaving, BUBBLE', function(assert) {
  var model = Ember.Object.create({
    isDirty: false,
    isSaving: false
  });

  var result = checkModelForDirty(model, []);

  assert.strictEqual(result, BUBBLE);
});

test('!isDirty and isSaving, BUBBLE', function(assert) {
  var model = Ember.Object.create({
    isDirty: false,
    isSaving: true
  });

  var result = checkModelForDirty(model, []);

  assert.strictEqual(result, BUBBLE);
});

test('isDirty and isSaving, BUBBLE', function(assert) {
  var model = Ember.Object.create({
    isDirty: true,
    isSaving: true
  });

  var result = checkModelForDirty(model, []);

  assert.strictEqual(result, BUBBLE);
});

test('continueRollingBack if earlier model in collection was rolled back, ROLLBACK', function(assert) {
  var wasRollbackCalled;
  var model = Ember.Object.create({
    isDirty: true,
    isSaving: false,
    rollback: function() {
      wasRollbackCalled = true;
    }
  });
  var continueRollingBack = true;

  var result = checkModelForDirty(model, [], null, null, continueRollingBack);

  assert.ok(wasRollbackCalled);
  assert.strictEqual(result, ROLLBACK);
});

test('confirm was confirmed, ROLLBACK', function(assert) {
  var wasRollbackCalled;
  var model = Ember.Object.create({
    isDirty: true,
    isSaving: false,
    rollback: function() {
      wasRollbackCalled = true;
    }
  });
  var continueRollingBack = false;
  confirmStub.returns(true);

  var result = checkModelForDirty(model, [], null, null, continueRollingBack);

  assert.ok(wasRollbackCalled);
  assert.strictEqual(result, ROLLBACK);
});

test('confirm was canceled, ABORT', function(assert) {
  var model = Ember.Object.create({
    isDirty: true,
    isSaving: false
  });
  var isAborted;
  var transition = Ember.Object.create({
    abort: function() {
      isAborted = true;
    }
  });
  var continueRollingBack = false;
  confirmStub.returns(false);

  var result = checkModelForDirty(model, [], null, transition, continueRollingBack);

  assert.ok(isAborted);
  assert.strictEqual(result, ABORT);
});

test('model is dirty, show dirtyMessage', function(assert) {
  var model = Ember.Object.create({
    isDirty: true,
    isSaving: false,
    rollback: function() { }
  });
  var continueRollingBack = false;
  confirmStub.returns(true);
  var dirtyMessage = 'this is a dirty message';

  checkModelForDirty(model, [], dirtyMessage, null, continueRollingBack);

  assert.deepEqual(confirmStub.args, [[dirtyMessage]]);
});

test('relationship is dirty, model is not', function(assert) {
  var wasRollbackCalledOnModel, wasRollbackCalledOnRelationship;
  var model = Ember.Object.create({
    rollback: function() {
      wasRollbackCalledOnModel = true;
    },
    test: Ember.Object.create({
      isDirty: true,
      rollback: function() {
        wasRollbackCalledOnRelationship = true;
      }
    })
  });
  confirmStub.returns(true);

  checkModelForDirty(model, ['test']);

  assert.ok(!wasRollbackCalledOnModel);
  assert.ok(wasRollbackCalledOnRelationship);
});

test('both model and relationship are dirty', function(assert) {
  var wasRollbackCalledOnModel, wasRollbackCalledOnRelationship;
  var model = Ember.Object.create({
    isDirty: true,
    rollback: function() {
      wasRollbackCalledOnModel = true;
    },
    test: Ember.Object.create({
      isDirty: true,
      rollback: function() {
        wasRollbackCalledOnRelationship = true;
      }
    })
  });
  confirmStub.returns(true);

  checkModelForDirty(model, ['test']);

  assert.ok(wasRollbackCalledOnModel);
  assert.ok(wasRollbackCalledOnRelationship);
});

test('model is dirty, relationship is not', function(assert) {
  var wasRollbackCalledOnModel, wasRollbackCalledOnRelationship;
  var model = Ember.Object.create({
    isDirty: true,
    rollback: function() {
      wasRollbackCalledOnModel = true;
    },
    test: Ember.Object.create({
      rollback: function() {
        wasRollbackCalledOnRelationship = true;
      }
    })
  });
  confirmStub.returns(true);

  checkModelForDirty(model, ['test']);

  assert.ok(wasRollbackCalledOnModel);
  assert.ok(!wasRollbackCalledOnRelationship);
});

test('model relationship of type array has dirty item', function(assert) {
  var rollBackCount = 0;
  var dirtyItems = 0;

  var rollRelationshipBack = function() {
    rollBackCount += 1;
  };

  var createRollBackItem = function(isDirty) {
    if (isDirty) {
      dirtyItems += 1;
    }

    return Ember.Object.create({
      isDirty: isDirty,
      rollback: rollRelationshipBack
    });
  };

  var children = [
    createRollBackItem(false),
    createRollBackItem(true),
    createRollBackItem(true),
    createRollBackItem(false),
    createRollBackItem(true)
  ];

  var model = Ember.Object.create({
    isDirty: false,
    isSaving: false,
    rollback: function() {},
    test: children
  });

  checkModelForDirty(model, ['test'], null, null, true);
  assert.equal(dirtyItems, rollBackCount);
});
