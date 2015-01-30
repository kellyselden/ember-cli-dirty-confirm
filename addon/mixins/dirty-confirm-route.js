import Ember from 'ember';

export default Ember.Mixin.create({
  actions: {
    willTransition: function(transition) {
      var model = this.currentModel;
      if (model.get('isDirty') && !model.get('isSaving')) {
        if (!confirm(this.get('dirtyMessage') || 'Leaving this page will lose your changes. Are you sure?')) {
          transition.abort();
          return;
        } else {
          model.rollback();
        }
      }
      return true;
    }
  }
});
