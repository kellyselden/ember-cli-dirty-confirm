import Ember from 'ember';
import DirtyConfirmRouteMixin from 'ember-cli-dirty-confirm/mixins/dirty-confirm-route';

module('DirtyConfirmRouteMixin');

// Replace this with your real tests.
test('it works', function() {
  var DirtyConfirmRouteObject = Ember.Object.extend(DirtyConfirmRouteMixin);
  var subject = DirtyConfirmRouteObject.create();
  ok(subject);
});
