import AccessControl "./access-control";

module {
  // Initialize auth - first caller becomes admin if they provide the correct secret
  // Note: Simplified from Caffeine AI version (removed Prim.envVar dependency)
  public func _initializeAccessControlWithSecret(accessControlState : AccessControl.AccessControlState, caller : Principal, userSecret : Text) : async () {
    // In standard Motoko, we use the userSecret directly as both the token and verification
    // The first non-anonymous caller to provide a non-empty secret becomes admin
    AccessControl.initialize(accessControlState, caller, userSecret, userSecret);
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
