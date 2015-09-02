import Ember from 'ember';
import DirtyConfirmRouteMixin from 'ember-cli-dirty-confirm/mixins/dirty-confirm-route';
import { module, test } from 'qunit';

var ABORT = 0;
var ROLLBACK = 1;
var BUBBLE = 2;

var route;
var transition = Ember.Object.create();

module('DirtyConfirmRouteMixin', {
  beforeEach: function() {
    route = Ember.Route.createWithMixins(DirtyConfirmRouteMixin, {
      currentModel: Ember.Object.create(),
      dirtyRelationships: ['test'],
      dirtyMessage: 'this is a dirty message'
    });
  }
});

test('isDirtyConfirmEnabled enabled by default', function(assert) {
  assert.ok(route.isDirtyConfirmEnabled);
});

test('isDirtyConfirmEnabled false, willTransition false, doesn\'t call checkModelForDirty', function(assert) {
  route.isDirtyConfirmEnabled = false;
  var called;
  route.checkModelForDirty = function() {
    called = true;
  };

  var result = route.send('willTransition');

  assert.ok(!called);
  assert.ok(!result);
});

test('willTransition calls checkModelForDirty', function(assert) {
  var args;
  route.checkModelForDirty = function() {
    args = arguments;
  };

  var result = route.send('willTransition', transition);

  assert.equal(args[0], route.currentModel);
  assert.equal(args[1], route.dirtyRelationships);
  assert.equal(args[2], route.dirtyMessage);
  assert.equal(args[3], transition);
  assert.ok(!result);
});

test('checkModelForDirty returns ROLLBACK, willTransition returns true', function(assert) {
  route.checkModelForDirty = function() {
    return ROLLBACK;
  };

  var result = route.send('willTransition');

  assert.ok(result);
});

test('checkModelForDirty returns BUBBLE, willTransition returns true', function(assert) {
  route.checkModelForDirty = function() {
    return BUBBLE;
  };

  var result = route.send('willTransition');

  assert.ok(result);
});

test('dirtyModel overrides currentModel', function(assert) {
  var model;
  route.dirtyModel = Ember.Object.create();
  route.checkModelForDirty = function() {
    model = arguments[0];
  };

  var result = route.send('willTransition');

  assert.equal(model, route.dirtyModel);
  assert.notEqual(model, route.currentModel);
  assert.ok(!result);
});

test('model is empty array, willTransition returns true', function(assert) {
  route.dirtyModel = [];
  var called;
  route.checkModelForDirty = function() {
    called = true;
  };

  var result = route.send('willTransition');

  assert.ok(!called);
  assert.ok(result);
});

test('model is non-empty array, checkModelForDirty is called', function(assert) {
  route.dirtyModel = [Ember.Object.create()];
  var args;
  route.checkModelForDirty = function() {
    args = arguments;
  };

  var result = route.send('willTransition', transition);

  assert.equal(args[0], route.dirtyModel[0]);
  assert.equal(args[1], route.dirtyRelationships);
  assert.equal(args[2], route.dirtyMessage);
  assert.equal(args[3], transition);
  assert.ok(!args[4]);
  assert.ok(result);
});

test('model is array and checkModelForDirty returns ABORT, checkModelForDirty called once', function(assert) {
  route.dirtyModel = [Ember.Object.create(), Ember.Object.create()];
  var count = 0;
  route.checkModelForDirty = function() {
    count++;
    return ABORT;
  };

  var result = route.send('willTransition');

  assert.strictEqual(count, 1);
  assert.ok(!result);
});

test('model is array and checkModelForDirty returns ROLLBACK, checkModelForDirty called twice', function(assert) {
  route.dirtyModel = [Ember.Object.create(), Ember.Object.create()];
  var count = 0;
  var args;
  route.checkModelForDirty = function() {
    count++;
    args = arguments;
    return ROLLBACK;
  };

  var result = route.send('willTransition');

  assert.strictEqual(count, 2);
  assert.ok(args[4]);
  assert.ok(result);
});

test('uses default dirtyMessage', function(assert) {
  var expected = 'Leaving this page will lose your changes. Are you sure?';

  route = Ember.Route.createWithMixins(DirtyConfirmRouteMixin, {
    currentModel: Ember.Object.create()
  });

  assert.strictEqual(route.get('dirtyMessage'), expected);

  var args;
  route.checkModelForDirty = function() {
    args = arguments;
  };

  route.send('willTransition');

  assert.strictEqual(args[2], expected);
});
