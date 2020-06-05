var CHANGE_TYPE = {};
var VISIBILITY = [ "public", "protected", "default", "private" ];
CHANGE_TYPE = {
  REMOVE_STATIC : 0,
  ADD_STATIC : 1,
  RENAME : 2,
  DOWN_VISIBILITY : 3,
  UP_VISIBILITY : 4,
  CHANGE_TYPE : 5,
  CHANGE_RETURN : 6,
  ADD_FINAL : 7,
  SIZE_OF_dPARAMETERS : 8,
  TYPE_OF_PARAMETER : 9,
  REMOVE_FINAL : 10
};

CHANGE_TYPE.DESCRIPTION = [ "remove static", "add static", "rename",
    "down visibility", "up visibility", "change type", "change return",
    "add final", "add/remove parameter", "type of parameter", "remove final" ];
