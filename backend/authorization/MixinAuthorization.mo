import AccessControl "./access-control";

module {
  // Initialize auth - first caller becomes admin if they provide the correct secret
  // SEC-009: Use a known admin token instead of user-provided value for both sides
  private let ADMIN_TOKEN = "CHERRY_ADMIN_2026";

  public func _initializeAccessControlWithSecret(accessControlState : AccessControl.AccessControlState, caller : Principal, userSecret : Text) : async () {
    // The userSecret is compared against the known ADMIN_TOKEN
    // Only the first non-anonymous caller providing the correct token becomes admin
    AccessControl.initialize(accessControlState, caller, ADMIN_TOKEN, userSecret);
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
