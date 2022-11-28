const UserMapping = {
    userId: "user_id",
    customerId: "customer_id",
    username: "username",
    email: "email",
    status: "status",
    type: "type",
    createdAt: "created_at",
    updatedAt: "updated_at",
    deleteAt: "delete_at",
    initialAdminType: "initial_admin_type",
    '*': "*"
}

const getColumns = (fields, mapping) => {
    let columns = "";
    fields.forEach(f => {
        if (mapping.hasOwnProperty(f)) {
            columns += mapping[f];
            columns += ' as';
            columns += ` ${f},`
        }
    })
    return columns.substr(0, columns.length - 1);
}

module.exports = {getColumns, UserMapping}
