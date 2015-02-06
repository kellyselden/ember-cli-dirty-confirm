import Ember from 'ember';

var ABORT = 0;
var ROLLBACK = 1;
var BUBBLE = 2;

function checkModelForDirty(model, dirtyMessage, transition, continueRollingBack) {
  if (model.get('isDirty') && !model.get('isSaving')) {
    if (!continueRollingBack &&
        !confirm(dirtyMessage || 'Leaving this page will lose your changes. Are you sure?')) {
      transition.abort();
      return ABORT;
    }
    model.rollback();
    return ROLLBACK;
  }
  return BUBBLE;
}

export default Ember.Mixin.create({
  actions: {
    willTransition: function(transition) {
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
