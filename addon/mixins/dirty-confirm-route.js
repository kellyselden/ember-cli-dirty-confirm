import Ember from 'ember';
import checkModelForDirty from '../utils/check-model-for-dirty';

var ABORT = 0;
var ROLLBACK = 1;
var BUBBLE = 2;

export default Ember.Mixin.create({
  checkModelForDirty: checkModelForDirty,
  isDirtyConfirmEnabled: true,

  checkDirtyModel: function(transition) {
    if (!this.get('isDirtyConfirmEnabled')) {
      return;
    }

    // dirtyModel can be used for a property that isn't the route's main model
    var model = this.get('dirtyModel') || this.currentModel;
    var dirtyMessage = this.get('dirtyMessage');

    if (Object.prototype.toString.call(model) === '[object Array]') {
      var continueRollingBack;
      for (var i = 0; i < model.length; i++) {
        switch (this.checkModelForDirty(model[i], dirtyMessage, transition, continueRollingBack)) {
          case ABORT: return;
          // if one model was chosen to rollback, roll them all back
          case ROLLBACK: continueRollingBack = true;
        }
      }
      return true;
    }

    switch (this.checkModelForDirty(model, dirtyMessage, transition)) {
      case ROLLBACK: return true;
      case BUBBLE: return true;
    }
  },

  actions: {
    willTransition: function(transition) {
      return this.checkDirtyModel(transition);
    }
  }
});
