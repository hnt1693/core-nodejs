const UserMapping = {
    userId: "id",
    username: "username",
    email: "email",
    type: "type",
    createdAt: "created_at",
    updatedAt: "updated_at",
    deleteAt: "delete_at",
    avatar: "avatar_id",
    password: "password",
    fullName:"fullname"
}

const FileMapping = {
    id: "id",
    path: "path",
    originalName: "original_name",
    mimeType: "mimetype",
    encoding: "encoding",
    destination: "destination",
    size: "size",
    fileName: "filename"
}


const getColumns = (fields, mapping) => {
    let columns = "";
    fields.forEach(f => {
        f = f.trim();
        if (f === "*") {
            columns += '* '
        } else {
            if (mapping.hasOwnProperty(f)) {
                columns += mapping[f];
                columns += ' as';
                columns += ` ${f},`
            } else {
                columns += `null`;
                columns += ' as';
                columns += ` '${f}',`
            }
        }

    })
    return columns.substr(0, columns.length - 1);
}

module.exports = {getColumns, UserMapping, FileMapping}
