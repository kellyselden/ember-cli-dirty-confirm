import Ember from 'ember';
import checkModelForDirty from 'ember-cli-dirty-confirm/utils/check-model-for-dirty';

var ABORT = 0;
var ROLLBACK = 1;
var BUBBLE = 2;

export default Ember.Mixin.create({
  isDirtyConfirmEnabled: true,
  actions: {
    willTransition: function(transition) {
      if (!this.get('isDirtyConfirmEnabled')) {
        return;
      }

      var model = this.get('dirtyModel') || this.currentModel;
      var dirtyMessage = this.get('dirtyMessage');
      if (Object.prototype.toString.call(model) === '[object Array]') {
        var continueRollingBack;
        for (var i = 0; i < model.length; i++) {
          switch (checkModelForDirty(model[i], dirtyMessage, transition, continueRollingBack)) {
            case ABORT: return;
            case ROLLBACK: continueRollingBack = true;
          }
        }
        return true;
      }
      switch (checkModelForDirty(model, dirtyMessage, transition)) {
        case ROLLBACK: return true;
        case BUBBLE: return true;
      }
    }
  }
});
