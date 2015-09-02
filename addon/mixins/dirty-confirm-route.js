import Ember from 'ember';
import checkModelForDirty from '../utils/check-model-for-dirty';

var ABORT = 0;
var ROLLBACK = 1;
var BUBBLE = 2;

const {
  computed: { oneWay },
  isArray,
  A
} = Ember;

export default Ember.Mixin.create({
  checkModelForDirty: checkModelForDirty,

  isDirtyConfirmEnabled: true,

  // dirtyModel can be used for a property that isn't the route's main model
  dirtyModel: oneWay('currentModel'),

  dirtyRelationships: [],

  dirtyMessage: 'Leaving this page will lose your changes. Are you sure?',

  checkDirtyConfirm(transition) {
    if (!this.get('isDirtyConfirmEnabled')) {
      return;
    }

    var model = this.get('dirtyModel');
    var dirtyRelationships = this.get('dirtyRelationships');
    var dirtyMessage = this.get('dirtyMessage');

    if (isArray(model)) {
      if (Array.isArray(model)) {
        model = new A(model);
      }
      var continueRollingBack;
      for (var i = 0; i < model.length; i++) {
        switch (this.checkModelForDirty(model.objectAt(i), dirtyRelationships, dirtyMessage, transition, continueRollingBack)) {
          case ABORT: return;
          // if one model was chosen to rollback, roll them all back
          case ROLLBACK: continueRollingBack = true;
        }
      }
      return true;
    }

    switch (this.checkModelForDirty(model, dirtyRelationships, dirtyMessage, transition)) {
      case ROLLBACK: return true;
      case BUBBLE: return true;
    }
  },

  actions: {
    willTransition(transition) {
      return this.checkDirtyConfirm(transition);
    }
  }
});
