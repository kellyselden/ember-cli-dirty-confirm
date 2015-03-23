import Ember from 'ember';
import DirtyConfirmRouteMixin from 'ember-cli-dirty-confirm/mixins/dirty-confirm-route';
import { module, test } from 'qunit';

var mixin;

module('DirtyConfirmRouteMixin', {
  beforeEach: function() {
    mixin = Ember.Object.extend(DirtyConfirmRouteMixin).create();
  }
});

test('isDirtyConfirmEnabled enabled by default', function(assert) {
  assert.ok(mixin.isDirtyConfirmEnabled);
});
