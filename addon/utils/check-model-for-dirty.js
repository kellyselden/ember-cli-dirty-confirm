var ABORT = 0;
var ROLLBACK = 1;
var BUBBLE = 2;

export default function checkModelForDirty(model, dirtyMessage, transition, continueRollingBack) {
  if (model.get('isDirty') && !model.get('isSaving')) {
    // continueRollingBack if an earlier model in a collection was rolled back
    if (!continueRollingBack &&
        !confirm(dirtyMessage || 'Leaving this page will lose your changes. Are you sure?')) {
      if (transition) {
        transition.abort();
      }

      return ABORT;
    }
    model.rollback();

    return ROLLBACK;
  }

  return BUBBLE;
}
