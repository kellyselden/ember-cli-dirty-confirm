import Ember from 'ember';
import DirtyConfirmRouteMixin from '../../../mixins/dirty-confirm-route';
import { module, test } from 'qunit';

module('DirtyConfirmRouteMixin');

// Replace this with your real tests.
test('it works', function(assert) {
  var DirtyConfirmRouteObject = Ember.Object.extend(DirtyConfirmRouteMixin);
  var subject = DirtyConfirmRouteObject.create();
  assert.ok(subject);
});
