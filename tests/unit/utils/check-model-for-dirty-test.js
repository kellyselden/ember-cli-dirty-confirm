import Ember from 'ember';
import checkModelForDirty from 'ember-cli-dirty-confirm/utils/check-model-for-dirty';
import { module, test } from 'qunit';
import sinon from 'sinon';

const {
  Object: emberObject,
  A: newArray
} = Ember;

const ABORT = 0;
const ROLLBACK = 1;
const BUBBLE = 2;

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
  let model = emberObject.create({
    isDirty: false,
    isSaving: false
  });

  let result = checkModelForDirty(model, []);

  assert.strictEqual(result, BUBBLE);
});

test('!isDirty and isSaving, BUBBLE', function(assert) {
  let model = emberObject.create({
    isDirty: false,
    isSaving: true
  });

  let result = checkModelForDirty(model, []);

  assert.strictEqual(result, BUBBLE);
});

test('isDirty and isSaving, BUBBLE', function(assert) {
  let model = emberObject.create({
    isDirty: true,
    isSaving: true
  });

  let result = checkModelForDirty(model, []);

  assert.strictEqual(result, BUBBLE);
});

test('continueRollingBack if earlier model in collection was rolled back, ROLLBACK', function(assert) {
  let rollback = sandbox.spy();
  let model = emberObject.create({
    isDirty: true,
    isSaving: false,
    rollback
  });
  let continueRollingBack = true;

  let result = checkModelForDirty(model, [], null, null, continueRollingBack);

  assert.deepEqual(rollback.args, [[]]);
  assert.strictEqual(result, ROLLBACK);
});

test('confirm was confirmed, ROLLBACK', function(assert) {
  let rollback = sandbox.spy();
  let model = emberObject.create({
    isDirty: true,
    isSaving: false,
    rollback
  });
  let continueRollingBack = false;
  confirmStub.returns(true);

  let result = checkModelForDirty(model, [], null, null, continueRollingBack);

  assert.deepEqual(rollback.args, [[]]);
  assert.strictEqual(result, ROLLBACK);
});

test('confirm was canceled, ABORT', function(assert) {
  let model = emberObject.create({
    isDirty: true,
    isSaving: false
  });
  let abort = sandbox.spy();
  let transition = emberObject.create({
    abort
  });
  let continueRollingBack = false;
  confirmStub.returns(false);

  let result = checkModelForDirty(model, [], null, transition, continueRollingBack);

  assert.deepEqual(abort.args, [[]]);
  assert.strictEqual(result, ABORT);
});

test('model is dirty, show dirtyMessage', function(assert) {
  let model = emberObject.create({
    isDirty: true,
    isSaving: false,
    rollback() { }
  });
  let continueRollingBack = false;
  confirmStub.returns(true);
  let dirtyMessage = 'this is a dirty message';

  checkModelForDirty(model, [], dirtyMessage, null, continueRollingBack);

  assert.deepEqual(confirmStub.args, [[dirtyMessage]]);
});

test('relationship is dirty, model is not', function(assert) {
  let rollbackModel = sandbox.spy();
  let rollbackRelationship = sandbox.spy();
  let model = emberObject.create({
    rollback: rollbackModel,
    test: emberObject.create({
      isDirty: true,
      rollback: rollbackRelationship
    })
  });
  confirmStub.returns(true);

  checkModelForDirty(model, ['test']);

  assert.deepEqual(rollbackModel.args, []);
  assert.deepEqual(rollbackRelationship.args, [[]]);
});

test('both model and relationship are dirty', function(assert) {
  let rollbackModel = sandbox.spy();
  let rollbackRelationship = sandbox.spy();
  let model = emberObject.create({
    isDirty: true,
    rollback: rollbackModel,
    test: emberObject.create({
      isDirty: true,
      rollback: rollbackRelationship
    })
  });
  confirmStub.returns(true);

  checkModelForDirty(model, ['test']);

  assert.deepEqual(rollbackModel.args, [[]]);
  assert.deepEqual(rollbackRelationship.args, [[]]);
});

test('model is dirty, relationship is not', function(assert) {
  let rollbackModel = sandbox.spy();
  let rollbackRelationship = sandbox.spy();
  let model = emberObject.create({
    isDirty: true,
    rollback: rollbackModel,
    test: emberObject.create({
      rollback: rollbackRelationship
    })
  });
  confirmStub.returns(true);

  checkModelForDirty(model, ['test']);

  assert.deepEqual(rollbackModel.args, [[]]);
  assert.deepEqual(rollbackRelationship.args, []);
});

test('model relationship of type array has dirty item', function(assert) {
  let rollRelationshipBack = sandbox.spy();

  function createRollBackItem(isDirty) {
    return emberObject.create({
      isDirty,
      rollback: rollRelationshipBack
    });
  }

  let children = newArray([
    createRollBackItem(false),
    createRollBackItem(true),
    createRollBackItem(true),
    createRollBackItem(false),
    createRollBackItem(true)
  ]);

  let model = emberObject.create({
    isDirty: false,
    isSaving: false,
    rollback() {},
    test: children
  });

  checkModelForDirty(model, ['test'], null, null, true);
  assert.equal(children.filterBy('isDirty').length, rollRelationshipBack.callCount);
});
