const { Permit } = require('permitio');
const ExpressError = require("./ExpressError");

const permit = new Permit({
    pdp: "http://localhost:7766",
    token: process.env.PERMIT_API_KEY,
});


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

module.exports.createPermitResourceInstanceAndAssignRole = async (username, resourceKey, role) => {
    await permit.api.roleAssignments.assign({
        user: username,
        role: role,
        resource_instance: `${resourceKey}:cred`,
        tenant: "default",
      }).then(() => {
        console.log("successfully assigned permit role");
        return;
      }).catch(err => {
        throw new ExpressError(`error assigning role Permit: ${err}`, 500)
      })
}

module.exports.checkPermission = async (username, action, resourceId, resourceInstance) => {
    const check = await permit.check(username, action, {
        type: resourceId,
        key:resourceInstance
    });
    console.log(`this is result of check:: ${check} , for action ${action} `);
    return {check:check};
}