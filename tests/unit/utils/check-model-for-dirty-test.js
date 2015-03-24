import Ember from 'ember';
import checkModelForDirty from 'ember-cli-dirty-confirm/utils/check-model-for-dirty';
import { module, test } from 'qunit';

var confirm = window.confirm;

module('checkModelForDirty', {
  beforeEach: function() {
    window.confirm = confirm;
  }
});

var ABORT = 0;
var ROLLBACK = 1;
var BUBBLE = 2;

test('!isDirty and !isSaving, BUBBLE', function(assert) {
  var model = Ember.Object.create({
    isDirty: false,
    isSaving: false
  });

  var result = checkModelForDirty(model);

  assert.strictEqual(result, BUBBLE);
});

test('!isDirty and isSaving, BUBBLE', function(assert) {
  var model = Ember.Object.create({
    isDirty: false,
    isSaving: true
  });

  var result = checkModelForDirty(model);

  assert.strictEqual(result, BUBBLE);
});

test('isDirty and isSaving, BUBBLE', function(assert) {
  var model = Ember.Object.create({
    isDirty: true,
    isSaving: true
  });

  var result = checkModelForDirty(model);

  assert.strictEqual(result, BUBBLE);
});

test('continueRollingBack if earlier model in collection was rolled back, ROLLBACK', function(assert) {
  var isRolledBack;
  var model = Ember.Object.create({
    isDirty: true,
    isSaving: false,
    rollback: function() {
      isRolledBack = true;
    }
  });
  var continueRollingBack = true;

  var result = checkModelForDirty(model, null, null, continueRollingBack);

  assert.ok(isRolledBack);
  assert.strictEqual(result, ROLLBACK);
});

test('confirm was confirmed, ROLLBACK', function(assert) {
  var isRolledBack;
  var model = Ember.Object.create({
    isDirty: true,
    isSaving: false,
    rollback: function() {
      isRolledBack = true;
    }
  });
  var continueRollingBack = false;
  window.confirm = function() {
    return true;
  };

  var result = checkModelForDirty(model, null, null, continueRollingBack);

  assert.ok(isRolledBack);
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

  var result = checkModelForDirty(model, null, transition, continueRollingBack);

  assert.ok(isAborted);
  assert.strictEqual(result, ABORT);
});

test('dirtyMessage is undefined, use default', function(assert) {
  var model = Ember.Object.create({
    isDirty: true,
    isSaving: false,
    rollback: function() { }
  });
  var continueRollingBack = false;
  var message;
  window.confirm = function(m) {
    message = m;
    return true;
  };

  checkModelForDirty(model, null, null, continueRollingBack);

  assert.strictEqual(message, 'Leaving this page will lose your changes. Are you sure?');
});

test('dirtyMessage is defined, use dirtyMessage', function(assert) {
  var model = Ember.Object.create({
    isDirty: true,
    isSaving: false,
    rollback: function() { }
  });
  var continueRollingBack = false;
  var message;
  window.confirm = function(m) {
    message = m;
    return true;
  };
  var dirtyMessage = 'this is a dirty message';

  checkModelForDirty(model, dirtyMessage, null, continueRollingBack);

  assert.strictEqual(message, dirtyMessage);
});
