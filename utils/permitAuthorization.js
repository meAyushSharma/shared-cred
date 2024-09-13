const { Permit } = require('permitio');
const ExpressError = require("./ExpressError");


// this is for local machine
const permit = new Permit({
    pdp: "http://localhost:7766",
    token: process.env.PERMIT_API_KEY,
});

// this is for docker/containerization
// const permit = new Permit({
//   pdp: "http://host.docker.internal:7766", 
//   token: process.env.PERMIT_API_KEY,
// });

module.exports.createPermitResource = async (resourceId, resourceName) => {
    const permitResource = await permit.api.createResource(
        {
            "key": resourceId,
            "name": resourceName,
            "actions": {
                "view": {},
                "share": {},
                "delete": {},
                "edit": {},
            },
            "roles": {
                "editor": {
                    "name": "Editor",
                    "permissions": [
                        "view",
                        "edit",
                    ],
                },
                "viewer": {
                    "name": "Viewer",
                    "permissions": [
                        "view",
                    ],
                },
                "author": {
                    "name": "Author",
                    "permissions": [
                        "view",
                        "edit",
                        "delete"
                    ],
                },
                "owner": {
                  "name": "Owner",
                  "permissions": [
                    "view",
                    "edit",
                    "delete",
                    "share"
                  ]
                }
            },
        }
      ).then((resource)=>{
        console.log("successfully created permit resource");
        return;
      }).catch(err => {
        throw new ExpressError(`error creating Permit resource: ${err}`, 500)
      })

}

module.exports.createPermitUser = async (username) => {
    const permitUser = await permit.api.syncUser({
          key: username,
        }).then((user)=>{
            console.log("successfully created permit user");
            return;
        }).catch(err => {
          throw new ExpressError(`error creating Permit user: ${err}`, 500)
        });
}

module.exports.deleteUser = async (username) => {
  const response = await permit.api.deleteUser(username);
  console.log("deleted permit user response");
  return;
}

module.exports.deleteResource = async (resourceId) => {
  const response = await permit.api.deleteResource(resourceId);
  console.log("deleted permit resource response");
  return;
}

module.exports.createPermitResourceInstanceAndAssignRole = async (username, resourceKey, role) => {
    await permit.api.roleAssignments.assign({
        user: username,
        role: role,
        resource_instance: `${resourceKey}:cred`,
        tenant: "cred-manager",
      }).then(() => {
        console.log("successfully assigned permit role");
        return;
      }).catch(err => {
        throw new ExpressError(`error assigning role Permit: ${err}`, 500)
      })
}

module.exports.unassignPermitRole = async (username, resourceKey, role) => {
  const response = await permit.api.unassignRole({
    user: username,
    role: role,
    resource_instance: `${resourceKey}:cred`,
    tenant: "cred-manager"
  });
  console.log("successfully unassignrole");
  return;
}

module.exports.checkPermission = async (username, action, resourceId, resourceInstance) => {
    const check = await permit.check(username, action, {
        type: resourceId,
        key: resourceInstance
    });
    console.log(`this is result of check:: ${check} , for action ${action} `);
    return {check:check};
}