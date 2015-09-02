var ABORT = 0;
var ROLLBACK = 1;
var BUBBLE = 2;

function addDirtyModel(dirtyModels, model) {
  if (model.get('isDirty')) {
    dirtyModels.push(model);
  }
}

function getDirtyModels(model, dirtyRelationships) {
  var dirtyModels = [];
  addDirtyModel(dirtyModels, model);
  dirtyRelationships.forEach(prop => addDirtyModel(dirtyModels, model.get(prop)));
  return dirtyModels;
}

export default function checkModelForDirty(model, dirtyRelationships, dirtyMessage, transition, continueRollingBack) {
  var dirtyModels = getDirtyModels(model, dirtyRelationships);
  if (dirtyModels.length && !model.get('isSaving')) {
    // continueRollingBack if an earlier model in a collection was rolled back
    if (!continueRollingBack && !confirm(dirtyMessage)) {
      if (transition) {
        transition.abort();
      }

      return ABORT;
    }
    dirtyModels.forEach(dirtyModel => dirtyModel.rollback());

    return ROLLBACK;
  }

  return BUBBLE;
}
