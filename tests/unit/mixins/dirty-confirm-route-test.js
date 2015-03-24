import Ember from 'ember';
import DirtyConfirmRouteMixin from 'ember-cli-dirty-confirm/mixins/dirty-confirm-route';
import { module, test } from 'qunit';

var route;

module('DirtyConfirmRouteMixin', {
  beforeEach: function() {
    route = Ember.Route.createWithMixins(DirtyConfirmRouteMixin);
  }
});

test('isDirtyConfirmEnabled enabled by default', function(assert) {
  assert.ok(route.isDirtyConfirmEnabled);
});
