"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationType = exports.Status = exports.Role = exports.Boolean = void 0;
var Boolean;
(function (Boolean) {
    Boolean[Boolean["True"] = 1] = "True";
    Boolean[Boolean["False"] = 0] = "False";
})(Boolean = exports.Boolean || (exports.Boolean = {}));
var Role;
(function (Role) {
    Role["CareReceiver"] = "IAmFollowing";
    Role["CareGiver"] = "MyFollowers";
})(Role = exports.Role || (exports.Role = {}));
var Status;
(function (Status) {
    Status["Accepted"] = "accepted";
    Status["Pending"] = "pending";
    Status["Rejected"] = "rejected";
})(Status = exports.Status || (exports.Status = {}));
var InvitationType;
(function (InvitationType) {
    InvitationType[InvitationType["MyFollower"] = 1] = "MyFollower";
    InvitationType[InvitationType["IAmFollowing"] = 2] = "IAmFollowing";
})(InvitationType = exports.InvitationType || (exports.InvitationType = {}));
//# sourceMappingURL=enum.js.map