#ember-cli-dirty-confirm

A dirty model route transition aborter. It will show a confirm dialog giving you a chance to cancel a route change. If you agree, it will rollback your model.

##Usage

`npm install --save-dev ember-cli-dirty-confirm`
```javascript
import DirtyConfirmRouteMixin from 'ember-cli-dirty-confirm/mixins/dirty-confirm-route';

export default Ember.Route.extend(DirtyConfirmRouteMixin, {
  //optional, the default message is "Leaving this page will lose your changes. Are you sure?"
  dirtyMessage: 'Please don\'t go!',
  //optional, temporarily disable the message
  isDirtyConfirmEnabled: false
});
```
