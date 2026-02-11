import AccessControl "./access-control";
import Prim "mo:prim";
import Debug "mo:base/Debug";

module {
  // Initialize auth (first caller becomes admin, others become users)
  public func _initializeAccessControlWithSecret(accessControlState : AccessControl.AccessControlState, caller : Principal, userSecret : Text) : async () {
    switch (Prim.envVar<system>("CAFFEINE_ADMIN_TOKEN")) {
      case (null) {
        Debug.trap("CAFFEINE_ADMIN_TOKEN environment variable is not set");
      };
      case (?adminToken) {
        AccessControl.initialize(accessControlState, caller, adminToken, userSecret);
      };
    };
  };

  public func getCallerUserRole(accessControlState : AccessControl.AccessControlState, caller : Principal) : AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public func assignCallerUserRole(accessControlState : AccessControl.AccessControlState, caller : Principal, user : Principal, role : AccessControl.UserRole) {
    // Admin-only check happens inside
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public func isCallerAdmin(accessControlState : AccessControl.AccessControlState, caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };
};
