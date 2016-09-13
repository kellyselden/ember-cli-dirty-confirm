#ember-cli-dirty-confirm

[![npm version](https://badge.fury.io/js/ember-cli-dirty-confirm.svg)](https://badge.fury.io/js/ember-cli-dirty-confirm)
[![Build Status](https://travis-ci.org/kellyselden/ember-cli-dirty-confirm.svg)](https://travis-ci.org/kellyselden/ember-cli-dirty-confirm)
[![Code Climate](https://codeclimate.com/github/kellyselden/ember-cli-dirty-confirm/badges/gpa.svg)](https://codeclimate.com/github/kellyselden/ember-cli-dirty-confirm)

A dirty model route transition aborter. It will show a confirm dialog giving you a chance to cancel a route change. If you agree, it will rollback your model.

##Usage

`ember install ember-cli-dirty-confirm`
```javascript
import DirtyConfirmRouteMixin from 'ember-cli-dirty-confirm/mixins/dirty-confirm-route';

export default Ember.Route.extend(DirtyConfirmRouteMixin, {
  // optional, the default message is "Leaving this page will lose your changes. Are you sure?"
  dirtyMessage: "Please don't go!",
  // optional, temporarily disable the message
  isDirtyConfirmEnabled: false
});
```

It also exposes an action called `toggleDirtyConfirm`, so you can toggle off from outside the route.
