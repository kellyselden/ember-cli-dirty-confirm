import Ember from 'ember';
import DirtyConfirmRouteMixin from 'ember-cli-dirty-confirm/mixins/dirty-confirm-route';
import { module, test } from 'qunit';
import sinon from 'sinon';

const {
  Route,
  Object: emberObject,
  A: newArray,
  get, set
} = Ember;

const ABORT = 0;
const ROLLBACK = 1;
const BUBBLE = 2;

let sandbox;
let route;
let checkModelForDirty;
const transition = emberObject.create();

module('DirtyConfirmRouteMixin', {
  beforeEach() {
    sandbox = sinon.sandbox.create();

    checkModelForDirty = sandbox.stub();

    route = Route.extend(DirtyConfirmRouteMixin, {
      currentModel: emberObject.create(),
      dirtyRelationships: ['test'],
      dirtyMessage: 'this is a dirty message',

      checkModelForDirty
    }).create();
  },
  afterEach() {
    sandbox.restore();
  }
});

test('isDirtyConfirmEnabled enabled by default', function(assert) {
  assert.ok(route.isDirtyConfirmEnabled);
});

test('isDirtyConfirmEnabled false, willTransition false, doesn\'t call checkModelForDirty', function(assert) {
  route.isDirtyConfirmEnabled = false;

  let result = route.send('willTransition');

  assert.deepEqual(checkModelForDirty.args, []);
  assert.ok(!result);
});

test('toggleDirtyConfirm toggles isDirtyConfirmEnabled', function(assert) {
  route.send('toggleDirtyConfirm');

  assert.notOk(route.isDirtyConfirmEnabled);

  route.send('toggleDirtyConfirm');

  assert.ok(route.isDirtyConfirmEnabled);
});

test('willTransition calls checkModelForDirty', function(assert) {
  let result = route.send('willTransition', transition);

  assert.deepEqual(checkModelForDirty.args, [[
    route.currentModel,
    route.dirtyRelationships,
    route.dirtyMessage,
    transition
  ]]);
  assert.ok(!result);
});

test('checkModelForDirty returns ROLLBACK, willTransition returns true', function(assert) {
  checkModelForDirty.returns(ROLLBACK);

  let result = route.send('willTransition');

  assert.ok(result);
});

test('checkModelForDirty returns BUBBLE, willTransition returns true', function(assert) {
  checkModelForDirty.returns(BUBBLE);

  let result = route.send('willTransition');

  assert.ok(result);
});

test('dirtyModel overrides currentModel', function(assert) {
  set(route, 'dirtyModel', emberObject.create());

  let result = route.send('willTransition');

  let model = checkModelForDirty.args[0][0];
  assert.equal(model, route.dirtyModel);
  assert.notEqual(model, route.currentModel);
  assert.ok(!result);
});

test('model is empty array, willTransition returns true', function(assert) {
  set(route, 'dirtyModel', []);

  let result = route.send('willTransition');

  assert.deepEqual(checkModelForDirty.args, []);
  assert.ok(result);
});

test('model is non-empty native array, checkModelForDirty is called', function(assert) {
  let dirtyModel = emberObject.create({ name: 'name test' });
  set(route, 'dirtyModel', [dirtyModel]);

  let result = route.send('willTransition', transition);

  assert.deepEqual(checkModelForDirty.args, [[
    dirtyModel,
    get(route, 'dirtyRelationships'),
    get(route, 'dirtyMessage'),
    transition,
    undefined
  ]]);
  assert.ok(result);
});

test('model is non-empty ember array, checkModelForDirty is called', function(assert) {
  let dirtyModel = emberObject.create({ name: 'name test' });
  set(route, 'dirtyModel', newArray([dirtyModel]));

  let result = route.send('willTransition', transition);

  assert.deepEqual(checkModelForDirty.args, [[
    dirtyModel,
    get(route, 'dirtyRelationships'),
    get(route, 'dirtyMessage'),
    transition,
    undefined
  ]]);
  assert.ok(result);
});

test('model is array and checkModelForDirty returns ABORT, checkModelForDirty called once', function(assert) {
  set(route, 'dirtyModel', [emberObject.create(), emberObject.create()]);
  checkModelForDirty.returns(ABORT);

  let result = route.send('willTransition');

  assert.strictEqual(checkModelForDirty.callCount, 1);
  assert.ok(!result);
});

test('model is array and checkModelForDirty returns ROLLBACK, checkModelForDirty called twice', function(assert) {
  set(route, 'dirtyModel', [emberObject.create(), emberObject.create()]);
  checkModelForDirty.returns(ROLLBACK);

  let result = route.send('willTransition');

  assert.strictEqual(checkModelForDirty.callCount, 2);
  assert.strictEqual(checkModelForDirty.args[1][4], true);
  assert.ok(result);
});

test('uses default dirtyMessage', function(assert) {
  let expected = 'Leaving this page will lose your changes. Are you sure?';

  route = Route.extend(DirtyConfirmRouteMixin, {
    currentModel: emberObject.create(),

    checkModelForDirty
  }).create();

  assert.strictEqual(get(route, 'dirtyMessage'), expected);

  route.send('willTransition');

  assert.strictEqual(checkModelForDirty.args[0][2], expected);
});
